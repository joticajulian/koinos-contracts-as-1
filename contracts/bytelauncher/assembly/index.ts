import { System, Protobuf, authority } from "@koinos/sdk-as";
import { Bytelauncher as ContractClass } from "./Bytelauncher";
import { bytelauncher } from "./proto/bytelauncher";

export function main(): i32 {
  const contractArgs = System.getArguments();
  let retbuf = new Uint8Array(1024);

  const c = new ContractClass();

  switch (contractArgs.entry_point) {
    // get_bytecode
    case 0xb61ca37c: {
      const args = Protobuf.decode<bytelauncher.get_bytecode_arguments>(
        contractArgs.args,
        bytelauncher.get_bytecode_arguments.decode
      );
      const res = c.get_bytecode(args);
      retbuf = Protobuf.encode(
        res,
        bytelauncher.bytecode.encode
      );
      break;
    }

    // set_bytecode
    case 0x1836fb68: {
      const args = Protobuf.decode<bytelauncher.bytecode>(
        contractArgs.args,
        bytelauncher.bytecode.decode
      );
      c.set_bytecode(args);
      retbuf = new Uint8Array(0);
      break;
    }

    // upload_contract
    case 0x877511dd: {
      const args = Protobuf.decode<bytelauncher.upload_contract_arguments>(
        contractArgs.args,
        bytelauncher.upload_contract_arguments.decode
      );
      c.upload_contract(args);
      retbuf = new Uint8Array(0);
      break;
    }

    // authorize
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
