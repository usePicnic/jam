import { test } from "vitest";
import { simulateSingleAssetToSingleAsset } from "./utils";

test("generateTransaction: USDC to QUICK (beefyDeposit)", async () => {
  await simulateSingleAssetToSingleAsset({
    chainId: 137,
    inputAssetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
    outputAssetId: "37819023-9c6a-4848-8cf5-24a95350f001",
    amountIn: "1000000000",
  });
});

test("generateTransaction: beefy.finance (beefyDeposit) to USDC", async () => {
  await simulateSingleAssetToSingleAsset({
    chainId: 137,
    inputAssetId: "fecfd33d-e6a7-476b-89cb-910a0058fa48",
    outputAssetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
    amountIn: "1000000",
  });
});
