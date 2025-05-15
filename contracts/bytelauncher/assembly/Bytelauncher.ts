import { Protobuf, System, Storage, protocol } from "@koinos/sdk-as";
import { bytelauncher } from "./proto/bytelauncher";

export class Bytelauncher {
  contractId: Uint8Array = System.getContractId();

  bytecode: Storage.Map<string, bytelauncher.bytecode> = new Storage.Map(
    this.contractId,
    0,
    bytelauncher.bytecode.decode,
    bytelauncher.bytecode.encode
  );
  
  get_bytecode(args: bytelauncher.get_bytecode_arguments): bytelauncher.bytecode {
    const bytecode = this.bytecode.get(args.name!);
    if (!bytecode) System.fail(`bytecode ${args.name!} does not exist`);
    return bytecode!;
  }

  set_bytecode(args: bytelauncher.bytecode): void {
    let bytecode = this.bytecode.get(args.name!);
    System.require(!bytecode, `bytecode ${args.name!} already exists`);
    System.require(
      args.name!.length > 0 &&
      args.bytecode!.length > 0 &&
      args.abi!.length > 0,
      "invalid arguments"
    );
    this.bytecode.put(args.name!, args);
    System.event(
      "bytelauncher.set_bytecode_event",
      Protobuf.encode(
        new bytelauncher.get_bytecode_arguments(args.name),
        bytelauncher.get_bytecode_arguments.encode
      ),
      []
    );
  }

  upload_contract(args: bytelauncher.upload_contract_arguments): void {
    System.require(System.checkSystemAuthority(), "caller must have system authority to upload contract");

    const bytecode = this.get_bytecode(
      new bytelauncher.get_bytecode_arguments(args.bytecode_name)
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
