import { test } from "vitest";
import { simulateSingleAssetToSingleAsset } from "./utils";

test("generateTransaction: USDC to USDC/WETH (gammaDeposit)", async () => {
  await simulateSingleAssetToSingleAsset({
    chainId: 137,
    inputAssetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
    outputAssetId: "8da84d12-9e9d-4c04-831d-7b93f1cd822f",
    amountIn: "1000000000",
  });
});

test("generateTransaction: USDC to WMATIC/WETH (gammaDeposit)", async () => {
  await simulateSingleAssetToSingleAsset({
    chainId: 137,
    inputAssetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
    outputAssetId: "3c42b7d3-555b-41a4-96b6-ce4fadd62f83",
    amountIn: "1000000000",
  });
});

test("generateTransaction: USDC to WMATIC/MaticX (gammaDeposit)", async () => {
  await simulateSingleAssetToSingleAsset({
    chainId: 137,
    inputAssetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
    outputAssetId: "5a5cd640-b972-43b6-9bb2-24e6711ab1db",
    amountIn: "1000000000",
  });
});

test("generateTransaction: WMATIC/MaticX (gammaDeposit) to USDC", async () => {
  await simulateSingleAssetToSingleAsset({
    chainId: 137,
    inputAssetId: "5a5cd640-b972-43b6-9bb2-24e6711ab1db",
    outputAssetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
    amountIn: "1000000000000000000000",
  });
});

test("generateTransaction: WMATIC/WETH (gammaDeposit) to USDC", async () => {
  await simulateSingleAssetToSingleAsset({
    chainId: 137,
    inputAssetId: "3c42b7d3-555b-41a4-96b6-ce4fadd62f83",
    outputAssetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
    amountIn: "1000000000000000000",
  });
});

test("generateTransaction: USDC/WETH (gammaDeposit) to USDC", async () => {
  await simulateSingleAssetToSingleAsset({
    chainId: 137,
    inputAssetId: "8da84d12-9e9d-4c04-831d-7b93f1cd822f",
    outputAssetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
    amountIn: "1000000000000000000",
  });
});

test("generateTransaction: USDC/WETH (gammaDeposit) to WMATIC/MaticX (gammaDeposit)", async () => {
  await simulateSingleAssetToSingleAsset({
    chainId: 137,
    inputAssetId: "8da84d12-9e9d-4c04-831d-7b93f1cd822f",
    outputAssetId: "5a5cd640-b972-43b6-9bb2-24e6711ab1db",
    amountIn: "1000000000000000000",
  });
});
