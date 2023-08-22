import { expect, test } from "vitest";
import { constructAssetLayers } from "./construct-asset-layers";
import { AssetStore, AssetLayers, FractionAllocation } from "./types";

test("constructAssetLayers: several assets, several layers, no rewards", () => {
  const assetStore: AssetStore = {
    "f9a0d8c9-7524-42ed-9188-968456afcd54": {
      id: "f9a0d8c9-7524-42ed-9188-968456afcd54",
      name: "DAI",
      networkName: "polygon",
      active: true,
      address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
      color: "#fcb934",
      decimals: 18,
      rawLogoUri: "/asset-logos/f9a0d8c9-7524-42ed-9188-968456afcd54.svg",
      symbol: "DAI",
      type: "token",
      visible: false,
      logos: [
        {
          logoUri: "/asset-logos/f9a0d8c9-7524-42ed-9188-968456afcd54.svg",
          name: "DAI",
          symbol: "DAI",
          color: "#fcb934",
        },
      ],
    },
    "0ed514f8-a0a7-47d1-b8d0-2d17d6818131": {
      id: "0ed514f8-a0a7-47d1-b8d0-2d17d6818131",
      name: "DAI",
      networkName: "polygon",
      active: true,
      address: "0x27F8D03b3a2196956ED754baDc28D73be8830A6e",
      color: "#fcb934",
      decimals: 18,
      rawLogoUri: "/asset-logos/0ed514f8-a0a7-47d1-b8d0-2d17d6818131.svg",
      symbol: "DAI",
      type: "IAaveV2Deposit",
      visible: true,
      logos: [
        {
          logoUri: "/asset-logos/f9a0d8c9-7524-42ed-9188-968456afcd54.svg",
          name: "DAI",
          symbol: "DAI",
          color: "#fcb934",
        },
      ],
      linkedAssets: [
        { assetId: "f9a0d8c9-7524-42ed-9188-968456afcd54", fraction: 1 },
      ],
    },
    "d21331f3-3db3-40e9-b972-ffddc5a6a795": {
      id: "d21331f3-3db3-40e9-b972-ffddc5a6a795",
      name: "Staked MATIC (PoS)",
      networkName: "polygon",
      active: true,
      address: "0x3A58a54C066FdC0f2D55FC9C89F0415C92eBf3C4",
      color: "#000000",
      decimals: 18,
      rawLogoUri: "/asset-logos/d21331f3-3db3-40e9-b972-ffddc5a6a795.png",
      symbol: "stMATIC",
      type: "token",
      visible: false,
      logos: [
        {
          logoUri: "/asset-logos/d21331f3-3db3-40e9-b972-ffddc5a6a795.png",
          name: "Staked MATIC (PoS)",
          symbol: "stMATIC",
          color: "#000000",
        },
      ],
    },
    "e251ecf6-48c2-4538-afcd-fbb92424054d": {
      id: "e251ecf6-48c2-4538-afcd-fbb92424054d",
      name: "USD Coin",
      networkName: "polygon",
      active: true,
      address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      color: "#2775ca",
      decimals: 6,
      rawLogoUri: "/asset-logos/e251ecf6-48c2-4538-afcd-fbb92424054d.png",
      symbol: "USDC",
      type: "token",
      visible: false,
      logos: [
        {
          logoUri: "/asset-logos/e251ecf6-48c2-4538-afcd-fbb92424054d.png",
          name: "USD Coin",
          symbol: "USDC",
          color: "#2775ca",
        },
      ],
    },
    "7860c217-bf77-4fdd-bfe1-b7613555606a": {
      id: "7860c217-bf77-4fdd-bfe1-b7613555606a",
      name: "USD Coin",
      networkName: "polygon",
      active: true,
      address: "0x1a13F4Ca1d028320A707D99520AbFefca3998b7F",
      color: "#2775ca",
      decimals: 6,
      rawLogoUri: "/asset-logos/7860c217-bf77-4fdd-bfe1-b7613555606a.png",
      symbol: "USDC",
      type: "IAaveV2Deposit",
      visible: true,
      logos: [
        {
          logoUri: "/asset-logos/e251ecf6-48c2-4538-afcd-fbb92424054d.png",
          name: "USD Coin",
          symbol: "USDC",
          color: "#2775ca",
        },
      ],
      linkedAssets: [
        { assetId: "e251ecf6-48c2-4538-afcd-fbb92424054d", fraction: 1 },
      ],
    },
    "dfe40dda-5c96-4ff3-b773-386f1ca0868d": {
      id: "dfe40dda-5c96-4ff3-b773-386f1ca0868d",
      name: "USDT",
      networkName: "polygon",
      active: true,
      address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      color: "#54ae93",
      decimals: 6,
      rawLogoUri: "/asset-logos/dfe40dda-5c96-4ff3-b773-386f1ca0868d.png",
      symbol: "USDT",
      type: "token",
      visible: false,
      logos: [
        {
          logoUri: "/asset-logos/dfe40dda-5c96-4ff3-b773-386f1ca0868d.png",
          name: "USDT",
          symbol: "USDT",
          color: "#54ae93",
        },
      ],
    },
    "7e8997e9-15ca-46f4-8c91-156f8167d658": {
      id: "7e8997e9-15ca-46f4-8c91-156f8167d658",
      name: "USDT",
      networkName: "polygon",
      active: true,
      address: "0x60D55F02A771d515e077c9C2403a1ef324885CeC",
      color: "#54ae93",
      decimals: 6,
      rawLogoUri: "/asset-logos/7e8997e9-15ca-46f4-8c91-156f8167d658.png",
      symbol: "USDT",
      type: "IAaveV2Deposit",
      visible: true,
      logos: [
        {
          logoUri: "/asset-logos/dfe40dda-5c96-4ff3-b773-386f1ca0868d.png",
          name: "USDT",
          symbol: "USDT",
          color: "#54ae93",
        },
      ],
      linkedAssets: [
        { assetId: "dfe40dda-5c96-4ff3-b773-386f1ca0868d", fraction: 1 },
      ],
    },
    "f2f758e0-2bd9-4a26-96ce-a4058fee33c8": {
      id: "f2f758e0-2bd9-4a26-96ce-a4058fee33c8",
      name: "WMATIC/stMATIC",
      networkName: "polygon",
      active: true,
      address: "0xaF5E0B5425dE1F5a630A8cB5AA9D97B8141C908D",
      color: "#468af0",
      decimals: 18,
      symbol: "WMATIC/stMATIC",
      type: "IBalancerLiquidity",
      visible: false,
      logos: [
        {
          logoUri: "/asset-logos/d604439e-d464-4df5-bed1-66815b348cab.png",
          name: "Wrapped Matic",
          symbol: "WMATIC",
          color: "#468af0",
        },
        {
          logoUri: "/asset-logos/d21331f3-3db3-40e9-b972-ffddc5a6a795.png",
          name: "Staked MATIC (PoS)",
          symbol: "stMATIC",
          color: "#000000",
        },
      ],
      linkedAssets: [
        { assetId: "d604439e-d464-4df5-bed1-66815b348cab", fraction: 0.5 },
        { assetId: "d21331f3-3db3-40e9-b972-ffddc5a6a795", fraction: 0.5 },
      ],
    },
    "7eecd38c-6ec4-4032-b1bd-bbd1bb82404f": {
      id: "7eecd38c-6ec4-4032-b1bd-bbd1bb82404f",
      name: "Wrapped Bitcoin",
      networkName: "polygon",
      active: true,
      address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
      color: "#342743",
      decimals: 8,
      rawLogoUri: "/asset-logos/7eecd38c-6ec4-4032-b1bd-bbd1bb82404f.png",
      symbol: "WBTC",
      type: "token",
      visible: true,
      logos: [
        {
          logoUri: "/asset-logos/7eecd38c-6ec4-4032-b1bd-bbd1bb82404f.png",
          name: "Wrapped Bitcoin",
          symbol: "WBTC",
          color: "#342743",
        },
      ],
    },
    "88f2647c-740e-4bbb-baed-c809302fea79": {
      id: "88f2647c-740e-4bbb-baed-c809302fea79",
      name: "Wrapped Ether",
      networkName: "polygon",
      active: true,
      address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      color: "#737475",
      decimals: 18,
      rawLogoUri: "/asset-logos/88f2647c-740e-4bbb-baed-c809302fea79.png",
      symbol: "WETH",
      type: "token",
      visible: true,
      logos: [
        {
          logoUri: "/asset-logos/88f2647c-740e-4bbb-baed-c809302fea79.png",
          name: "Wrapped Ether",
          symbol: "WETH",
          color: "#737475",
        },
      ],
    },
    "66d10ee1-1a78-46d3-a9d5-77862e36cb66": {
      id: "66d10ee1-1a78-46d3-a9d5-77862e36cb66",
      name: "Wrapped Ether",
      networkName: "polygon",
      active: true,
      address: "0x28424507fefb6f7f8E9D3860F56504E4e5f5f390",
      color: "#737475",
      decimals: 18,
      rawLogoUri: "/asset-logos/66d10ee1-1a78-46d3-a9d5-77862e36cb66.png",
      symbol: "WETH",
      type: "IAaveV2Deposit",
      visible: true,
      logos: [
        {
          logoUri: "/asset-logos/88f2647c-740e-4bbb-baed-c809302fea79.png",
          name: "Wrapped Ether",
          symbol: "WETH",
          color: "#737475",
        },
      ],
      linkedAssets: [
        { assetId: "88f2647c-740e-4bbb-baed-c809302fea79", fraction: 1 },
      ],
    },
    "d604439e-d464-4df5-bed1-66815b348cab": {
      id: "d604439e-d464-4df5-bed1-66815b348cab",
      name: "Wrapped Matic",
      networkName: "polygon",
      active: true,
      address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      color: "#468af0",
      decimals: 18,
      rawLogoUri: "/asset-logos/d604439e-d464-4df5-bed1-66815b348cab.png",
      symbol: "WMATIC",
      type: "token",
      visible: false,
      logos: [
        {
          logoUri: "/asset-logos/d604439e-d464-4df5-bed1-66815b348cab.png",
          name: "Wrapped Matic",
          symbol: "WMATIC",
          color: "#468af0",
        },
      ],
    },
    "c070f499-7900-4ef8-87ff-dcc5a7a0df01": {
      id: "c070f499-7900-4ef8-87ff-dcc5a7a0df01",
      name: "DAI/USDC/USDT",
      networkName: "polygon",
      active: true,
      address: "0xE7a24EF0C5e95Ffb0f6684b813A78F2a3AD7D171",
      color: "#fcb934",
      decimals: 18,
      symbol: "DAI/USDC/USDT",
      type: "ICurveLiquidity",
      visible: false,
      logos: [
        {
          logoUri: "/asset-logos/f9a0d8c9-7524-42ed-9188-968456afcd54.svg",
          name: "DAI",
          symbol: "DAI",
          color: "#fcb934",
        },
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
          assetId: "0ed514f8-a0a7-47d1-b8d0-2d17d6818131",
          fraction: 0.3333333333333333,
        },
        {
          assetId: "7860c217-bf77-4fdd-bfe1-b7613555606a",
          fraction: 0.3333333333333333,
        },
        {
          assetId: "7e8997e9-15ca-46f4-8c91-156f8167d658",
          fraction: 0.3333333333333333,
        },
      ],
    },
    "a4c294f1-5cb0-431a-9df7-ac2f784e9449": {
      id: "a4c294f1-5cb0-431a-9df7-ac2f784e9449",
      name: "Jarvis Synthetic Euro",
      networkName: "polygon",
      active: true,
      address: "0x4e3Decbb3645551B8A19f0eA1678079FCB33fB4c",
      color: "#04349b",
      decimals: 18,
      rawLogoUri: "/asset-logos/a4c294f1-5cb0-431a-9df7-ac2f784e9449.png",
      symbol: "jEUR",
      type: "IJarvisV6Mint",
      visible: false,
      logos: [
        {
          logoUri: "/asset-logos/a4c294f1-5cb0-431a-9df7-ac2f784e9449.png",
          name: "Jarvis Synthetic Euro",
          symbol: "jEUR",
          color: "#04349b",
        },
      ],
      linkedAssets: [
        { assetId: "e251ecf6-48c2-4538-afcd-fbb92424054d", fraction: 1 },
      ],
    },
    "cd2c4aef-ddc3-4e65-8793-660c4ae60718": {
      id: "cd2c4aef-ddc3-4e65-8793-660c4ae60718",
      name: "agEUR/jEUR",
      networkName: "polygon",
      active: true,
      address: "0x9c55488f8AdC23544B8571757169AE17865ABFC8",
      color: "#4a3f81",
      decimals: 18,
      symbol: "agEUR/jEUR",
      type: "IHarvestDeposit",
      visible: false,
      logos: [
        {
          logoUri: "/asset-logos/a4c294f1-5cb0-431a-9df7-ac2f784e9449.png",
          name: "Jarvis Synthetic Euro",
          symbol: "jEUR",
          color: "#4a3f81",
        },
      ],
      linkedAssets: [
        { assetId: "d05921ce-17d8-4084-9123-b88efba30801", fraction: 1 },
      ],
    },
    "d05921ce-17d8-4084-9123-b88efba30801": {
      id: "d05921ce-17d8-4084-9123-b88efba30801",
      name: "agEUR/jEUR",
      networkName: "polygon",
      active: true,
      address: "0x2fFbCE9099cBed86984286A54e5932414aF4B717",
      color: "#4a3f81",
      decimals: 18,
      symbol: "agEUR/jEUR",
      type: "ICurveLiquidity",
      visible: false,
      logos: [
        {
          logoUri: "/asset-logos/a4c294f1-5cb0-431a-9df7-ac2f784e9449.png",
          name: "Jarvis Synthetic Euro",
          symbol: "jEUR",
          color: "#4a3f81",
        },
      ],
      linkedAssets: [
        { assetId: "a90df6e3-3084-40bf-b435-10f3b3691eed", fraction: 0 },
        { assetId: "a4c294f1-5cb0-431a-9df7-ac2f784e9449", fraction: 1 },
      ],
    },
    "a90df6e3-3084-40bf-b435-10f3b3691eed": {
      id: "a90df6e3-3084-40bf-b435-10f3b3691eed",
      name: "agEUR",
      networkName: "polygon",
      active: true,
      address: "0xE0B52e49357Fd4DAf2c15e02058DCE6BC0057db4",
      color: "#fa2649",
      decimals: 18,
      rawLogoUri: "/asset-logos/a90df6e3-3084-40bf-b435-10f3b3691eed.webp",
      symbol: "agEUR",
      type: "IlliquidStable",
      visible: false,
      logos: [
        {
          logoUri: "/asset-logos/a90df6e3-3084-40bf-b435-10f3b3691eed.webp",
          name: "Jarvis Synthetic Euro",
          symbol: "jEUR",
          color: "#04349b",
        },
      ],
    },
    "f4820346-c128-4feb-b4cf-949e8af20e99": {
      id: "f4820346-c128-4feb-b4cf-949e8af20e99",
      name: "am3CRV",
      networkName: "polygon",
      active: true,
      address: "0xB747dC61bA6509Da426A3BDc69B69040dD916f87",
      color: "#fcb934",
      decimals: 18,
      symbol: "DAI/USDC/USDT",
      type: "IAutofarmDeposit",
      visible: false,
      logos: [
        {
          logoUri: "/asset-logos/f9a0d8c9-7524-42ed-9188-968456afcd54.svg",
          name: "DAI",
          symbol: "DAI",
          color: "#fcb934",
        },
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
        { assetId: "c070f499-7900-4ef8-87ff-dcc5a7a0df01", fraction: 1 },
      ],
    },
    "797572bd-5e15-43b1-8177-daf55af62e15": {
      id: "797572bd-5e15-43b1-8177-daf55af62e15",
      name: "WMATIC/stMATIC",
      networkName: "polygon",
      active: true,
      address: "0x755e426A8B445eAE53b1c051c1E7acA7381fCDb7",
      color: "#468af0",
      decimals: 18,
      symbol: "WMATIC/stMATIC",
      type: "IBeefyDeposit",
      visible: false,
      logos: [
        {
          logoUri: "/asset-logos/d604439e-d464-4df5-bed1-66815b348cab.png",
          name: "Wrapped Matic",
          symbol: "WMATIC",
          color: "#468af0",
        },
        {
          logoUri: "/asset-logos/d21331f3-3db3-40e9-b972-ffddc5a6a795.png",
          name: "Staked MATIC (PoS)",
          symbol: "stMATIC",
          color: "#000000",
        },
      ],
      linkedAssets: [
        { assetId: "f2f758e0-2bd9-4a26-96ce-a4058fee33c8", fraction: 1 },
      ],
    },
  } as unknown as AssetStore;

  const allocation: FractionAllocation = [
    {
      assetId: "66d10ee1-1a78-46d3-a9d5-77862e36cb66",
      fraction: 0.2104,
      rewards: [],
    },
    {
      assetId: "7eecd38c-6ec4-4032-b1bd-bbd1bb82404f",
      fraction: 0.2256,
      rewards: [],
    },
    {
      assetId: "797572bd-5e15-43b1-8177-daf55af62e15",
      fraction: 0.1465,
      rewards: [],
    },
    {
      assetId: "f4820346-c128-4feb-b4cf-949e8af20e99",
      fraction: 0.1659,
      rewards: [],
    },
    {
      assetId: "cd2c4aef-ddc3-4e65-8793-660c4ae60718",
      fraction: 0.2516,
      rewards: [],
    },
  ];

  const assetLayers: AssetLayers = [
    {
      "88f2647c-740e-4bbb-baed-c809302fea79": {
        assetId: "88f2647c-740e-4bbb-baed-c809302fea79",
        fraction: 0.2104,
        rewards: [],
      },
      "7eecd38c-6ec4-4032-b1bd-bbd1bb82404f": {
        assetId: "7eecd38c-6ec4-4032-b1bd-bbd1bb82404f",
        fraction: 0.2256,
        rewards: [],
      },
      "d604439e-d464-4df5-bed1-66815b348cab": {
        assetId: "d604439e-d464-4df5-bed1-66815b348cab",
        fraction: 0.07325,
        rewards: [],
      },
      "d21331f3-3db3-40e9-b972-ffddc5a6a795": {
        assetId: "d21331f3-3db3-40e9-b972-ffddc5a6a795",
        fraction: 0.07325,
        rewards: [],
      },
      "f9a0d8c9-7524-42ed-9188-968456afcd54": {
        assetId: "f9a0d8c9-7524-42ed-9188-968456afcd54",
        fraction: 0.055299999999999995,
        rewards: [],
      },
      "e251ecf6-48c2-4538-afcd-fbb92424054d": {
        assetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
        fraction: 0.3069,
        rewards: [],
      },
      "dfe40dda-5c96-4ff3-b773-386f1ca0868d": {
        assetId: "dfe40dda-5c96-4ff3-b773-386f1ca0868d",
        fraction: 0.055299999999999995,
        rewards: [],
      },
    },
    {
      "66d10ee1-1a78-46d3-a9d5-77862e36cb66": {
        assetId: "66d10ee1-1a78-46d3-a9d5-77862e36cb66",
        fraction: 0.2104,
        rewards: [],
      },
      "f2f758e0-2bd9-4a26-96ce-a4058fee33c8": {
        assetId: "f2f758e0-2bd9-4a26-96ce-a4058fee33c8",
        fraction: 0.1465,
        rewards: [],
      },
      "0ed514f8-a0a7-47d1-b8d0-2d17d6818131": {
        assetId: "0ed514f8-a0a7-47d1-b8d0-2d17d6818131",
        fraction: 0.055299999999999995,
        rewards: [],
      },
      "7860c217-bf77-4fdd-bfe1-b7613555606a": {
        assetId: "7860c217-bf77-4fdd-bfe1-b7613555606a",
        fraction: 0.055299999999999995,
        rewards: [],
      },
      "7e8997e9-15ca-46f4-8c91-156f8167d658": {
        assetId: "7e8997e9-15ca-46f4-8c91-156f8167d658",
        fraction: 0.055299999999999995,
        rewards: [],
      },
      "a90df6e3-3084-40bf-b435-10f3b3691eed": {
        assetId: "a90df6e3-3084-40bf-b435-10f3b3691eed",
        fraction: 0,
        rewards: [],
      },
      "a4c294f1-5cb0-431a-9df7-ac2f784e9449": {
        assetId: "a4c294f1-5cb0-431a-9df7-ac2f784e9449",
        fraction: 0.2516,
        rewards: [],
      },
    },
    {
      "797572bd-5e15-43b1-8177-daf55af62e15": {
        assetId: "797572bd-5e15-43b1-8177-daf55af62e15",
        fraction: 0.1465,
        rewards: [],
      },
      "c070f499-7900-4ef8-87ff-dcc5a7a0df01": {
        assetId: "c070f499-7900-4ef8-87ff-dcc5a7a0df01",
        fraction: 0.1659,
        rewards: [],
      },
      "d05921ce-17d8-4084-9123-b88efba30801": {
        assetId: "d05921ce-17d8-4084-9123-b88efba30801",
        fraction: 0.2516,
        rewards: [],
      },
    },
    {
      "f4820346-c128-4feb-b4cf-949e8af20e99": {
        assetId: "f4820346-c128-4feb-b4cf-949e8af20e99",
        fraction: 0.1659,
        rewards: [],
      },
      "cd2c4aef-ddc3-4e65-8793-660c4ae60718": {
        assetId: "cd2c4aef-ddc3-4e65-8793-660c4ae60718",
        fraction: 0.2516,
        rewards: [],
      },
    },
  ];

  const returnedAssetLayers = constructAssetLayers({
    assetStore,
    allocation,
  });

  expect(assetLayers).toMatchObject(returnedAssetLayers);
});

