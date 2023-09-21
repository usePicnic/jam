import { test, expect } from "vitest";
import {
  AbsoluteAllocation,
  AssetLayers,
  AssetStore,
  CurrentAllocation,
  RouterOperation,
} from "./types";
import { generateSteps } from "./generate-steps";
import { getProvider } from "utils/get-provider";
import { calculateFractionAllocation } from "./compute-fraction-allocation";

test("generateSteps 1", async () => {
  const assetStore = new AssetStore([
    {
      id: "e251ecf6-48c2-4538-afcd-fbb92424054d",
      chainId: 137,
      active: true,
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
    },
    {
      id: "dfe40dda-5c96-4ff3-b773-386f1ca0868d",
      chainId: 137,
      active: true,
      address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      color: "#54ae93",
      decimals: 6,
      logos: [
        {
          logoUri: "/asset-logos/dfe40dda-5c96-4ff3-b773-386f1ca0868d.png",
          name: "USDT",
          symbol: "USDT",
          color: "#54ae93",
        },
      ],
      name: "USDT",
      rawLogoUri: "/asset-logos/dfe40dda-5c96-4ff3-b773-386f1ca0868d.png",
      symbol: "USDT",
      type: "token",
      visible: false,
    },
    {
      id: "b21413ac-e549-4406-9ee7-d15799046968",
      chainId: 137,
      name: "USDC/USDT",
      symbol: "USDC/USDT",
      color: "#54ae93",
      decimals: 18,
      address: "0xA7565DFeb16010153D3368E002Ec53CBfaf96e05",
      active: true,
      visible: false,
      type: "gammaDeposit",
      logos: [
        {
          logoUri: "/asset-logos/e251ecf6-48c2-4538-afcd-fbb92424054d.png",
          name: "USD Coin",
          symbol: "USDC",
          color: "#2775ca",
        },
        {
          logoUri: "/asset-logos/dfe40dda-5c96-4ff3-b773-386f1ca0868d.png",
          name: "USDT",
          symbol: "USDT",
          color: "#54ae93",
        },
      ],
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
    },
    {
      id: "eebcd7b6-3af1-41b2-b547-b0f5b226664e",
      chainId: 137,
      name: "USDC/USDT",
      symbol: "USDC/USDT",
      color: "#54ae93",
      decimals: 18,
      address: "0xAb4E02911A7d09BC8300F39332F087d51c183038",
      active: true,
      visible: true,
      type: "beefyDeposit",
      logos: [
        {
          logoUri: "/asset-logos/e251ecf6-48c2-4538-afcd-fbb92424054d.png",
          name: "USD Coin",
          symbol: "USDC",
          color: "#2775ca",
        },
        {
          logoUri: "/asset-logos/dfe40dda-5c96-4ff3-b773-386f1ca0868d.png",
          name: "USDT",
          symbol: "USDT",
          color: "#54ae93",
        },
      ],
      linkedAssets: [
        {
          assetId: "b21413ac-e549-4406-9ee7-d15799046968",
          fraction: 1,
        },
      ],
    },
    {
      id: "e4be18c2-c20b-4e17-9c17-947dc07cc053",
      chainId: 137,
      active: true,
      address: "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39",
      color: "#2753d8",
      decimals: 18,
      logos: [
        {
          logoUri: "/asset-logos/e4be18c2-c20b-4e17-9c17-947dc07cc053.png",
          name: "ChainLink",
          symbol: "LINK",
          color: "#2753d8",
        },
      ],
      name: "ChainLink",
      rawLogoUri: "/asset-logos/e4be18c2-c20b-4e17-9c17-947dc07cc053.png",
      symbol: "LINK",
      type: "token",
      visible: true,
    },
  ]);

  const diff: AssetLayers = [
    {
      "e251ecf6-48c2-4538-afcd-fbb92424054d": {
        assetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
        fraction: -0.448,
        rewards: [],
      },
      "dfe40dda-5c96-4ff3-b773-386f1ca0868d": {
        assetId: "dfe40dda-5c96-4ff3-b773-386f1ca0868d",
        fraction: 0.448,
        rewards: [],
      },
    },
    {
      "b21413ac-e549-4406-9ee7-d15799046968": {
        assetId: "b21413ac-e549-4406-9ee7-d15799046968",
        fraction: 1,
        rewards: [],
      },
    },
    {
      "eebcd7b6-3af1-41b2-b547-b0f5b226664e": {
        assetId: "eebcd7b6-3af1-41b2-b547-b0f5b226664e",
        fraction: 1,
        rewards: [],
      },
    },
  ];

  const inputAllocation: AbsoluteAllocation = [
    {
      assetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
      amountStr: "100000000000000000000",
    },
    {
      assetId: "e4be18c2-c20b-4e17-9c17-947dc07cc053",
      amountStr: "200000000000000000000",
    },
  ];

  const chainId = 137;
  const provider = await getProvider({ chainId });
  await assetStore.cachePrices({
    allocation: [
      ...inputAllocation,
      { assetId: "eebcd7b6-3af1-41b2-b547-b0f5b226664e", fraction: 1 },
    ],
    provider,
    assetStore,
  });

  const expectedSteps: RouterOperation = {
    steps: [],
    stores: [1234],
  };

  const { totalValue, fractionAllocation: inputFractionAllocation } =
    calculateFractionAllocation({
      absoluteAllocation: inputAllocation,
      assetStore,
    });

  const currentAllocation = new CurrentAllocation({
    fractionAllocation: inputFractionAllocation,
    assetStore,
  });

  const received = await generateSteps({
    chainId,
    diff,
    assetStore,
    totalValue,
    inputAllocation,
    currentAllocation,
  });

  console.log({ expectedSteps, received });
  expect(expectedSteps).toMatchObject(received);
});
