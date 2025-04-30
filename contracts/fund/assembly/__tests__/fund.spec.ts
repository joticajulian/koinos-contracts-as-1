import { Base58, MockVM, authority, Arrays, chain, Protobuf, System, kcs4, protocol, system_calls } from "@koinos/sdk-as";
import { Fund } from "../Fund";
import { fund } from "../proto/fund";

const fundAddress = Base58.decode("1DQzuCcTKacbs9GGScRTU1Hc8BsyARTPqe");
const koinAddress = Base58.decode("1A9YB4wnmUUohsL4jzxCkeMpzZXMVRoohB");
const vhpAddress = Base58.decode("12b1oodJ3jXahLHaHA7A5HX8bpCs9phft6");
const pobAddress = Base58.decode("1C7V1hZfn36cej3vLNJ6zNF41EUcbMdJw6");
const user1 = Base58.decode("1CLyivtwq2h8SnhLfDDNmmvxvGRANDr9XU");
const user2 = Base58.decode("1PWFatQaSXGfkosYwer3U8YrrpsuRc95kJ");

enum EntryPoint {
  balanceOf = 0x5c721497, // 1550980247
  mint = 0xdc6f17bb, // 3698268091
  transfer = 0x27f576ca, // 670398154
}

const endMonth1 = 1738324800000; // 2025-01-31T12:00:00.000Z
const endMonth2 = 1740744000000; // 2025-02-28T12:00:00.000Z
const endMonth3 = 1743422400000; // 2025-03-31T12:00:00.000Z
const endMonth4 = 1746014400000; // 2025-04-30T12:00:00.000Z
const endMonth5 = 1748692800000; // 2025-05-31T12:00:00.000Z
const endMonth6 = 1751284800000; // 2025-06-30T12:00:00.000Z
const endMonth7 = 1753963200000; // 2025-07-31T12:00:00.000Z

function configureFund(): void {
  // configure fund contract
  MockVM.setSystemAuthority(true);
  const fundContract = new Fund();
  const setGlobalVarsArgs = new fund.set_global_vars_arguments(
    10000,
    [
      endMonth1,
      endMonth2,
      endMonth3,
      endMonth4,
      endMonth5,
      endMonth6,
    ]
  );
  fundContract.set_global_vars(setGlobalVarsArgs);
  MockVM.setSystemAuthority(false);
}

function submitProject(): void {
  const fundContract = new Fund();

  // response ok from KOIN contract when making the transfer.
  // no extra authorization is needed from the user to submit the project
  MockVM.setCallContractResults([new system_calls.exit_arguments(0, new chain.result())]);

  fundContract.submit_project(
    new fund.submit_project_arguments(
      user1, // creator
      user1,
      "My project 1",
      "My project 1 description",
      1000_00000000,
      1735689600000, // 2025-01-01T00:00:00.000Z
      1767225600000, // 2026-01-01T00:00:00.000Z
      5_00000000 // 5 Koins
    )
  );
}

function voteProject(): void {
  const fundContract = new Fund();

  // user2 accepts to vote for the project
  MockVM.setAuthorities(
    [
      new MockVM.MockAuthority(authority.authorization_type.contract_call, user2, true),
    ]
  );

  const voteArguments = new fund.update_vote_arguments(user2, 1, 20);
  MockVM.setContractArguments(Protobuf.encode(voteArguments, fund.update_vote_arguments.encode));

  MockVM.setCallContractResults([
    // result when calling set_votes_koinos_fund in koin contract
    new system_calls.exit_arguments(0, new chain.result()),
    // result when calling set_votes_koinos_fund in vhp contract
    new system_calls.exit_arguments(0, new chain.result()),
    // result when getting KOIN balance
    new system_calls.exit_arguments(0, new chain.result(
      Protobuf.encode(
        new kcs4.balance_of_result(1000),
        kcs4.balance_of_result.encode
      )
    )),
    // result when getting VHP balance
    new system_calls.exit_arguments(0, new chain.result(
      Protobuf.encode(
        new kcs4.balance_of_result(200),
        kcs4.balance_of_result.encode
      )
    )),
  ]);

  fundContract.update_vote(voteArguments);
}

