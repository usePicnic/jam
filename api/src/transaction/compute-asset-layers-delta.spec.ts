import { test, expect } from "vitest";
import { computeAssetLayersDelta } from "./compute-asset-layers-delta";
import { compareAssetLayers } from "./test-utils";

test("computeAssetLayerDelta", () => {
  const currentAssetLayers = [
    {
      "72c7d69d-7bef-47e5-8907-4c4c6f0bd797": {
        assetId: "72c7d69d-7bef-47e5-8907-4c4c6f0bd797",
        fraction: 0.375,
      },
      "c1dd5c79-bd77-486c-afa4-a161c90d5464": {
        assetId: "c1dd5c79-bd77-486c-afa4-a161c90d5464",
        fraction: 0.2658,
      },
      "459b5a5f-e739-4911-8095-b54d0d93879d": {
        assetId: "459b5a5f-e739-4911-8095-b54d0d93879d",
        fraction: 0.2187,
      },
      "48f0325c-e5cc-4dac-9873-793f6c12fe08": {
        assetId: "48f0325c-e5cc-4dac-9873-793f6c12fe08",
        fraction: 0.096,
      },
      "85d42621-43a2-4189-930f-9b1ff0cf74f4": {
        assetId: "85d42621-43a2-4189-930f-9b1ff0cf74f4",
        fraction: 0.0254,
      },
      "8bcdeda0-1a23-4cb4-83a1-0b4ccd8ad00c": {
        assetId: "8bcdeda0-1a23-4cb4-83a1-0b4ccd8ad00c",
        fraction: 0.0191,
      },
    },
  ];

  const futureAssetLayers = [
    {
      "72c7d69d-7bef-47e5-8907-4c4c6f0bd797": {
        assetId: "72c7d69d-7bef-47e5-8907-4c4c6f0bd797",
        fraction: 0.375,
      },
      "c1dd5c79-bd77-486c-afa4-a161c90d5464": {
        assetId: "c1dd5c79-bd77-486c-afa4-a161c90d5464",
        fraction: 0.2658,
      },
      "459b5a5f-e739-4911-8095-b54d0d93879d": {
        assetId: "459b5a5f-e739-4911-8095-b54d0d93879d",
        fraction: 0.2187,
      },
      "8bcdeda0-1a23-4cb4-83a1-0b4ccd8ad00c": {
        assetId: "8bcdeda0-1a23-4cb4-83a1-0b4ccd8ad00c",
        fraction: 0.1405,
      },
    },
  ];

  const expected = [
    {
      "72c7d69d-7bef-47e5-8907-4c4c6f0bd797": {
        assetId: "72c7d69d-7bef-47e5-8907-4c4c6f0bd797",
        fraction: 0,
      },
      "c1dd5c79-bd77-486c-afa4-a161c90d5464": {
        assetId: "c1dd5c79-bd77-486c-afa4-a161c90d5464",
        fraction: 0,
      },
      "459b5a5f-e739-4911-8095-b54d0d93879d": {
        assetId: "459b5a5f-e739-4911-8095-b54d0d93879d",
        fraction: 0,
      },
      "8bcdeda0-1a23-4cb4-83a1-0b4ccd8ad00c": {
        assetId: "8bcdeda0-1a23-4cb4-83a1-0b4ccd8ad00c",
        fraction: 0.1214,
      },
      "48f0325c-e5cc-4dac-9873-793f6c12fe08": {
        assetId: "48f0325c-e5cc-4dac-9873-793f6c12fe08",
        fraction: -0.096,
      },
      "85d42621-43a2-4189-930f-9b1ff0cf74f4": {
        assetId: "85d42621-43a2-4189-930f-9b1ff0cf74f4",
        fraction: -0.0254,
      },
    },
  ];

  const received = computeAssetLayersDelta({
    currentAssetLayers,
    futureAssetLayers,
  });

  compareAssetLayers({ expected, received });
});
