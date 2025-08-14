import { SendMode, WalletContractV5R1, internal, Address } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { TonApiClient } from "@ton-api/client";
import { ContractAdapter } from "@ton-api/ton-adapter";
import dotenv from "dotenv";
dotenv.config();

// Initialize TonApi client
const ta = new TonApiClient({
  baseUrl: "https://tonapi.io",
  apiKey:
    "AGSPBL4JKKSA35QAAAAMUQG5MJORI4Y6NVPEXWPPXGMRRSV6ZRAHKVD4M4PIX2L3UTV63QY",
});

async function main() {
  // accounts();
  jetton();
}

function accounts() {
  // accounts ==================================================
  ta.accounts
    .getAccount(
      Address.parse("EQAChAswsPNsU2k3A5ZDO_cfhWknCGS6WMG2Jz15USMwxMdw"),
    )
    .then((account) => {
      console.info(account);
    });
}

function jetton() {
  // jetton ==================================================
  const jettonAddress = Address.parse(
    "EQC2GgCSJ6BNfug2ZgIrJIydrJhyIovfoLU31N-MnT5uV-9S",
  );

  ta.jettons
    .getJettonInfo(jettonAddress)
    .then((jetton) => console.log("Jetton Info:", jetton))
    .catch((error) => console.error("Error fetching jetton info:", error));
}

main().catch(console.error);
