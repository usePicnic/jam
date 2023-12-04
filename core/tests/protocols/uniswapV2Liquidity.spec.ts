import { test } from "vitest";
import { simulateRouterOperationHelper } from "./utils";

test("generateTransaction: USDC to CRV/WETH  (sushiswap - uniswapV2Liquidity)", async () => {
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
        assetId: "c708a5eb-eefd-4c89-bea3-8ec2e036a1a7",
        fraction: 1.0,
      },
    ],
  });
});

test.skip("generateTransaction: CRV/WETH (sushiswap - uniswapV2Liquidity) to USDC", async () => {
  await simulateRouterOperationHelper({
    chainId: 137,
    inputAllocation: [
      {
        assetId: "c708a5eb-eefd-4c89-bea3-8ec2e036a1a7",
        amountStr: "10000000000000000000",
      },
    ],
    outputAllocation: [
      {
        assetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
        fraction: 1.0,
      },
    ],
  });
});

test("generateTransaction: USDC to WBTC/WETH (quickswap - uniswapV2Liquidity)", async () => {
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
        assetId: "108309b5-19ae-49d9-a98b-bd032291db38",
        fraction: 1.0,
      },
    ],
  });
});

test.skip("generateTransaction: WBTC/WETH (quickswap - uniswapV2Liquidity) to USDC", async () => {
  await simulateRouterOperationHelper({
    chainId: 137,
    inputAllocation: [
      {
        assetId: "108309b5-19ae-49d9-a98b-bd032291db38",
        amountStr: "1000000000",
      },
    ],

    outputAllocation: [
      {
        assetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
        fraction: 1.0,
      },
    ],
  });
});
