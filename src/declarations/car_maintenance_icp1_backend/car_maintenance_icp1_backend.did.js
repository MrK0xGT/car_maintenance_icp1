export const idlFactory = ({ IDL }) => {
  const CustomerBooking = IDL.Record({
    'licensePlate' : IDL.Text,
    'nftToken' : IDL.Text,
    'slot' : IDL.Text,
    'technicianId' : IDL.Text,
    'customerId' : IDL.Principal,
    'caseId' : IDL.Nat,
  });
  const MaintenanceRecord = IDL.Record({
    'carModel' : IDL.Text,
    'entryTime' : IDL.Text,
    'repairItems' : IDL.Vec(IDL.Text),
    'progress' : IDL.Nat,
    'technicianId' : IDL.Text,
    'caseId' : IDL.Nat,
    'completedItems' : IDL.Vec(IDL.Text),
  });
  const Technician = IDL.Record({
    'id' : IDL.Text,
    'name' : IDL.Text,
    'qualifications' : IDL.Vec(IDL.Text),
    'availableSlots' : IDL.Vec(IDL.Text),
    'rating' : IDL.Nat8,
  });
  return IDL.Service({
    'addRecord' : IDL.Func(
        [IDL.Nat, IDL.Text, IDL.Text, IDL.Vec(IDL.Text), IDL.Text],
        [],
        [],
      ),
    'addTechnician' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Vec(IDL.Text), IDL.Nat8, IDL.Vec(IDL.Text)],
        [],
        [],
      ),
    'bookTechnician' : IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
    'customerBook' : IDL.Func(
        [IDL.Nat, IDL.Text, IDL.Text, IDL.Text],
        [IDL.Opt(IDL.Text)],
        [],
      ),
    'getCustomerBookings' : IDL.Func([], [IDL.Vec(CustomerBooking)], ['query']),
    'getCustomerProgress' : IDL.Func(
        [IDL.Nat],
        [IDL.Opt(MaintenanceRecord)],
        ['query'],
      ),
    'getRecords' : IDL.Func([], [IDL.Vec(MaintenanceRecord)], ['query']),
    'getTechnicians' : IDL.Func([], [IDL.Vec(Technician)], ['query']),
    'payWithCrypto' : IDL.Func([IDL.Nat, IDL.Nat], [IDL.Opt(IDL.Text)], []),
    'updateProgress' : IDL.Func([IDL.Nat, IDL.Text], [IDL.Bool], []),
  });
};
export const init = ({ IDL }) => { return []; };
