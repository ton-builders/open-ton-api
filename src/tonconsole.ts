import { SendMode, WalletContractV5R1, internal } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { TonApiClient } from "@ton-api/client";
import { ContractAdapter } from "@ton-api/ton-adapter";
import dotenv from "dotenv";
dotenv.config();
// API Provider: https://tonconsole.com/
let baseUrl = "https://testnet.tonapi.io";
if (process.env.TON_NETWORK === "MAINNET") {
  baseUrl = "https://tonapi.io";
}

// Initialize TonApi client
const ta = new TonApiClient({
  baseUrl: baseUrl,
  apiKey:
    "AGSPBL4JKKSA35QAAAAMUQG5MJORI4Y6NVPEXWPPXGMRRSV6ZRAHKVD4M4PIX2L3UTV63QY",
});

// Create an adapter
const adapter = new ContractAdapter(ta);

// Create and use a wallet contract
async function main() {
  const envMnemonicKey1 = process.env.ENV_MNEMONIC_K1;
  if (!envMnemonicKey1) {
    throw new Error("Mnemonic not found at .env file!");
  }
  const keyPair = await mnemonicToPrivateKey(envMnemonicKey1.split(" "));
  const wallet = WalletContractV5R1.create({
    workchain: 0,
    publicKey: keyPair.publicKey,
  });

  // Open the contract using the adapter
  const contract = adapter.open(wallet);

  // Get balance
  const balance = await contract.getBalance();
  console.log("Balance:", balance.toString());
  console.log("baseUrl:", baseUrl);

  // Send a transfer
  const seqno = await contract.getSeqno();
  console.log("seqno:", balance.toString());
  await contract.sendTransfer({
    seqno,
    secretKey: keyPair.secretKey,
    sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS,
    messages: [
      internal({
        value: "0.123",
        to: "EQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqB2N",
        body: "TON Console",
      }),
    ],
  });
}

main().catch(console.error);
