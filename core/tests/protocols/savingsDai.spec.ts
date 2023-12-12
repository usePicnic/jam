import { test } from "vitest";
import { simulateRouterOperationHelper } from "./utils";
import { JsonRpcProvider } from "ethers";

test.skip("generateTransaction: DAI to SDAI (savingsDai)", async () => {
  const provider = new JsonRpcProvider("<<<insert tenderly RPC fork URL>>>");
  await simulateRouterOperationHelper({
    chainId: 1,
    inputAllocation: [
      {
        assetId: "a80c67f9-5ba9-4c05-b5b1-511836b38454",
        amountStr: "1000000000000000000000",
      },
    ],
    provider,
    outputAllocation: [
      { assetId: "8bd1bd78-4938-4204-a945-fa63f57c642b", fraction: 1.0 },
    ],
  });
});

test.skip("generateTransaction: SDAI (savingsDai) to DAI", async () => {
  const provider = new JsonRpcProvider("<<<insert tenderly RPC fork URL>>>");
  await simulateRouterOperationHelper({
    chainId: 1,
    inputAllocation: [
      {
        assetId: "8bd1bd78-4938-4204-a945-fa63f57c642b",
        amountStr: "1000000000000000000000",
      },
    ],
    provider,
    outputAllocation: [
      { assetId: "a80c67f9-5ba9-4c05-b5b1-511836b38454", fraction: 1.0 },
    ],
  });
});
