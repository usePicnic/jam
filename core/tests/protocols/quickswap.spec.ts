import { expect, test } from "vitest";
import { AssetStore } from "../../src/transaction/types";
import { getProvider } from "../../src/utils/get-provider";
import { simulateAssetSwapTransaction } from "../../src/path/tx-simulator";
import { QuickSwap, UniswapV3 } from "../../src/path/exchanges";

test("quickswap: USDC to WETH", async () => {
  const assetStore = new AssetStore();

  const provider = await getProvider({ chainId: 137 });

  await assetStore.cachePrices({
    allocation: [
      { assetId: "e251ecf6-48c2-4538-afcd-fbb92424054d", fraction: 1 },
      { assetId: "88f2647c-740e-4bbb-baed-c809302fea79", fraction: 1 },
    ],
    provider,
    assetStore,
  });

  const swappedValue = await simulateAssetSwapTransaction({
    chainId: 137,
    routes: [
      {
        exchange: new QuickSwap(),
        fraction: 1,
        params: {
          path: [
            "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
            "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
          ],
        },
        fromToken: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
        toToken: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      },
    ],
    sellAsset: assetStore.getAssetById("e251ecf6-48c2-4538-afcd-fbb92424054d"),
    amountIn: "1000000000",
    buyToken: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
  });

  console.log({ swappedValue });
  expect(swappedValue).toBeGreaterThan(0);
});
