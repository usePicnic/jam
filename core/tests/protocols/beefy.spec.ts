import { test } from "vitest";
import { simulateRouterOperationHelper } from "./utils";

test("generateTransaction: USDC to WBTC-ETH Narrow LP (beefyDeposit)", async () => {
  await simulateRouterOperationHelper({
    chainId: 137,
    inputAllocation: [
      {
        assetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
        amountStr: "1000000000",
      },
    ],

    outputAllocation: [
      {
        assetId: "09b83a29-d57b-430d-9d2f-f19f08e4da35",
        fraction: 1.0,
      },
    ],
  });
});

test.skip("generateTransaction: WBTC-ETH Narrow LP (beefyDeposit) to USDC", async () => {
  await simulateRouterOperationHelper({
    chainId: 137,
    inputAllocation: [
      {
        assetId: "09b83a29-d57b-430d-9d2f-f19f08e4da35",
        amountStr: "100000000",
      },
    ],
    outputAllocation: [
      {
        assetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
        fraction: 1.0,
      },
    ],
  });
});
