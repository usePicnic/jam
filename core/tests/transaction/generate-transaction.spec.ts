import { test } from "vitest";
import { generateTransaction } from "src/transaction/generate-transaction";
import { AssetStore } from "src/transaction/types";

test("generateTransaction: WMATIC and USDC to USDC", async () => {
  const assetStore = new AssetStore();

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

test("generateTransaction: WETH to WBTC", async () => {
  const assetStore = new AssetStore();

  await generateTransaction({
    inputAllocation: [
      {
        assetId: "88f2647c-740e-4bbb-baed-c809302fea79",
        amountStr: "1000000000000000000",
      },
    ],
    outputAllocation: [
      {
        assetId: "7eecd38c-6ec4-4032-b1bd-bbd1bb82404f",
        fraction: 1.0,
      },
    ],
    assetStore,
    chainId: 137,
    walletAddress: "0x7D5dE92431EaAC58A27d3C3b8d9EfcFdda8383ab",
  });
});

test("generateTransaction: PAX Gold to MAI", async () => {
  const assetStore = new AssetStore();

  await generateTransaction({
    inputAllocation: [
      {
        assetId: "24baf9c9-953e-4f2d-8859-b6c5b3c06217",
        amountStr: "1000000000000000000",
      },
    ],
    outputAllocation: [
      {
        assetId: "c5129108-4b4d-4aa2-b75b-9d4348bd1678",
        fraction: 1.0,
      },
    ],
    assetStore,
    chainId: 137,
    walletAddress: "0x7D5dE92431EaAC58A27d3C3b8d9EfcFdda8383ab",
  });
});
