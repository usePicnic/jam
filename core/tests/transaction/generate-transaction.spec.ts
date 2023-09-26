import { expect, test } from "vitest";
import { generateTransaction } from "src/transaction/generate-transaction";
import { AssetStore } from "src/transaction/types";
import { getProvider } from "src/utils/get-provider";

test("generateTransaction basic usage", async () => {
  const assetStore = new AssetStore();
  // [
  //   {
  //     id: "d604439e-d464-4df5-bed1-66815b348cab",
  //     active: true,
  //     address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  //     color: "#468af0",
  //     chainId: 137,
  //     decimals: 18,
  //     name: "Wrapped Matic",
  //     symbol: "WMATIC",
  //     type: "token",
  //     visible: false,
  //     allowSlot: 4,
  //     balanceSlot: 3,
  //   },
  //   {
  //     id: "e251ecf6-48c2-4538-afcd-fbb92424054d",
  //     active: true,
  //     chainId: 137,
  //     address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  //     color: "#2775ca",
  //     decimals: 6,
  //     name: "USD Coin",
  //     symbol: "USDC",
  //     type: "token",
  //     visible: false,
  //     allowSlot: 1,
  //     balanceSlot: 0,
  //   },
  // ]

  await generateTransaction({
    inputAllocation: [
      {
        assetId: "d604439e-d464-4df5-bed1-66815b348cab",
        amountStr: "1000000000000000000",
      },
      {
        assetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
        amountStr: "1000000",
      },
    ],
    outputAllocation: [
      {
        assetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
        fraction: 1.0,
      },
    ],
    assetStore,
    chainId: 137,
    walletAddress: "0x7D5dE92431EaAC58A27d3C3b8d9EfcFdda8383ab",
  });
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
