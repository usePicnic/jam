import { test } from "vitest";
import { simulateSingleAssetToSingleAsset } from "./utils";

test("generateTransaction: USDC to CRV/WETH  (sushiswap - uniswapV2Liquidity)", async () => {
  await simulateSingleAssetToSingleAsset({
    chainId: 137,
    inputAssetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
    outputAssetId: "c708a5eb-eefd-4c89-bea3-8ec2e036a1a7",
    amountIn: "1000000000",
  });
});

test.skip("generateTransaction: CRV/WETH (sushiswap - uniswapV2Liquidity) to USDC", async () => {
  await simulateSingleAssetToSingleAsset({
    chainId: 137,
    inputAssetId: "c708a5eb-eefd-4c89-bea3-8ec2e036a1a7",
    outputAssetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
    amountIn: "10000000000000000000",
  });
});

test("generateTransaction: USDC to WBTC/WETH (quickswap - uniswapV2Liquidity)", async () => {
  await simulateSingleAssetToSingleAsset({
    chainId: 137,
    inputAssetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
    outputAssetId: "108309b5-19ae-49d9-a98b-bd032291db38",
    amountIn: "1000000000",
  });
});

test.skip("generateTransaction: WBTC/WETH (quickswap - uniswapV2Liquidity) to USDC", async () => {
  await simulateSingleAssetToSingleAsset({
    chainId: 137,
    inputAssetId: "108309b5-19ae-49d9-a98b-bd032291db38",
    outputAssetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
    amountIn: "1000000000",
  });
});
