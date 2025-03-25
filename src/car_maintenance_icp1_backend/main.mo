import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Nat8 "mo:base/Nat8";
import Option "mo:base/Option";
import Debug "mo:base/Debug";
import Hash "mo:base/Hash"; // 導入 Hash 模塊

actor {
  type Technician = {
    id: Text;
    name: Text;
    qualifications: [Text];
    rating: Nat8;
    availableSlots: [Text];
  };

  type MaintenanceRecord = {
    caseId: Nat;
    entryTime: Text;
    carModel: Text;
    repairItems: [Text];
    technicianId: Text;
    progress: Nat;
    completedItems: [Text];
  };

  type CustomerBooking = {
    caseId: Nat;
    customerId: Principal;
    technicianId: Text;
    slot: Text;
    licensePlate: Text;
    nftToken: Text;
  };

  type Payment = {
    caseId: Nat;
    customerId: Principal;
    amount: Nat;
    nftReceipt: Text;
  };

  // 自定義 Nat 類型的哈希函數
  func natHash(n: Nat) : Hash.Hash {
    // 將 Nat 轉換為 Text，然後使用 Text.hash
    let text = Nat.toText(n);
    Text.hash(text)
  };

  // 初始化 HashMap，使用自定義的 natHash 函數
  let technicians = HashMap.HashMap<Text, Technician>(0, Text.equal, Text.hash);
  let records = HashMap.HashMap<Nat, MaintenanceRecord>(0, Nat.equal, natHash);
  let customerBookings = HashMap.HashMap<Nat, CustomerBooking>(0, Nat.equal, natHash);
  let payments = HashMap.HashMap<Nat, Payment>(0, Nat.equal, natHash);

  public shared(msg) func addTechnician(id: Text, name: Text, qualifications: [Text], rating: Nat8, availableSlots: [Text]) : async () {
    let technician: Technician = {
      id = id;
      name = name;
      qualifications = qualifications;
      rating = rating;
      availableSlots = availableSlots;
    };
    technicians.put(id, technician);
  };

  public query func getTechnicians() : async [Technician] {
    Iter.toArray(technicians.vals());
  };

  public shared func addRecord(caseId: Nat, entryTime: Text, carModel: Text, repairItems: [Text], technicianId: Text) : async () {
    let record: MaintenanceRecord = {
      caseId = caseId;
      entryTime = entryTime;
      carModel = carModel;
      repairItems = repairItems;
      technicianId = technicianId;
      progress = 0;
      completedItems = [];
    };
    records.put(caseId, record);
  };

  public query func getRecords() : async [MaintenanceRecord] {
    Iter.toArray(records.vals());
  };

  public shared(msg) func bookTechnician(techId: Text, slot: Text) : async Bool {
    switch (technicians.get(techId)) {
      case (null) { return false };
      case (?technician) {
        let availableSlots = Array.filter(technician.availableSlots, func (s: Text) : Bool { s != slot });
        if (availableSlots.size() == technician.availableSlots.size()) {
          return false;
        };
        let updatedTechnician: Technician = {
          id = technician.id;
          name = technician.name;
          qualifications = technician.qualifications;
          rating = technician.rating;
          availableSlots = availableSlots;
        };
        technicians.put(techId, updatedTechnician);
        return true;
      };
    };
  };

  public shared(msg) func customerBook(caseId: Nat, techId: Text, slot: Text, licensePlate: Text) : async ?Text {
    Debug.print("customerBook called with caseId: " # Nat.toText(caseId) # ", techId: " # techId # ", slot: " # slot # ", licensePlate: " # licensePlate);

    // 檢查技師是否存在
    switch (technicians.get(techId)) {
      case (null) {
        Debug.print("Technician not found: " # techId);
        return null;
      };
      case (?technician) {
        // 檢查時間段是否可用
        Debug.print("Technician available slots: " # debug_show(technician.availableSlots));
        if (technician.availableSlots.size() == 0) {
          Debug.print("No available slots for technician: " # techId);
          return null;
        };

        let slotExists = Array.find(technician.availableSlots, func (s: Text) : Bool { s == slot });
        switch (slotExists) {
          case (null) {
            Debug.print("Slot not available: " # slot);
            return null;
          };
          case (?_) {
            let availableSlots = Array.filter(technician.availableSlots, func (s: Text) : Bool { s != slot });
            let updatedTechnician: Technician = {
              id = technician.id;
              name = technician.name;
              qualifications = technician.qualifications;
              rating = technician.rating;
              availableSlots = availableSlots;
            };
            technicians.put(techId, updatedTechnician);

            let booking: CustomerBooking = {
              caseId = caseId;
              customerId = msg.caller;
              technicianId = techId;
              slot = slot;
              licensePlate = licensePlate;
              nftToken = "NFT-" # techId # "-" # Nat.toText(caseId);
            };
            customerBookings.put(caseId, booking);

            Debug.print("Booking successful: " # booking.nftToken);
            return ?booking.nftToken;
          };
        };
      };
    };
  };

  public query func getCustomerProgress(caseId: Nat) : async ?MaintenanceRecord {
    switch (records.get(caseId)) {
      case (null) { return null };
      case (?record) {
        switch (customerBookings.get(caseId)) {
          case (null) { return null };
          case (?booking) {
            return ?record;
          };
        };
      };
    };
  };

  public shared(msg) func updateProgress(caseId: Nat, completedItem: Text) : async Bool {
    switch (records.get(caseId)) {
      case (null) { return false };
      case (?record) {
        let updatedCompletedItems = Array.append(record.completedItems, [completedItem]);
        let progress = (updatedCompletedItems.size() * 100) / record.repairItems.size();
        let updatedRecord: MaintenanceRecord = {
          caseId = record.caseId;
          entryTime = record.entryTime;
          carModel = record.carModel;
          repairItems = record.repairItems;
          technicianId = record.technicianId;
          progress = progress;
          completedItems = updatedCompletedItems;
        };
        records.put(caseId, updatedRecord);
        return true;
      };
    };
  };

  public shared(msg) func payWithCrypto(caseId: Nat, amount: Nat) : async ?Text {
    switch (records.get(caseId)) {
      case (null) { return null };
      case (?record) {
        switch (customerBookings.get(caseId)) {
          case (null) { return null };
          case (?booking) {
            if (booking.customerId != msg.caller) {
              return null;
            };
            let payment: Payment = {
              caseId = caseId;
              customerId = msg.caller;
              amount = amount;
              nftReceipt = "NFT-Receipt-" # Nat.toText(caseId) # "-" # record.technicianId;
            };
            payments.put(caseId, payment);
            return ?payment.nftReceipt;
          };
        };
      };
    };
  };

  public query(msg) func getCustomerBookings() : async [CustomerBooking] {
    let bookings = Iter.toArray(customerBookings.vals());
    Array.filter(bookings, func (booking: CustomerBooking) : Bool {
      booking.customerId == msg.caller
    });
  };
};