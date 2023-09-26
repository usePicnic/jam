import { expect, test } from "vitest";
import { AssetStore } from "../../src/transaction/types";
import { getProvider } from "../../src/utils/get-provider";
import { simulateAssetSwapTransaction } from "../../src/path/tx-simulator";
import { UniswapV3 } from "../../src/path/exchanges";

test("uniswap v3: WMATIC to USDC", async () => {
  const assetStore = new AssetStore();

  const provider = await getProvider({ chainId: 137 });

  await assetStore.cachePrices({
    allocation: [
      { assetId: "d604439e-d464-4df5-bed1-66815b348cab", fraction: 1 },
    ],
    provider,
    assetStore,
  });

  const swappedValue = await simulateAssetSwapTransaction({
    chainId: 137,
    routes: [
      {
        exchange: new UniswapV3(),
        fraction: 1,
        params: {
          tokenAddressPath: [
            "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
            "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6",
          ],
          pool: "0x6b75f2189f0e11c52e814e09e280eb1a9a8a094a",
        },
        fromToken: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
        toToken: "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6",
      },
      {
        exchange: new UniswapV3(),
        fraction: 1,
        params: {
          tokenAddressPath: [
            "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6",
            "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
          ],
          pool: "0xa1cfb393607d1a6888d273b762832ed14c8b56b1",
        },
        fromToken: "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6",
        toToken: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
      },
      {
        exchange: new UniswapV3(),
        fraction: 1,
        params: {
          tokenAddressPath: [
            "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
            "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
          ],
          pool: "0xdac8a8e6dbf8c690ec6815e0ff03491b2770255d",
        },
        fromToken: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
        toToken: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
      },
    ],
    sellAsset: assetStore.getAssetById("d604439e-d464-4df5-bed1-66815b348cab"),
    amountIn: "1000000000000000000",
    buyToken: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  });

  console.log({ swappedValue });
  expect(swappedValue).toBeGreaterThan(0);
});

// test("generateTransaction should reject empty input or output", async () => {
//   await expect(() =>
//     generateTransaction({
//       inputAllocation: [
//         {
//           assetId: "2376e258-b097-4aa1-b1bc-e550e0049bc6",
//           amountStr: "1000000",
//         },
//       ],
//       outputAllocation: [],
//       assetStore: {},
//     })
//   ).rejects.toThrow();

//   await expect(() =>
//     generateTransaction({
//       inputAllocation: [],
//       outputAllocation: [
//         {
//           assetId: "2376e258-b097-4aa1-b1bc-e550e0049bc6",
//           percentage: 100,
//         },
//       ],
//     })
//   ).rejects.toThrow();
// });
