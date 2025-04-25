import { Writer, Reader } from "as-proto";

export namespace fund {
  export class global_vars {
    static encode(message: global_vars, writer: Writer): void {
      if (message.fee != 0) {
        writer.uint32(8);
        writer.uint64(message.fee);
      }

      if (message.total_projects != 0) {
        writer.uint32(16);
        writer.uint32(message.total_projects);
      }

      const unique_name_payment_times = message.payment_times;
      if (unique_name_payment_times.length !== 0) {
        for (let i = 0; i < unique_name_payment_times.length; ++i) {
          writer.uint32(24);
          writer.uint64(unique_name_payment_times[i]);
        }
      }

      if (message.remaining_balance != 0) {
        writer.uint32(32);
        writer.uint64(message.remaining_balance);
      }
    }

    static decode(reader: Reader, length: i32): global_vars {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new global_vars();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.fee = reader.uint64();
            break;

          case 2:
            message.total_projects = reader.uint32();
            break;

          case 3:
            message.payment_times.push(reader.uint64());
            break;

          case 4:
            message.remaining_balance = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    fee: u64;
    total_projects: u32;
    payment_times: Array<u64>;
    remaining_balance: u64;

    constructor(
      fee: u64 = 0,
      total_projects: u32 = 0,
      payment_times: Array<u64> = [],
      remaining_balance: u64 = 0
    ) {
      this.fee = fee;
      this.total_projects = total_projects;
      this.payment_times = payment_times;
      this.remaining_balance = remaining_balance;
    }
  }

  export class submit_project_arguments {
    static encode(message: submit_project_arguments, writer: Writer): void {
      const unique_name_creator = message.creator;
      if (unique_name_creator !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_creator);
      }

      const unique_name_beneficiary = message.beneficiary;
      if (unique_name_beneficiary !== null) {
        writer.uint32(18);
        writer.bytes(unique_name_beneficiary);
      }

      const unique_name_title = message.title;
      if (unique_name_title !== null) {
        writer.uint32(26);
        writer.string(unique_name_title);
      }

      const unique_name_description = message.description;
      if (unique_name_description !== null) {
        writer.uint32(34);
        writer.string(unique_name_description);
      }

      if (message.monthly_payment != 0) {
        writer.uint32(40);
        writer.uint64(message.monthly_payment);
      }

      if (message.start_date != 0) {
        writer.uint32(48);
        writer.uint64(message.start_date);
      }

      if (message.end_date != 0) {
        writer.uint32(56);
        writer.uint64(message.end_date);
      }

      if (message.fee != 0) {
        writer.uint32(64);
        writer.uint64(message.fee);
      }
    }

    static decode(reader: Reader, length: i32): submit_project_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new submit_project_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.creator = reader.bytes();
            break;

          case 2:
            message.beneficiary = reader.bytes();
            break;

          case 3:
            message.title = reader.string();
            break;

          case 4:
            message.description = reader.string();
            break;

          case 5:
            message.monthly_payment = reader.uint64();
            break;

          case 6:
            message.start_date = reader.uint64();
            break;

          case 7:
            message.end_date = reader.uint64();
            break;

          case 8:
            message.fee = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    creator: Uint8Array | null;
    beneficiary: Uint8Array | null;
    title: string | null;
    description: string | null;
    monthly_payment: u64;
    start_date: u64;
    end_date: u64;
    fee: u64;

    constructor(
      creator: Uint8Array | null = null,
      beneficiary: Uint8Array | null = null,
      title: string | null = null,
      description: string | null = null,
      monthly_payment: u64 = 0,
      start_date: u64 = 0,
      end_date: u64 = 0,
      fee: u64 = 0
    ) {
      this.creator = creator;
      this.beneficiary = beneficiary;
      this.title = title;
      this.description = description;
      this.monthly_payment = monthly_payment;
      this.start_date = start_date;
      this.end_date = end_date;
      this.fee = fee;
    }
  }

  @unmanaged
  export class submit_project_result {
    static encode(message: submit_project_result, writer: Writer): void {}

    static decode(reader: Reader, length: i32): submit_project_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new submit_project_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    constructor() {}
  }

  export class project {
    static encode(message: project, writer: Writer): void {
      if (message.id != 0) {
        writer.uint32(8);
        writer.uint32(message.id);
      }

      const unique_name_creator = message.creator;
      if (unique_name_creator !== null) {
        writer.uint32(18);
        writer.bytes(unique_name_creator);
      }

      const unique_name_beneficiary = message.beneficiary;
      if (unique_name_beneficiary !== null) {
        writer.uint32(26);
        writer.bytes(unique_name_beneficiary);
      }

      const unique_name_title = message.title;
      if (unique_name_title !== null) {
        writer.uint32(34);
        writer.string(unique_name_title);
      }

      const unique_name_description = message.description;
      if (unique_name_description !== null) {
        writer.uint32(42);
        writer.string(unique_name_description);
      }

      if (message.monthly_payment != 0) {
        writer.uint32(48);
        writer.uint64(message.monthly_payment);
      }

      if (message.start_date != 0) {
        writer.uint32(56);
        writer.uint64(message.start_date);
      }

      if (message.end_date != 0) {
        writer.uint32(64);
        writer.uint64(message.end_date);
      }

      if (message.status != 0) {
        writer.uint32(72);
        writer.int32(message.status);
      }

      if (message.total_votes != 0) {
        writer.uint32(80);
        writer.uint64(message.total_votes);
      }

      const unique_name_votes = message.votes;
      if (unique_name_votes.length !== 0) {
        for (let i = 0; i < unique_name_votes.length; ++i) {
          writer.uint32(88);
          writer.uint64(unique_name_votes[i]);
        }
      }
    }

