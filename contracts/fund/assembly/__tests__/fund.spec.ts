import { Base58, MockVM, authority, Arrays, chain, Protobuf, System, kcs4, protocol, system_calls } from "@koinos/sdk-as";
import { Fund } from "../Fund";
import { fund } from "../proto/fund";

const contractId = Base58.decode("1DQzuCcTKacbs9GGScRTU1Hc8BsyARTPqe");
const koinAddress = Base58.decode("1A9YB4wnmUUohsL4jzxCkeMpzZXMVRoohB");
const vhpAddress = Base58.decode("12b1oodJ3jXahLHaHA7A5HX8bpCs9phft6");
const user1 = Base58.decode("1CLyivtwq2h8SnhLfDDNmmvxvGRANDr9XU");
const user2 = Base58.decode("1PWFatQaSXGfkosYwer3U8YrrpsuRc95kJ");

function createFundContract(): Fund {
  // configure fund contract
  MockVM.setSystemAuthority(true);
  const fundContract = new Fund();
  const setGlobalVarsArgs = new fund.set_global_vars_arguments(
    10000,
    [
      1738324800000, // 2025-01-31T12:00:00.000Z
      1740744000000, // 2025-02-28T12:00:00.000Z
      1743422400000, // 2025-03-31T12:00:00.000Z
      1746014400000, // 2025-04-30T12:00:00.000Z
      1748692800000, // 2025-05-31T12:00:00.000Z
      1751284800000, // 2025-06-30T12:00:00.000Z
    ]
  );
  fundContract.set_global_vars(setGlobalVarsArgs);
  MockVM.setSystemAuthority(false);
  return fundContract;
}

function submitProject(fundContract: Fund): void {
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
      1767225600000, // 2025-01-01T00:00:00.000Z
      5_00000000 // 5 Koins
    )
  );
}

describe("Fund contract", () => {
  beforeEach(() => {
    MockVM.reset();
    MockVM.setContractId(contractId);
    MockVM.setContractArguments(new Uint8Array(0));
    MockVM.setContractAddress("koin", koinAddress);
    MockVM.setContractAddress("vhp", vhpAddress);
    MockVM.setEntryPoint(0);
    MockVM.setHeadInfo(new chain.head_info(null, 0, 1));

    System.resetCache();
  });

  it("should get global vars", () => {
    const fundContract = createFundContract();
    const result = fundContract.get_global_vars();
    expect(result.fee_denominator).toBe(10000);
  });

  it("should submit a project", () => {
    const fundContract = createFundContract();
    submitProject(fundContract);

    const project = fundContract.get_project(
      new fund.get_project_arguments(1)
    );

    expect(Base58.encode(project.creator!)).toBe(Base58.encode(user1));
    expect(Base58.encode(project.beneficiary!)).toBe(Base58.encode(user1));
    expect(project.title).toBe("My project 1");
    expect(project.description).toBe("My project 1 description");
    expect(project.monthly_payment).toBe(1000_00000000);
    expect(project.start_date).toBe(1735689600000); // 2025-01-01T00:00:00.000Z
    expect(project.end_date).toBe(1767225600000); // 2025-01-01T00:00:00.000Z
  });

  it("should vote for a project", () => {
    const fundContract = createFundContract();
    submitProject(fundContract);
    
    // MockVM.setContractAddress("koin", koinAddress);
    // MockVM.setContractAddress("vhp", vhpAddress);

    // user2 accepts to vote for the project
    MockVM.setAuthorities(
      [
        new MockVM.MockAuthority(authority.authorization_type.contract_call, user2, true),
      ]
    );

    const voteArguments = new fund.update_vote_arguments(user2, 1, 20);
    MockVM.setContractArguments(Protobuf.encode(voteArguments, fund.update_vote_arguments.encode));
    MockVM.setEntryPoint(1);
    MockVM.setCaller(new chain.caller_data());

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
  });
});