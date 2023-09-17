import { expect, test } from "vitest";
import { getPrices } from "./get-prices";
import { Asset, AssetStore } from "./types";
import { getProvider } from "../utils/get-provider";

test("network token", async () => {
  const assetStore = new AssetStore([
    {
      id: "48f0325c-e5cc-4dac-9873-793f6c12fe08",
      chainId: 137,
      type: "networkToken",
    } as unknown as Asset,
  ]);
  const provider = await getProvider({ chainId: 137 });
  const prices = await getPrices({
    assetStore,
    provider,
    assetIds: ["48f0325c-e5cc-4dac-9873-793f6c12fe08"],
  });

  const price = prices["48f0325c-e5cc-4dac-9873-793f6c12fe08"];

  expect(price).toBeGreaterThan(0);
});

test("token", async () => {
  const assetStore = new AssetStore([
    {
      id: "e251ecf6-48c2-4538-afcd-fbb92424054d",
      chainId: 137,
      decimals: 6,
      address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      name: "USD Coin",
      type: "token",
    } as unknown as Asset,
    {
      id: "88f2647c-740e-4bbb-baed-c809302fea79",
      chainId: 137,
      decimals: 18,
      address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      name: "Wrapped Ether",
      type: "token",
    } as unknown as Asset,
  ]);
  const provider = await getProvider({ chainId: 137 });
  const prices = await getPrices({
    assetStore,
    provider,
    assetIds: [
      "e251ecf6-48c2-4538-afcd-fbb92424054d",
      "88f2647c-740e-4bbb-baed-c809302fea79",
    ],
  });

  const priceUsdc = prices["e251ecf6-48c2-4538-afcd-fbb92424054d"];
  const priceWeth = prices["88f2647c-740e-4bbb-baed-c809302fea79"];
  console.log({ priceUsdc, priceWeth });

  expect(priceUsdc).toBeGreaterThan(0);
  expect(priceWeth).toBeGreaterThan(0);
});

test("gamma", async () => {
  const assetStore = new AssetStore([
    {
      id: "e251ecf6-48c2-4538-afcd-fbb92424054d",
      chainId: 137,
      decimals: 6,
      address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      name: "USD Coin",
      type: "token",
    } as unknown as Asset,
    {
      id: "dfe40dda-5c96-4ff3-b773-386f1ca0868d",
      chainId: 137,
      decimals: 6,
      address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      name: "USDT",
      type: "token",
    } as unknown as Asset,
    {
      id: "b21413ac-e549-4406-9ee7-d15799046968",
      name: "USDC/USDT",
      chainId: 137,
      decimals: 18,
      address: "0xA7565DFeb16010153D3368E002Ec53CBfaf96e05",
      type: "gammaDeposit",
      linkedAssets: [
        {
          assetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
          fraction: 0.552,
        },
        {
          assetId: "dfe40dda-5c96-4ff3-b773-386f1ca0868d",
          fraction: 0.448,
        },
      ],
    } as unknown as Asset,
  ]);
  const provider = await getProvider({ chainId: 137 });
  const prices = await getPrices({
    assetStore,
    provider,
    assetIds: ["b21413ac-e549-4406-9ee7-d15799046968"],
  });

  const priceGammaPool = prices["b21413ac-e549-4406-9ee7-d15799046968"];

  console.log({ priceGammaPool });

  expect(priceGammaPool).toBeGreaterThan(0);
});
