import { test } from "vitest";
import { simulateRouterOperationHelper } from "./utils";

test("generateTransaction: USDC to USDT (stargateDeposit)", async () => {
  await simulateRouterOperationHelper({
    chainId: 137,
    inputAllocation: [
      {
        assetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
        amountStr: "1000000000",
      },
    ],
    outputAllocation: [
      { assetId: "c722c277-37b7-4416-9219-ab594a3fa5fe", fraction: 1.0 },
    ],
  });
});

test("generateTransaction: USDT (stargateDeposit) to USDC", async () => {
  await simulateRouterOperationHelper({
    chainId: 137,
    inputAllocation: [
      {
        assetId: "c722c277-37b7-4416-9219-ab594a3fa5fe",
        amountStr: "1000000000",
      },
    ],
    outputAllocation: [
      { assetId: "e251ecf6-48c2-4538-afcd-fbb92424054d", fraction: 1.0 },
    ],
  });
});
