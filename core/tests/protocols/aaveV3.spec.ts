import { test } from "vitest";
import { simulateRouterOperationHelper } from "./utils";

test("generateTransaction: USDC to aPolUSDC (aaveV3Deposit)", async () => {
  await simulateRouterOperationHelper({
    chainId: 137,
    inputAllocation: [
      {
        assetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
        amountStr: "1000000000",
      },
    ],
    outputAllocation: [
      { assetId: "371b83f1-3301-4c69-b3ad-8d199c6d1774", fraction: 1.0 },
    ],
  });
});

test("generateTransaction: aPolUSDC (aaveV3Deposit) to USDC", async () => {
  await simulateRouterOperationHelper({
    chainId: 137,
    inputAllocation: [
      {
        assetId: "371b83f1-3301-4c69-b3ad-8d199c6d1774",
        amountStr: "1000000000",
      },
    ],
    outputAllocation: [
      { assetId: "e251ecf6-48c2-4538-afcd-fbb92424054d", fraction: 1.0 },
    ],
  });
});
