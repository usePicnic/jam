import { test } from "vitest";
import { simulateSingleAssetToSingleAsset } from "./utils";

test("generateTransaction: USDC to aPolUSDC (aaveV3Deposit)", async () => {
  await simulateSingleAssetToSingleAsset({
    chainId: 137,
    inputAssetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
    outputAssetId: "371b83f1-3301-4c69-b3ad-8d199c6d1774",
    amountIn: "1000000000",
  });
});

test("generateTransaction: aPolUSDC (aaveV3Deposit) to USDC", async () => {
  await simulateSingleAssetToSingleAsset({
    chainId: 137,
    inputAssetId: "371b83f1-3301-4c69-b3ad-8d199c6d1774",
    outputAssetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
    amountIn: "1000000000",
  });
});
