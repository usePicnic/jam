import { expect, test } from "vitest";
import { generateTransaction } from "./generate-transaction";
import { AssetStore } from "./types";
import { getProvider } from "../utils/get-provider";

test("generateTransaction basic usage", async () => {
  const assetStore = new AssetStore([
    // {
    //   id: "48f0325c-e5cc-4dac-9873-793f6c12fe08",
    //   active: true,
    //   address: "0x0000000000000000000000000000000000001010",
    //   color: "#468af0",
    //   chainId: 137,
    //   decimals: 18,
    //   linkedAssets: [
    //     {
    //       assetId: "d604439e-d464-4df5-bed1-66815b348cab",
    //       fraction: 1,
    //     },
    //   ],
    //   logos: [
    //     {
    //       logoUri: "/asset-logos/48f0325c-e5cc-4dac-9873-793f6c12fe08.png",
    //       name: "Matic",
    //       symbol: "MATIC",
    //       color: "#468af0",
    //     },
    //   ],
    //   name: "Matic",
    //   rawLogoUri: "/asset-logos/48f0325c-e5cc-4dac-9873-793f6c12fe08.png",
    //   symbol: "MATIC",
    //   type: "networkToken",
    //   visible: true,
    // },
    {
      id: "d604439e-d464-4df5-bed1-66815b348cab",
      active: true,
      address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      color: "#468af0",
      chainId: 137,
      decimals: 18,
      logos: [
        {
          logoUri: "/asset-logos/d604439e-d464-4df5-bed1-66815b348cab.png",
          name: "Wrapped Matic",
          symbol: "WMATIC",
          color: "#468af0",
        },
      ],
      name: "Wrapped Matic",
      rawLogoUri: "/asset-logos/d604439e-d464-4df5-bed1-66815b348cab.png",
      symbol: "WMATIC",
      type: "token",
      visible: false,
      allowSlot: 4,
      balanceSlot: 3,
    },
    {
      id: "e251ecf6-48c2-4538-afcd-fbb92424054d",
      active: true,
      chainId: 137,
      address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      color: "#2775ca",
      decimals: 6,
      logos: [
        {
          logoUri: "/asset-logos/e251ecf6-48c2-4538-afcd-fbb92424054d.png",
          name: "USD Coin",
          symbol: "USDC",
          color: "#2775ca",
        },
      ],
      name: "USD Coin",
      rawLogoUri: "/asset-logos/e251ecf6-48c2-4538-afcd-fbb92424054d.png",
      symbol: "USDC",
      type: "token",
      visible: false,
      allowSlot: 1,
      balanceSlot: 0,
    },
  ]);

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
