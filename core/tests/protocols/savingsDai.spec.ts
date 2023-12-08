import { test } from "vitest";
import { simulateRouterOperationHelper } from "./utils";

test.skip("generateTransaction: USDC to SDAI (savingsDai)", async () => {
  await simulateRouterOperationHelper({
    chainId: 1,
    inputAllocation: [
      {
        assetId: "ed46f991-d225-491d-b2b2-91f89da016d2",
        amountStr: "1000000000",
      },
    ],
    outputAllocation: [
      { assetId: "8bd1bd78-4938-4204-a945-fa63f57c642b", fraction: 1.0 },
    ],
  });
});

test.skip("generateTransaction: SDAI (savingsDai) to USDC", async () => {
  await simulateRouterOperationHelper({
    chainId: 1,
    inputAllocation: [
      {
        assetId: "8bd1bd78-4938-4204-a945-fa63f57c642b",
        amountStr: "1000000000000000000000",
      },
    ],
    outputAllocation: [
      { assetId: "ed46f991-d225-491d-b2b2-91f89da016d2", fraction: 1.0 },
    ],
  });
});
