import { test } from "vitest";
import { simulateRouterOperationHelper } from "./utils";
import { JsonRpcProvider } from "ethers";

test.skip("generateTransaction: WETH to yvWETH (yearnDeposit)", async () => {
  const provider = new JsonRpcProvider(
    "<<< insert tenderly fork RPC URL here >>>"
  );
  await simulateRouterOperationHelper({
    chainId: 1,
    inputAllocation: [
      {
        assetId: "e9ac450f-efa3-4af1-929d-476c078e9ac6",
        amountStr: "1000000000000000000000",
      },
    ],
    provider,
    outputAllocation: [
      { assetId: "e6062600-14a4-46e1-b3a3-62bbf90df7a8", fraction: 1.0 },
    ],
  });
});

test.skip("generateTransaction: yvWETH (yearnDeposit) to WETH", async () => {
  const provider = new JsonRpcProvider(
    "<<< insert tenderly fork RPC URL here >>>"
  );
  await simulateRouterOperationHelper({
    chainId: 1,
    inputAllocation: [
      {
        assetId: "e6062600-14a4-46e1-b3a3-62bbf90df7a8",
        amountStr: "1000000000000000000000",
      },
    ],
    provider,
    outputAllocation: [
      { assetId: "e9ac450f-efa3-4af1-929d-476c078e9ac6", fraction: 1.0 },
    ],
  });
});