test("constructAssetLayers: several assets, single layer", () => {
  const assetStore: AssetStore = {
    "054c5826-a523-45ac-b58e-4d35735279e5": {
      id: "054c5826-a523-45ac-b58e-4d35735279e5",
    },
    "8bcdeda0-1a23-4cb4-83a1-0b4ccd8ad00c": {
      id: "8bcdeda0-1a23-4cb4-83a1-0b4ccd8ad00c",
    },
    "c46f419c-7049-4bc9-bb20-4d3c1d2a5455": {
      id: "c46f419c-7049-4bc9-bb20-4d3c1d2a5455",
    },
    "fdaa23f1-d85e-494f-9370-671a5b045160": {
      id: "fdaa23f1-d85e-494f-9370-671a5b045160",
    },
    "27f50305-72b0-4910-87f7-4b052054e377": {
      id: "27f50305-72b0-4910-87f7-4b052054e377",
    },
    "733806ed-7652-42bd-a103-2a5435b094e4": {
      id: "733806ed-7652-42bd-a103-2a5435b094e4",
    },
    "aef468a7-2c18-4ee8-85d3-59c4e41a7080": {
      id: "aef468a7-2c18-4ee8-85d3-59c4e41a7080",
    },
  } as unknown as AssetStore;

  const allocation: FractionAllocation = [
    {
      assetId: "c46f419c-7049-4bc9-bb20-4d3c1d2a5455",
      fraction: 0.2172,
      rewards: [],
    },
    {
      assetId: "8bcdeda0-1a23-4cb4-83a1-0b4ccd8ad00c",
      fraction: 0.2116,
      rewards: [],
    },
    {
      assetId: "27f50305-72b0-4910-87f7-4b052054e377",
      fraction: 0.2109,
      rewards: [],
    },
    {
      assetId: "733806ed-7652-42bd-a103-2a5435b094e4",
      fraction: 0.1856,
      rewards: [],
    },
    {
      assetId: "aef468a7-2c18-4ee8-85d3-59c4e41a7080",
      fraction: 0.0741,
      rewards: [],
    },
    {
      assetId: "054c5826-a523-45ac-b58e-4d35735279e5",
      fraction: 0.0676,
      rewards: [],
    },
    {
      assetId: "fdaa23f1-d85e-494f-9370-671a5b045160",
      fraction: 0.033,
      rewards: [],
    },
  ];

  const assetLayers: AssetLayers = [
    {
      "c46f419c-7049-4bc9-bb20-4d3c1d2a5455": {
        assetId: "c46f419c-7049-4bc9-bb20-4d3c1d2a5455",
        fraction: 0.2172,
        rewards: [],
      },
      "8bcdeda0-1a23-4cb4-83a1-0b4ccd8ad00c": {
        assetId: "8bcdeda0-1a23-4cb4-83a1-0b4ccd8ad00c",
        fraction: 0.2116,
        rewards: [],
      },
      "27f50305-72b0-4910-87f7-4b052054e377": {
        assetId: "27f50305-72b0-4910-87f7-4b052054e377",
        fraction: 0.2109,
        rewards: [],
      },
      "733806ed-7652-42bd-a103-2a5435b094e4": {
        assetId: "733806ed-7652-42bd-a103-2a5435b094e4",
        fraction: 0.1856,
        rewards: [],
      },
      "aef468a7-2c18-4ee8-85d3-59c4e41a7080": {
        assetId: "aef468a7-2c18-4ee8-85d3-59c4e41a7080",
        fraction: 0.0741,
        rewards: [],
      },
      "054c5826-a523-45ac-b58e-4d35735279e5": {
        assetId: "054c5826-a523-45ac-b58e-4d35735279e5",
        fraction: 0.0676,
        rewards: [],
      },
      "fdaa23f1-d85e-494f-9370-671a5b045160": {
        assetId: "fdaa23f1-d85e-494f-9370-671a5b045160",
        fraction: 0.033,
        rewards: [],
      },
    },
  ];

  const returnedAssetLayers = constructAssetLayers({
    assetStore,
    allocation,
  });

  expect(assetLayers).toMatchObject(returnedAssetLayers);
});
