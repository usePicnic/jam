import { test } from "vitest";
import { simulateSingleAssetToSingleAsset } from "./utils";

test("generateTransaction: USDC to jBRL/BRZ (balancerDeposit)", async () => {
  await simulateSingleAssetToSingleAsset({
    chainId: 137,
    inputAssetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
    outputAssetId: "03f36f17-bbc2-4d8d-b0b2-9ce0f534d708",
    amountIn: "1000000000",
  });
});

test("generateTransaction: maticX/WMATIC (balancerDeposit) to USDC", async () => {
  await simulateSingleAssetToSingleAsset({
    chainId: 137,
    inputAssetId: "9b09afe5-c740-4cd7-a247-4fe4950a7f33",
    outputAssetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
    amountIn: "10000000000000000000000",
  });
});
