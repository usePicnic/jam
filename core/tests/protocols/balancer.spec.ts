import { test } from "vitest";
import { simulateRouterOperationHelper } from "./utils";

test("generateTransaction: USDC to jBRL/BRZ (balancerDeposit)", async () => {
  await simulateRouterOperationHelper({
    chainId: 137,

    inputAllocation: [
      {
        assetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
        amountStr: "1000000000",
      },
    ],
    outputAllocation: [
      { assetId: "03f36f17-bbc2-4d8d-b0b2-9ce0f534d708", fraction: 1 },
    ],
  });
});

test("generateTransaction: maticX/WMATIC (balancerDeposit) to USDC", async () => {
  await simulateRouterOperationHelper({
    chainId: 137,
    inputAllocation: [
      {
        assetId: "9b09afe5-c740-4cd7-a247-4fe4950a7f33",
        amountStr: "10000000000000000000000",
      },
    ],
    outputAllocation: [
      {
        assetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
        fraction: 1,
      },
    ],
  });
});
