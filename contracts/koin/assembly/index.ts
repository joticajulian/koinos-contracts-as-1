import { System, Protobuf, authority, kcs4, system_calls} from "@koinos/sdk-as";
import { Koin as ContractClass } from "./Koin";
import { koin } from "./proto/koin";

export function main(): i32 {
  const contractArgs = System.getArguments();
  let retbuf = new Uint8Array(1024);

  const c = new ContractClass();

  switch (contractArgs.entry_point) {
    case 0x2d464aab: {
      const args = Protobuf.decode<system_calls.get_account_rc_arguments>(
        contractArgs.args,
        system_calls.get_account_rc_arguments.decode
      );
      const res = c.get_account_rc(args);
      retbuf = Protobuf.encode(
        res,
        system_calls.get_account_rc_result.encode
      );
      break;
    }

    case 0x80e3f5c9: {
      const args = Protobuf.decode<system_calls.consume_account_rc_arguments>(
        contractArgs.args,
        system_calls.consume_account_rc_arguments.decode
      );
      const res = c.consume_account_rc(args);
      retbuf = Protobuf.encode(
        res,
        system_calls.consume_account_rc_result.encode
      );
      break;
    }

    case 0x82a3537f: {
      const res = c.name();
      retbuf = Protobuf.encode(
        res,
        kcs4.name_result.encode
      );
      break;
    }

    case 0xb76a7ca1: {
      const res = c.symbol();
      retbuf = Protobuf.encode(
        res,
        kcs4.symbol_result.encode
      );
      break;
    }

    case 0xee80fd2f: {
      const res = c.decimals();
      retbuf = Protobuf.encode(
        res,
        kcs4.decimals_result.encode
      );
      break;
    }

    case 0xbd7f6850: {
      const res = c.get_info();
      retbuf = Protobuf.encode(
        res,
        kcs4.get_info_result.encode
      );
      break;
    }

    case 0xb0da3934: {
      const res = c.total_supply();
      retbuf = Protobuf.encode(res, kcs4.total_supply_result.encode);
      break;
    }

    case 0x5c721497: {
      const args = Protobuf.decode<kcs4.balance_of_arguments>(
        contractArgs.args,
        kcs4.balance_of_arguments.decode
      );
      const res = c.balance_of(args);
      retbuf = Protobuf.encode(
        res,
        kcs4.balance_of_result.encode
      );
      break;
    }

    case 0x32f09fa1: {
      const args = Protobuf.decode<kcs4.allowance_arguments>(
        contractArgs.args,
        kcs4.allowance_arguments.decode
      );
      const res = c.allowance(args);
      retbuf = Protobuf.encode(
        res,
        kcs4.allowance_result.encode
      );
      break;
    }

    case 0x8fa16456: {
      const args = Protobuf.decode<kcs4.get_allowances_arguments>(
        contractArgs.args,
        kcs4.get_allowances_arguments.decode
      );
      const res = c.get_allowances(args);
      retbuf = Protobuf.encode(
        res,
        kcs4.get_allowances_result.encode
      );
      break;
    }

    case 0x2178d8fa: {
      const args = Protobuf.decode<koin.set_votes_koinos_fund_arguments>(
        contractArgs.args,
        koin.set_votes_koinos_fund_arguments.decode
      );
      c.set_votes_koinos_fund(args);
      retbuf = new Uint8Array(0);
      break;
    }

    case 0x27f576ca: {
      const args = Protobuf.decode<kcs4.transfer_arguments>(
        contractArgs.args,
        kcs4.transfer_arguments.decode
      );
      const res = c.transfer(args);
      retbuf = Protobuf.encode(
        res,
        kcs4.transfer_result.encode
      );
      break;
    }

    case 0xdc6f17bb: {
      const args = Protobuf.decode<kcs4.mint_arguments>(
        contractArgs.args,
        kcs4.mint_arguments.decode
      );
      const res = c.mint(args);
      retbuf = Protobuf.encode(
        res,
        kcs4.mint_result.encode
      );
      break;
    }

    case 0x859facc5: {
      const args = Protobuf.decode<kcs4.burn_arguments>(
        contractArgs.args,
        kcs4.burn_arguments.decode
      );
      const res = c.burn(args);
      retbuf = Protobuf.encode(
        res,
        kcs4.burn_result.encode
      );
      break;
    }

    case 0x74e21680: {
      const args = Protobuf.decode<kcs4.approve_arguments>(
        contractArgs.args,
        kcs4.approve_arguments.decode
      );
      const res = c.approve(args);
      retbuf = Protobuf.encode(
        res,
        kcs4.approve_result.encode
      );
      break;
    }

    case 0x4a2dbd90: {
      retbuf = Protobuf.encode(
        new authority.authorize_result(System.checkSystemAuthority()),
        authority.authorize_result.encode
      )
      break;
    }
    default:
      System.exit(1);
      break;
  }

  System.exit(0, retbuf);
  return 0;
}

main();
