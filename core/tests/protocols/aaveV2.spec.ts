import { test } from "vitest";
import { simulateRouterOperationHelper } from "./utils";

test("generateTransaction: USDC to WETH (aaveV2Deposit)", async () => {
  await simulateRouterOperationHelper({
    chainId: 137,
    inputAllocation: [
      {
        assetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
        amountStr: "1000000000",
      },
    ],
    outputAllocation: [
      { assetId: "66d10ee1-1a78-46d3-a9d5-77862e36cb66", fraction: 1.0 },
    ],
  });
});

test("generateTransaction: WETH (aaveV2Deposit) to USDC", async () => {
  await simulateRouterOperationHelper({
    chainId: 137,
    inputAllocation: [
      {
        assetId: "66d10ee1-1a78-46d3-a9d5-77862e36cb66",
        amountStr: "1000000000000000000",
      },
    ],
    outputAllocation: [
      { assetId: "e251ecf6-48c2-4538-afcd-fbb92424054d", fraction: 1.0 },
    ],
  });
});
