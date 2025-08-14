import {
  internal,
  external,
  TonClient,
  WalletContractV4,
  storeMessage,
} from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";
import dotenv from "dotenv";

import { Cell } from "@ton/core";
import { Wallet4SendArgsSigned } from "@ton/ton/dist/wallets/WalletContractV4";

dotenv.config();

// API Provider: https://toncenter.com/
let endpoint = "https://testnet.toncenter.com/api/v2/jsonRPC";
if (process.env.TON_NETWORK === "MAINNET") {
  endpoint = "https://toncenter.com/api/v2/jsonRPC";
}

async function main() {
  let client = new TonClient({
    endpoint: endpoint,
    apiKey: "aa74010f1ee273a1dcdfa6827f5b8265f9ea816876e52f90b4eec31ef40020af",
  });
  // let mnemonics = await mnemonicNew();
  const envMnemonicKey1 = process.env.ENV_MNEMONIC_K1;
  if (!envMnemonicKey1) {
    throw new Error("Mnemonic not found at .env file!");
  }
  let keyPair = await mnemonicToPrivateKey(envMnemonicKey1.split(" "));
  let workchain = 0;

  // 注意：WalletContractV4 实际上是 wallet_v4r2，你需要根据你的钱包版本选择不同的合约，如 WalletContractV5R1
  // 注意：WalletContractV4 实际上是 wallet_v4r2，你需要根据你的钱包版本选择不同的合约，如 WalletContractV5R1
  // 注意：WalletContractV4 实际上是 wallet_v4r2，你需要根据你的钱包版本选择不同的合约，如 WalletContractV5R1
  let wallet = WalletContractV4.create({
    workchain,
    publicKey: keyPair.publicKey,
  });
  let contract = client.open(wallet);

  // Get balance
  let balance: bigint = await contract.getBalance();
  let seqno: number = await contract.getSeqno();
  console.info(process.env.TON_NETWORK);
  console.info(endpoint);
  console.info(contract.address);
  console.info(balance);
  console.info(seqno);

  console.info("------------------------------------------------------------");
  console.info(
    "----------  External-In message body payload start  ----------",
  );
  let sendArgsWithSecretKey: Wallet4SendArgsSigned = {
    seqno,
    secretKey: keyPair.secretKey,
    messages: [
      internal({
        value: "0.001",
        to: "0QAAQ3X8LZ3qmwnIgaXwgysWnBBBE8T26G8B4iQ4-PHDGHQC",
        body: "Hello world 2025-08-14 44",
      }),
      internal({
        value: "0.001",
        to: "0QCSES0TZYqcVkgoguhIb8iMEo4cvaEwmIrU5qbQgnN8fo2A",
        body: "Hello Giver 2025-08-14 44",
      }),
    ],
  };

  let msgBodyPayloadCell = contract.createTransfer(sendArgsWithSecretKey);

  //https://testnet.toncenter.com/api/v3/index.html#/blockchain/api_v3_get_transactions_by_message
  // 参数 body_hash 设置为 bodyHashHex 或者 bodyHashBase64
  // 备注：https://tonapi.io/ 没有看到提供 body_hash 的查询接口
  let bodyHashHex = msgBodyPayloadCell.hash().toString("hex");
  let bodyHashBase64 = msgBodyPayloadCell.hash().toString("base64");
  console.info("bodyHashHex = ", bodyHashHex); //body_hash
  console.info("bodyHashBase64 = ", bodyHashBase64); //body_hash
  console.info("----------  External-In message body payload end  ----------");
  console.info("------------------------------------------------------------");

  console.info("=====================================================");
  console.info("==========  External-In message start  ==============");
  const externalMessage = external({
    to: contract.address,
    body: msgBodyPayloadCell,
    init: null,
  });

  let externalInMsgBuilder = new Cell().asBuilder();
  let msgBuilderFunction = storeMessage(externalMessage);
  msgBuilderFunction(externalInMsgBuilder);
  let externalInMsgCell = externalInMsgBuilder.endCell();
  // API参考 1 https://testnet.toncenter.com/api/v3/index.html#/blockchain/api_v3_get_transactions_by_message
  // msg_hash 的参数设置为 msgHashHex 或 msgHashBase64 查询

  // API参考 2 https://tonapi.io/api-v2#operations-Traces-getTrace
  // trace_id 设置为  msgHashHex 或 msgHashBase64 查询
  let msgHashHex = externalInMsgCell.hash().toString("hex");
  let msgHashBase64 = externalInMsgCell.hash().toString("base64");
  console.info("msgHashHex = ", msgHashHex);
  console.info("msgHashBase64 = ", msgHashBase64);
  console.info("=========== External-In message end  =============");
  console.info("=====================================================");

  await contract.send(msgBodyPayloadCell);
}

main().catch((r) => console.error(r));
