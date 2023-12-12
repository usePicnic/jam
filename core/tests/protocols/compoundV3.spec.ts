import { test } from "vitest";
import { simulateRouterOperationHelper } from "./utils";

test("generateTransaction: USDC to cUSDC (compoundV3Deposit)", async () => {
  await simulateRouterOperationHelper({
    chainId: 137,
    inputAllocation: [
      {
        assetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
        amountStr: "1000000000",
      },
    ],
    outputAllocation: [
      { assetId: "1f6a8b7c-d4bd-4598-9514-ee6d06151e51", fraction: 1.0 },
    ],
  });
});

test.skip("generateTransaction: cUSDC (compoundV3Deposit) to USDC", async () => {
  await simulateRouterOperationHelper({
    chainId: 137,
    inputAllocation: [
      {
        assetId: "1f6a8b7c-d4bd-4598-9514-ee6d06151e51",
        amountStr: "1000000000",
      },
    ],
    outputAllocation: [
      { assetId: "e251ecf6-48c2-4538-afcd-fbb92424054d", fraction: 1.0 },
    ],
  });
});
