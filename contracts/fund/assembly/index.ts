import { System, Protobuf, authority } from "@koinos/sdk-as";
import { Fund as ContractClass } from "./Fund";
import { fund } from "./proto/fund";

export function main(): i32 {
  const contractArgs = System.getArguments();
  let retbuf = new Uint8Array(1024);

  const c = new ContractClass();

  switch (contractArgs.entry_point) {
    case 0x3baabbbd: {
      const args = Protobuf.decode<fund.submit_project_arguments>(
        contractArgs.args,
        fund.submit_project_arguments.decode
      );
      const res = c.submit_project(args);
      retbuf = Protobuf.encode(
        res,
        fund.submit_project_result.encode
      );
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
