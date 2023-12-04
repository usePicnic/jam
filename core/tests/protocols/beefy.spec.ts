import { test } from "vitest";
import { simulateRouterOperationHelper } from "./utils";

test("generateTransaction: USDC to QUICK (beefyDeposit)", async () => {
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
        assetId: "37819023-9c6a-4848-8cf5-24a95350f001",
        fraction: 1.0,
      },
    ],
  });
});

test("generateTransaction: beefy.finance (beefyDeposit) to USDC", async () => {
  await simulateRouterOperationHelper({
    chainId: 137,
    inputAllocation: [
      { assetId: "fecfd33d-e6a7-476b-89cb-910a0058fa48", amountStr: "1000000" },
    ],
    outputAllocation: [
      {
        assetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
        fraction: 1.0,
      },
    ],
  });
});
