// SPDX-License-Identifier: MIT
// Julian Gonzalez (joticajulian@gmail.com)

import { Arrays, StringBytes, authority, chain, error, kcs4, Protobuf, Storage, System, system_calls, u128 } from "@koinos/sdk-as";
import { fund } from "./proto/fund";

const GLOBAL_VARS_SPACE_ID = 0;
const ACTIVE_PROJECTS_BY_ID_SPACE_ID = 1;
const ACTIVE_PROJECTS_BY_VOTER_SPACE_ID = 2;
const UPCOMING_PROJECTS_BY_ID_SPACE_ID = 3;
const UPCOMING_PROJECTS_BY_VOTER_SPACE_ID = 4;
const PAST_PROJECTS_BY_ID_SPACE_ID = 5;
const PAST_PROJECTS_BY_VOTER_SPACE_ID = 6;

class Token {
  contractId: Uint8Array;

  constructor(contractId: Uint8Array) {
    this.contractId = contractId;
  }

  set_votes_koinos_fund(account: Uint8Array, votes_koinos_fund: bool): void {
    System.call(
      this.contractId,
      0x2178d8fa,
      Protobuf.encode(
        new fund.set_votes_koinos_fund_arguments(
          account,
          votes_koinos_fund
        ),
        fund.set_votes_koinos_fund_arguments.encode
      )
    );
  }

  transfer(from: Uint8Array, to: Uint8Array, value: u64): void {
    const callRes = System.call(
      this.contractId,
      0x27f576ca,
      Protobuf.encode(
        new kcs4.transfer_arguments(from, to, value),
        kcs4.transfer_arguments.encode
      )
    );
    if (callRes.code != 0) {
      const errorMessage = `failed to call 'Token.transfer': ${callRes.res.error && callRes.res.error!.message ? callRes.res.error!.message : "unknown error"}`;
      System.exit(callRes.code, StringBytes.stringToBytes(errorMessage));
    }
  }
}

export class Fund {
  contractId: Uint8Array = System.getContractId();

  globalVars: Storage.Obj< fund.global_vars > = new Storage.Obj(
    this.contractId,
    GLOBAL_VARS_SPACE_ID,
    fund.global_vars.decode,
    fund.global_vars.encode,
    null
  );

  activeProjectsById: Storage.Map< string, fund.project > = new Storage.Map(
    this.contractId,
    ACTIVE_PROJECTS_BY_ID_SPACE_ID,
    fund.project.decode,
    fund.project.encode,
    null,
    true
  );

  upcomingProjectsById: Storage.Map< string, fund.project > = new Storage.Map(
    this.contractId,
    UPCOMING_PROJECTS_BY_ID_SPACE_ID,
    fund.project.decode,
    fund.project.encode,
    null,
    true
  );

  pastProjectsById: Storage.Map< string, fund.project > = new Storage.Map(
    this.contractId,
    PAST_PROJECTS_BY_ID_SPACE_ID,
    fund.project.decode,
    fund.project.encode,
    null,
    true
  );

  activeProjectsByVoter: Storage.Map< string, fund.existence > = new Storage.Map(
    this.contractId,
    ACTIVE_PROJECTS_BY_VOTER_SPACE_ID,
    fund.existence.decode,
    fund.existence.encode,
    null,
    true
  );

  upcomingProjectsByVoter: Storage.Map< string, fund.existence > = new Storage.Map(
    this.contractId,
    UPCOMING_PROJECTS_BY_VOTER_SPACE_ID,
    fund.existence.decode,
    fund.existence.encode,
    null,
    true
  );

  pastProjectsByVoter: Storage.Map< string, fund.existence > = new Storage.Map(
    this.contractId,
    PAST_PROJECTS_BY_VOTER_SPACE_ID,
    fund.existence.decode,
    fund.existence.encode,
    null,
    true
  );

  submit_project(args: fund.submit_project_arguments): fund.submit_project_result {
    const now = System.getHeadInfo().head_block_time;
    System.require(args.starting_date < args.ending_date, "starting date must be before ending date");
    System.require(now < args.ending_date, "ending date must be in the future");
    const globalVars = this.globalVars.get();
    System.require(globalVars, "fund contract not configured");
    System.require(args.fee >= globalVars!.fee, `the fee must be at least ${globalVars!.fee}`);
    const koinToken = new Token(System.getContractAddress("koin"));
    koinToken.transfer(args.creator!, this.contractId, args.fee);

    globalVars!.total_projects += 1;
    const id = globalVars!.total_projects;

    const votes = new Array<u64>(6);
    const project = new fund.project(
      id,
      args.creator,
      args.beneficiary,
      args.title,
      args.description,
      args.monthly_payment,
      args.starting_date,
      args.ending_date,
      votes,
    );

    if (now < args.starting_date) {
      this.upcomingProjectsById.put(`${id}`, project);
    } else {
      this.activeProjectsById.put(`${id}`, project);
    }

    System.event(
      "fund.submit_project_arguments",
      Protobuf.encode(
        args,
        fund.submit_project_arguments.encode
      ),
      [args.beneficiary!, args.creator!]
    );

    return new fund.submit_project_result();

    /*
    // 17 digits allow up to 1 billion -1 votes
    // 6 digits for an ID allow up to 1 million -1 projects
    const idByVotes = `${votes}`.padStart(17, "0") + `${1e6 - id}`.padStart(6, "0");
    */
  }

  /*
  update_vote(args: fund.update_vote_arguments): fund.update_vote_result {

  }
  */
}
