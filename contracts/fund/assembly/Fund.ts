// SPDX-License-Identifier: MIT
// Julian Gonzalez (joticajulian@gmail.com)

import { Arrays, StringBytes, authority, chain, error, kcs4, Protobuf, Storage, System, system_calls, u128 } from "@koinos/sdk-as";
import { fund } from "./proto/fund";

const GLOBAL_VARS_SPACE_ID = 0;
const PROJECTS_SPACE_ID = 1;
const ACTIVE_PROJECTS_SPACE_ID = 2;
const UPCOMING_PROJECTS_SPACE_ID = 3;
const PAST_PROJECTS_SPACE_ID = 4;
const PROJECTS_BY_VOTER_SPACE_ID = 5;
const WEIGHTS_BY_VOTER_SPACE_ID = 6;

/**
 * idByVotes helps to order projects by number of votes.
 * The ID of the records has two parts: number of votes and project ID.
 * - number of votes: First 17 digits. Allow up to 1 billion -1 votes.
 * - project ID: 6 digits. Allow up to 1 million -1 projects.
 */
function idByVotes(votes: u64, projectId: u32): string {
  return `${votes}`.padStart(17, "0") + `${1e6 - projectId}`.padStart(6, "0");
}

class Token {
  contractId: Uint8Array;

  constructor(contractId: Uint8Array) {
    this.contractId = contractId;
  }

  balance_of(account: Uint8Array): u64 {
    const callRes = System.call(
      this.contractId,
      0x5c721497,
      Protobuf.encode(
        new kcs4.balance_of_arguments(account),
        kcs4.balance_of_arguments.encode
      )
    );
    if (callRes.code != 0) {
      const errorMessage = `failed to call 'Token.balance_of': ${callRes.res.error && callRes.res.error!.message ? callRes.res.error!.message : "unknown error"}`;
      System.exit(callRes.code, StringBytes.stringToBytes(errorMessage));
    }
    if (!callRes.res.object) return 0;
    return Protobuf.decode<kcs4.balance_of_result>(callRes.res.object, kcs4.balance_of_result.decode).value;
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

  projects: Storage.Map< string, fund.project > = new Storage.Map(
    this.contractId,
    PROJECTS_SPACE_ID,
    fund.project.decode,
    fund.project.encode,
    null,
    true
  );

  activeProjects: Storage.Map< string, fund.existence > = new Storage.Map(
    this.contractId,
    ACTIVE_PROJECTS_SPACE_ID,
    fund.existence.decode,
    fund.existence.encode,
    null,
    true
  );

  upcomingProjects: Storage.Map< string, fund.existence > = new Storage.Map(
    this.contractId,
    UPCOMING_PROJECTS_SPACE_ID,
    fund.existence.decode,
    fund.existence.encode,
    null,
    true
  );

  pastProjects: Storage.Map< string, fund.existence > = new Storage.Map(
    this.contractId,
    PAST_PROJECTS_SPACE_ID,
    fund.existence.decode,
    fund.existence.encode,
    null,
    true
  );

  projectsByVoter: Storage.Map< Uint8Array, fund.vote_info > = new Storage.Map(
    this.contractId,
    PROJECTS_BY_VOTER_SPACE_ID,
    fund.vote_info.decode,
    fund.vote_info.encode,
    null,
    true
  );

  weights: Storage.Map< Uint8Array, fund.vote_info > = new Storage.Map(
    this.contractId,
    WEIGHTS_BY_VOTER_SPACE_ID,
    fund.vote_info.decode,
    fund.vote_info.encode,
    () => new fund.vote_info(),
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
      fund.project_status.upcoming,
      0,
      votes,
    );

    if (now < args.starting_date) {
      this.upcomingProjects.put(idByVotes(0, id), new fund.existence());
    } else {
      this.activeProjects.put(idByVotes(0, id), new fund.existence());
      project.status = fund.project_status.active;
    }
    this.projects.put(`${id}`, project);

    System.event(
      "fund.submit_project_arguments",
      Protobuf.encode(
        args,
        fund.submit_project_arguments.encode
      ),
      [args.beneficiary!, args.creator!]
    );

    return new fund.submit_project_result();
  }

  update_vote(args: fund.update_vote_arguments): fund.update_vote_result {
    System.require(System.checkAccountAuthority(args.voter!), "not authorized by the voter")
    const globalVars = this.globalVars.get();
    System.require(globalVars, "fund contract not configured");
    const project = this.projects.get(`${args.project_id}`);
    System.require(project, "project not found");
    System.require(project!.status != fund.project_status.past, "cannot update votes on past projects");

    // get current vote to see weight and expiration
    const keyByVoter = new Uint8Array(31);
    keyByVoter.set(args.voter!);
    keyByVoter.set(StringBytes.stringToBytes(`${project!.id}`), 25);
    let vote = this.projectsByVoter.get(keyByVoter);

    // get ID of the project in the list ordered by votes
    const oldIdByVotes = idByVotes(project!.total_votes, project!.id);

    // get user's KOIN and VHP balance
    const koinBalance = new Token(System.getContractAddress("koin")).balance_of(args.voter!);
    const vhpBalance = new Token(System.getContractAddress("vhp")).balance_of(args.voter!);

    // get weights used by the user
    const weight = this.weights.get(args.voter!)!;

    // if vote already exist update weight and expiration
    if (vote) {
      // we remove the weight previously used, and the new weight will be added later
      weight.weight -= vote.weight;

      // remove votes from the project, the new votes with new weight will be added later.
      // only remove it if it has not expired
      const previousVoteWeight = vote.weight * (koinBalance + vhpBalance);
      for (let i = 0; i < 6; i += 1) {
        if (globalVars!.expiration_time[i] == vote.expiration) {
          // there are 6 expiration times, remove it from the corresponding period
          project!.votes[i] -= previousVoteWeight;
          project!.total_votes -= previousVoteWeight;
        }
      }
    }

    // update weights used by the user
    weight.weight += args.weight;
    System.require(weight.weight <= 20, `vote exceeded. ${100 - 5 * weight.weight}% votes available`);
    this.weights.put(args.voter!, weight);

    // update user vote and expiration time (most distant expiration)
    vote = new fund.vote_info(globalVars!.expiration_time[5], args.weight);
    this.projectsByVoter.put(keyByVoter, vote);

    // update votes in the project (votes with most distant expiration)
    const voteWeight = args.weight * (koinBalance + vhpBalance);
    project!.votes[5] += voteWeight;
    project!.total_votes += voteWeight;
    this.projects.put(`${args.project_id}`, project!);

    // reorder project in the list ordered by votes
    const newIdByVotes = idByVotes(project!.total_votes, project!.id);
    if (project!.status == fund.project_status.active) {
      this.activeProjects.remove(oldIdByVotes);
      this.activeProjects.put(newIdByVotes, new fund.existence());
    } else {
      this.upcomingProjects.remove(oldIdByVotes);
      this.upcomingProjects.put(newIdByVotes, new fund.existence());
    }

    System.event(
      "fund.update_vote_arguments",
      Protobuf.encode(
        args,
        fund.update_vote_arguments.encode
      ),
      [args.voter!]
    );

    return new fund.update_vote_result();
  }
}
