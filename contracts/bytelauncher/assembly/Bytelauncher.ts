import { Protobuf, System, protocol, Base58, StringBytes } from "@koinos/sdk-as";
import { bytelauncher } from "./proto/bytelauncher";

export class Bytelauncher {
  upload_contract(args: bytelauncher.upload_contract_arguments): void {
    System.require(System.checkSystemAuthority(), "caller must have system authority to upload contract");

    const bytestorageAddress = BUILD_FOR_TESTING
      ? Base58.decode("1BTjeKBmPgTarD2Smxw1g7K8kbydcdZVWW")  // harbinger
      : Base58.decode("1GArWiQwb1Wn1yB7VBSUfyhJr4Yv9SW8Pj"); // mainnet

    const callRes = System.call(
      bytestorageAddress,
      0xb61ca37c, // get_bytecode
      Protobuf.encode(
        new bytelauncher.get_bytecode_arguments(args.bytecode_name),
        bytelauncher.get_bytecode_arguments.encode
      )
    );

    if (callRes.code != 0) {
      const errorMessage = `failed to call 'get_bytecode': ${callRes.res.error && callRes.res.error!.message ? callRes.res.error!.message : "unknown error"}`;
      System.exit(callRes.code, StringBytes.stringToBytes(errorMessage));
    }

    const bytecode = Protobuf.decode<bytelauncher.bytecode>(
      callRes.res.object,
      bytelauncher.bytecode.decode
    );

    const op = new protocol.upload_contract_operation(
      args.contract_id!,
      bytecode.bytecode!,
      bytecode.abi!,
      true,
      true,
      true
    );

    System.applyUploadContractOperation(op);
  }
}