describe("Fund contract", () => {
  beforeEach(() => {
    MockVM.reset();
    MockVM.setContractId(fundAddress);
    MockVM.setContractArguments(new Uint8Array(0));
    MockVM.setContractAddress("koin", koinAddress);
    MockVM.setContractAddress("vhp", vhpAddress);
    MockVM.setEntryPoint(0);
    MockVM.setCaller(new chain.caller_data());
    MockVM.setHeadInfo(new chain.head_info(null, 1736899200000, 1)); // 2025-01-15T00:00:00.000Z

    System.resetCache();
  });

  it("should get global vars", () => {
    configureFund();
    const fundContract = new Fund();
    const result = fundContract.get_global_vars();
    expect(result.fee_denominator).toBe(10000);
  });

  it("should submit a project", () => {
    configureFund();
    submitProject();
    const fundContract = new Fund();

    const project = fundContract.get_project(
      new fund.get_project_arguments(1)
    );

    expect(Base58.encode(project.creator!)).toBe(Base58.encode(user1));
    expect(Base58.encode(project.beneficiary!)).toBe(Base58.encode(user1));
    expect(project.title).toBe("My project 1");
    expect(project.description).toBe("My project 1 description");
    expect(project.monthly_payment).toBe(1000_00000000);
    expect(project.start_date).toBe(1735689600000); // 2025-01-01T00:00:00.000Z
    expect(project.end_date).toBe(1767225600000); // 2026-01-01T00:00:00.000Z

    // check past projects by date
    let projects = fundContract.get_projects(new fund.get_projects_arguments(
      fund.project_status.past,
      fund.order_projects_by.by_date,
      null,
      10
    ));
    expect(projects.projects.length).toBe(0);
    expect(projects.start_next_page).toBe("");

    // check upcoming projects by date
    projects = fundContract.get_projects(new fund.get_projects_arguments(
      fund.project_status.upcoming,
      fund.order_projects_by.by_date,
      null,
      10
    ));
    expect(projects.projects.length).toBe(0);
    expect(projects.start_next_page).toBe("");

    // check active projects by date
    projects = fundContract.get_projects(new fund.get_projects_arguments(
      fund.project_status.active,
      fund.order_projects_by.by_date,
      null,
      10
    ));
    expect(projects.projects.length).toBe(1);
    expect(projects.start_next_page).toBe("1767225600000000001");
    expect(projects.projects[0].id).toBe(1);
    expect(projects.projects[0].total_votes).toBe(0);
    expect(projects.projects[0].votes.toString()).toBe("0,0,0,0,0,0");

    // check past projects by votes - not possible
    expect(() => {
      new Fund().get_projects(new fund.get_projects_arguments(
        fund.project_status.past,
        fund.order_projects_by.by_votes,
        null,
        10
      ));
    }).toThrow();
    expect(MockVM.getErrorMessage()).toBe("past projects are not ordered by votes");

    // check upcoming projects by votes
    projects = fundContract.get_projects(new fund.get_projects_arguments(
      fund.project_status.upcoming,
      fund.order_projects_by.by_votes,
      null,
      10
    ));
    expect(projects.projects.length).toBe(0);
    expect(projects.start_next_page).toBe("");

    // check active projects by votes
    projects = fundContract.get_projects(new fund.get_projects_arguments(
      fund.project_status.active,
      fund.order_projects_by.by_votes,
      null,
      10
    ));
    expect(projects.projects.length).toBe(1);
    expect(projects.start_next_page).toBe("00000000000000000999999");
    expect(projects.projects[0].id).toBe(1);
    expect(projects.projects[0].total_votes).toBe(0);
    expect(projects.projects[0].votes.toString()).toBe("0,0,0,0,0,0");
  });

  it("should vote for a project", () => {
    configureFund();
    submitProject();
    voteProject();
    const fundContract = new Fund();

    // check active projects by votes
    const projects = fundContract.get_projects(new fund.get_projects_arguments(
      fund.project_status.active,
      fund.order_projects_by.by_votes,
      null,
      10
    ));
    expect(projects.projects.length).toBe(1);
    expect(projects.start_next_page).toBe("00000000000024000999999");
    expect(projects.projects[0].id).toBe(1);
    expect(projects.projects[0].total_votes).toBe(24000);
    expect(projects.projects[0].votes.toString()).toBe("0,0,0,0,0,24000");

    // get user votes
    const votes = fundContract.get_user_votes(new fund.get_user_votes_arguments(user2));
    expect(votes.votes.length).toBe(1);
    expect(votes.votes[0].project_id).toBe(1);
    expect(votes.votes[0].weight).toBe(20);
    expect(votes.votes[0].expiration).toBe(endMonth6);
  });

  it("should pay projects", () => {
    configureFund();
    submitProject();
    voteProject();
    MockVM.clearCallContractArguments();
    const fundContract = new Fund();

    // the payment is triggered from the PoB which is in kernel mode
    MockVM.setCaller(new chain.caller_data(pobAddress, chain.privilege.kernel_mode));

    // time of payment is also controlled in the PoB contract
    MockVM.setHeadInfo(new chain.head_info(null, endMonth1 + 30_000, 10)); // 2025-01-31T12:00:30.000Z

    MockVM.setCallContractResults([
      // result when getting KOIN balance of the fund contract
      new system_calls.exit_arguments(0, new chain.result(
        Protobuf.encode(
          new kcs4.balance_of_result(1500_00000000),
          kcs4.balance_of_result.encode
        )
      )),
      // result when making a KOIN transfer (payment)
      new system_calls.exit_arguments(0, new chain.result(
        Protobuf.encode(
          new kcs4.transfer_result(),
          kcs4.transfer_result.encode
        )
      )),
    ]);

    const result = fundContract.pay_projects();

    const contractCallArguments = MockVM.getCallContractArguments();
    expect(contractCallArguments.length).toBe(2);

    // KOIN contract called to get balance of fund contract
    expect(Base58.encode(contractCallArguments[0].contract_id)).toBe(Base58.encode(koinAddress));
    expect(contractCallArguments[0].entry_point).toBe(EntryPoint.balanceOf);
    const args0 = Protobuf.decode<kcs4.balance_of_arguments>(
      contractCallArguments[0].args,
      kcs4.balance_of_arguments.decode
    );
    expect(Base58.encode(args0.owner)).toBe(Base58.encode(fundAddress));

    // KOIN contract called to make a payment of 1000 koin
    expect(Base58.encode(contractCallArguments[1].contract_id)).toBe(Base58.encode(koinAddress));
    expect(contractCallArguments[1].entry_point).toBe(EntryPoint.transfer);
    const args1 = Protobuf.decode<kcs4.transfer_arguments>(
      contractCallArguments[1].args,
      kcs4.transfer_arguments.decode
    );
    expect([
      `from ${Base58.encode(args1.from)}`,
      `to ${Base58.encode(args1.to)}`,
      `value ${args1.value}`
    ].join(" ")).toBe([
      `from ${Base58.encode(fundAddress)}`,
      `to ${Base58.encode(user1)}`,
      `value 100000000000`
    ].join(" "));

    // next payment time is in the result
    expect(result.next_payment_time).toBe(endMonth2);

    // global vars are updated
    const globalVars = fundContract.get_global_vars();
    expect(globalVars.fee_denominator).toBe(10000);
    expect(globalVars.total_projects).toBe(1);
    expect(globalVars.total_upcoming_projects).toBe(0);
    expect(globalVars.total_active_projects).toBe(1);
    expect(globalVars.remaining_balance).toBe(500_00000000);
    expect(globalVars.payment_times.toString()).toBe([
      // endMonth1, the current payment time, is removed from the list
      `${endMonth2}`, // the next payment time is endMonth2
      `${endMonth3}`,
      `${endMonth4}`,
      `${endMonth5}`,
      `${endMonth6}`,
      `${endMonth7}`, // there is a new time in the list: endMonth7
    ].join(","));
  });
});