    static decode(reader: Reader, length: i32): project {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new project();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.id = reader.uint32();
            break;

          case 2:
            message.creator = reader.bytes();
            break;

          case 3:
            message.beneficiary = reader.bytes();
            break;

          case 4:
            message.title = reader.string();
            break;

          case 5:
            message.description = reader.string();
            break;

          case 6:
            message.monthly_payment = reader.uint64();
            break;

          case 7:
            message.start_date = reader.uint64();
            break;

          case 8:
            message.end_date = reader.uint64();
            break;

          case 9:
            message.status = reader.int32();
            break;

          case 10:
            message.total_votes = reader.uint64();
            break;

          case 11:
            message.votes.push(reader.uint64());
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    id: u32;
    creator: Uint8Array | null;
    beneficiary: Uint8Array | null;
    title: string | null;
    description: string | null;
    monthly_payment: u64;
    start_date: u64;
    end_date: u64;
    status: project_status;
    total_votes: u64;
    votes: Array<u64>;

    constructor(
      id: u32 = 0,
      creator: Uint8Array | null = null,
      beneficiary: Uint8Array | null = null,
      title: string | null = null,
      description: string | null = null,
      monthly_payment: u64 = 0,
      start_date: u64 = 0,
      end_date: u64 = 0,
      status: project_status = 0,
      total_votes: u64 = 0,
      votes: Array<u64> = []
    ) {
      this.id = id;
      this.creator = creator;
      this.beneficiary = beneficiary;
      this.title = title;
      this.description = description;
      this.monthly_payment = monthly_payment;
      this.start_date = start_date;
      this.end_date = end_date;
      this.status = status;
      this.total_votes = total_votes;
      this.votes = votes;
    }
  }

  @unmanaged
  export class existence {
    static encode(message: existence, writer: Writer): void {}

    static decode(reader: Reader, length: i32): existence {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new existence();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    constructor() {}
  }

  @unmanaged
  export class vote_info {
    static encode(message: vote_info, writer: Writer): void {
      if (message.expiration != 0) {
        writer.uint32(8);
        writer.uint64(message.expiration);
      }

      if (message.weight != 0) {
        writer.uint32(16);
        writer.uint32(message.weight);
      }
    }

    static decode(reader: Reader, length: i32): vote_info {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new vote_info();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.expiration = reader.uint64();
            break;

          case 2:
            message.weight = reader.uint32();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    expiration: u64;
    weight: u32;

    constructor(expiration: u64 = 0, weight: u32 = 0) {
      this.expiration = expiration;
      this.weight = weight;
    }
  }

  export class set_votes_koinos_fund_arguments {
    static encode(
      message: set_votes_koinos_fund_arguments,
      writer: Writer
    ): void {
      const unique_name_account = message.account;
      if (unique_name_account !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_account);
      }

      if (message.votes_koinos_fund != false) {
        writer.uint32(16);
        writer.bool(message.votes_koinos_fund);
      }
    }

    static decode(
      reader: Reader,
      length: i32
    ): set_votes_koinos_fund_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new set_votes_koinos_fund_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.account = reader.bytes();
            break;

          case 2:
            message.votes_koinos_fund = reader.bool();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    account: Uint8Array | null;
    votes_koinos_fund: bool;

    constructor(
      account: Uint8Array | null = null,
      votes_koinos_fund: bool = false
    ) {
      this.account = account;
      this.votes_koinos_fund = votes_koinos_fund;
    }
  }

  export class update_vote_arguments {
    static encode(message: update_vote_arguments, writer: Writer): void {
      const unique_name_voter = message.voter;
      if (unique_name_voter !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_voter);
      }

      if (message.project_id != 0) {
        writer.uint32(16);
        writer.uint32(message.project_id);
      }

      if (message.weight != 0) {
        writer.uint32(24);
        writer.uint32(message.weight);
      }
    }

    static decode(reader: Reader, length: i32): update_vote_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new update_vote_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.voter = reader.bytes();
            break;

          case 2:
            message.project_id = reader.uint32();
            break;

          case 3:
            message.weight = reader.uint32();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    voter: Uint8Array | null;
    project_id: u32;
    weight: u32;

    constructor(
      voter: Uint8Array | null = null,
      project_id: u32 = 0,
      weight: u32 = 0
    ) {
      this.voter = voter;
      this.project_id = project_id;
      this.weight = weight;
    }
  }

  @unmanaged
  export class update_vote_result {
    static encode(message: update_vote_result, writer: Writer): void {}

    static decode(reader: Reader, length: i32): update_vote_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new update_vote_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    constructor() {}
  }

  @unmanaged
  export class pay_projects_result {
    static encode(message: pay_projects_result, writer: Writer): void {
      if (message.next_payment_time != 0) {
        writer.uint32(8);
        writer.uint64(message.next_payment_time);
      }
    }

    static decode(reader: Reader, length: i32): pay_projects_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new pay_projects_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.next_payment_time = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    next_payment_time: u64;

    constructor(next_payment_time: u64 = 0) {
      this.next_payment_time = next_payment_time;
    }
  }

  export enum project_status {
    upcoming = 0,
    active = 1,
    past = 2,
  }
}
