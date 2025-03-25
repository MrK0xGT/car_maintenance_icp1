import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface CustomerBooking {
  'licensePlate' : string,
  'nftToken' : string,
  'slot' : string,
  'technicianId' : string,
  'customerId' : Principal,
  'caseId' : bigint,
}
export interface MaintenanceRecord {
  'carModel' : string,
  'entryTime' : string,
  'repairItems' : Array<string>,
  'progress' : bigint,
  'technicianId' : string,
  'caseId' : bigint,
  'completedItems' : Array<string>,
}
export interface Technician {
  'id' : string,
  'name' : string,
  'qualifications' : Array<string>,
  'availableSlots' : Array<string>,
  'rating' : number,
}
export interface _SERVICE {
  'addRecord' : ActorMethod<
    [bigint, string, string, Array<string>, string],
    undefined
  >,
  'addTechnician' : ActorMethod<
    [string, string, Array<string>, number, Array<string>],
    undefined
  >,
  'bookTechnician' : ActorMethod<[string, string], boolean>,
  'customerBook' : ActorMethod<[bigint, string, string, string], [] | [string]>,
  'getCustomerBookings' : ActorMethod<[], Array<CustomerBooking>>,
  'getCustomerProgress' : ActorMethod<[bigint], [] | [MaintenanceRecord]>,
  'getRecords' : ActorMethod<[], Array<MaintenanceRecord>>,
  'getTechnicians' : ActorMethod<[], Array<Technician>>,
  'payWithCrypto' : ActorMethod<[bigint, bigint], [] | [string]>,
  'updateProgress' : ActorMethod<[bigint, string], boolean>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
