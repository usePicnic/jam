import { test, expect } from "vitest";
import { calculateAssetLayersDelta } from "core/src/transaction/calculate-asset-layers-delta";
import { AssetLayers } from "core/src/transaction/types";

test("computeAssetLayerDelta 1", () => {
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
        rewards: [],
      },
      "c1dd5c79-bd77-486c-afa4-a161c90d5464": {
        assetId: "c1dd5c79-bd77-486c-afa4-a161c90d5464",
        fraction: 0,
        rewards: [],
      },
      "459b5a5f-e739-4911-8095-b54d0d93879d": {
        assetId: "459b5a5f-e739-4911-8095-b54d0d93879d",
        fraction: 0,
        rewards: [],
      },
      "8bcdeda0-1a23-4cb4-83a1-0b4ccd8ad00c": {
        assetId: "8bcdeda0-1a23-4cb4-83a1-0b4ccd8ad00c",
        fraction: 0.12140000000000001,
        rewards: [],
      },
      "48f0325c-e5cc-4dac-9873-793f6c12fe08": {
        assetId: "48f0325c-e5cc-4dac-9873-793f6c12fe08",
        fraction: -0.096,
        rewards: [],
      },
      "85d42621-43a2-4189-930f-9b1ff0cf74f4": {
        assetId: "85d42621-43a2-4189-930f-9b1ff0cf74f4",
        fraction: -0.0254,
        rewards: [],
      },
    },
  ];

  const received = calculateAssetLayersDelta({
    currentAssetLayers,
    futureAssetLayers,
  });

  expect(expected).toMatchObject(received);
});

test("computeAssetLayerDelta 2", () => {
  const currentAssetLayers: AssetLayers = [
    {
      "e251ecf6-48c2-4538-afcd-fbb92424054d": {
        rewards: [],
        assetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
        fraction: 0.7528,
      },
      "eb84598f-9e6f-4a7c-a765-c78adcd74dc3": {
        rewards: [],
        assetId: "eb84598f-9e6f-4a7c-a765-c78adcd74dc3",
        fraction: 0,
      },
      "a4c294f1-5cb0-431a-9df7-ac2f784e9449": {
        rewards: [],
        assetId: "a4c294f1-5cb0-431a-9df7-ac2f784e9449",
        fraction: 0.24720000000000003,
      },
      "822504af-d552-460b-bfd7-3648e0592bab": {
        rewards: [],
        assetId: "822504af-d552-460b-bfd7-3648e0592bab",
        fraction: 0,
      },
      "203a6af7-eb4b-4922-b8ed-de9bdb22db19": {
        rewards: [],
        assetId: "203a6af7-eb4b-4922-b8ed-de9bdb22db19",
        fraction: 0,
      },
      "e938062f-929d-4f94-8ee0-e1223e50e2eb": {
        rewards: [],
        assetId: "e938062f-929d-4f94-8ee0-e1223e50e2eb",
        fraction: 0,
      },
      "b77f9ec4-ce5a-459c-921d-6850439d75ce": {
        rewards: [],
        assetId: "b77f9ec4-ce5a-459c-921d-6850439d75ce",
        fraction: 0,
      },
    },
    {
      "8ec9d949-6bdc-4dbe-8a46-738f9e27c920": {
        rewards: [],
        assetId: "8ec9d949-6bdc-4dbe-8a46-738f9e27c920",
        fraction: 0.253,
      },
      "bff58e67-a9bc-43fe-a720-b77ff5f292b4": {
        rewards: [],
        assetId: "bff58e67-a9bc-43fe-a720-b77ff5f292b4",
        fraction: 0,
      },
      "e7938d9a-9702-4eb0-bb0e-0fc0f636dbc1": {
        rewards: [],
        assetId: "e7938d9a-9702-4eb0-bb0e-0fc0f636dbc1",
        fraction: 0.0004,
      },
      "ae8638a2-fbd5-4d31-934e-2f9a6faf6b79": {
        rewards: [],
        assetId: "ae8638a2-fbd5-4d31-934e-2f9a6faf6b79",
        fraction: 0.2509,
      },
      "ba857983-22ec-4da7-a499-7fe1f128b877": {
        rewards: [],
        assetId: "ba857983-22ec-4da7-a499-7fe1f128b877",
        fraction: 0,
      },
      "9c8618aa-c813-44bf-8bad-1fde15d57b60": {
        rewards: [],
        assetId: "9c8618aa-c813-44bf-8bad-1fde15d57b60",
        fraction: 0.24850000000000003,
      },
      "c679d9c8-0433-4f78-9455-8dce23d358cd": {
        rewards: [],
        assetId: "c679d9c8-0433-4f78-9455-8dce23d358cd",
        fraction: 0,
      },
      "43533e47-2f3d-48e1-a782-8efcbce5ccf2": {
        rewards: [],
        assetId: "43533e47-2f3d-48e1-a782-8efcbce5ccf2",
        fraction: 0.24720000000000003,
      },
    },
    {
      "9701461a-dbb8-4065-a7c8-8c9db0e7e3dc": {
        rewards: [],
        assetId: "9701461a-dbb8-4065-a7c8-8c9db0e7e3dc",
        fraction: 0.253,
      },
      "8facd57e-8b3d-4967-b553-5476f3113fb1": {
        rewards: [],
        assetId: "8facd57e-8b3d-4967-b553-5476f3113fb1",
        fraction: 0.0004,
      },
      "e4e84ad4-8d50-42d9-8b48-90f474146079": {
        rewards: [],
        assetId: "e4e84ad4-8d50-42d9-8b48-90f474146079",
        fraction: 0.2509,
      },
      "d558fec2-1035-41e2-be38-272fef16c7b9": {
        rewards: [],
        assetId: "d558fec2-1035-41e2-be38-272fef16c7b9",
        fraction: 0.24850000000000003,
      },
      "ac640151-e047-4c7b-acfa-0ceb48c6a8c4": {
        rewards: [],
        assetId: "ac640151-e047-4c7b-acfa-0ceb48c6a8c4",
        fraction: 0.0001,
      },
    },
    {
      "682968b6-ec76-4a4e-9844-70746a906e88": {
        rewards: [
          {
            assetId: "8facd57e-8b3d-4967-b553-5476f3113fb1",
            fraction: 0.0001,
          },
        ],
        assetId: "682968b6-ec76-4a4e-9844-70746a906e88",
        fraction: 0.253,
      },
      "499c28a9-8cfa-46df-9ac2-35fcd0373639": {
        rewards: [
          {
            assetId: "8facd57e-8b3d-4967-b553-5476f3113fb1",
            fraction: 0.0002,
          },
        ],
        assetId: "499c28a9-8cfa-46df-9ac2-35fcd0373639",
        fraction: 0.2509,
      },
      "d24e3609-30c3-489f-bec4-3193bc637a3e": {
        rewards: [
          {
            assetId: "8facd57e-8b3d-4967-b553-5476f3113fb1",
            fraction: 0.0001,
          },
        ],
        assetId: "d24e3609-30c3-489f-bec4-3193bc637a3e",
        fraction: 0.24850000000000003,
      },
      "cf1c5a25-0d5d-477e-95d0-732db1cf86b7": {
        rewards: [],
        assetId: "cf1c5a25-0d5d-477e-95d0-732db1cf86b7",
        fraction: 0.0001,
      },
    },
    {
      "45f71644-cd4a-4e2e-9299-f69ebffa455f": {
        rewards: [
          {
            assetId: "cf1c5a25-0d5d-477e-95d0-732db1cf86b7",
            fraction: 0.0001,
          },
        ],
        assetId: "45f71644-cd4a-4e2e-9299-f69ebffa455f",
        fraction: 0.24710000000000001,
      },
    },
  ];

  const futureAssetLayers: AssetLayers = [
    {
      "e251ecf6-48c2-4538-afcd-fbb92424054d": {
        rewards: [],
        assetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
        fraction: 0.7527000000000001,
      },
      "a4c294f1-5cb0-431a-9df7-ac2f784e9449": {
        rewards: [],
        assetId: "a4c294f1-5cb0-431a-9df7-ac2f784e9449",
        fraction: 0.2473,
      },
      "822504af-d552-460b-bfd7-3648e0592bab": {
        rewards: [],
        assetId: "822504af-d552-460b-bfd7-3648e0592bab",
        fraction: 0,
      },
      "e938062f-929d-4f94-8ee0-e1223e50e2eb": {
        rewards: [],
        assetId: "e938062f-929d-4f94-8ee0-e1223e50e2eb",
        fraction: 0,
      },
      "b77f9ec4-ce5a-459c-921d-6850439d75ce": {
        rewards: [],
        assetId: "b77f9ec4-ce5a-459c-921d-6850439d75ce",
        fraction: 0,
      },
    },
    {
      "8ec9d949-6bdc-4dbe-8a46-738f9e27c920": {
        rewards: [],
        assetId: "8ec9d949-6bdc-4dbe-8a46-738f9e27c920",
        fraction: 0.253,
      },
      "bff58e67-a9bc-43fe-a720-b77ff5f292b4": {
        rewards: [],
        assetId: "bff58e67-a9bc-43fe-a720-b77ff5f292b4",
        fraction: 0,
      },
      "ae8638a2-fbd5-4d31-934e-2f9a6faf6b79": {
        rewards: [],
        assetId: "ae8638a2-fbd5-4d31-934e-2f9a6faf6b79",
        fraction: 0.251,
      },
      "ba857983-22ec-4da7-a499-7fe1f128b877": {
        rewards: [],
        assetId: "ba857983-22ec-4da7-a499-7fe1f128b877",
        fraction: 0,
      },
      "9c8618aa-c813-44bf-8bad-1fde15d57b60": {
        rewards: [],
        assetId: "9c8618aa-c813-44bf-8bad-1fde15d57b60",
        fraction: 0.2487,
      },
      "c679d9c8-0433-4f78-9455-8dce23d358cd": {
        rewards: [],
        assetId: "c679d9c8-0433-4f78-9455-8dce23d358cd",
        fraction: 0,
      },
      "43533e47-2f3d-48e1-a782-8efcbce5ccf2": {
        rewards: [],
        assetId: "43533e47-2f3d-48e1-a782-8efcbce5ccf2",
        fraction: 0.2473,
      },
    },
    {
      "9701461a-dbb8-4065-a7c8-8c9db0e7e3dc": {
        rewards: [],
        assetId: "9701461a-dbb8-4065-a7c8-8c9db0e7e3dc",
        fraction: 0.253,
      },
      "e4e84ad4-8d50-42d9-8b48-90f474146079": {
        rewards: [],
        assetId: "e4e84ad4-8d50-42d9-8b48-90f474146079",
        fraction: 0.251,
      },
      "d558fec2-1035-41e2-be38-272fef16c7b9": {
        rewards: [],
        assetId: "d558fec2-1035-41e2-be38-272fef16c7b9",
        fraction: 0.2487,
      },
      "45f71644-cd4a-4e2e-9299-f69ebffa455f": {
        rewards: [],
        assetId: "45f71644-cd4a-4e2e-9299-f69ebffa455f",
        fraction: 0.2473,
      },
    },
    {
      "682968b6-ec76-4a4e-9844-70746a906e88": {
        rewards: [],
        assetId: "682968b6-ec76-4a4e-9844-70746a906e88",
        fraction: 0.253,
      },
      "499c28a9-8cfa-46df-9ac2-35fcd0373639": {
        rewards: [],
        assetId: "499c28a9-8cfa-46df-9ac2-35fcd0373639",
        fraction: 0.251,
      },
      "d24e3609-30c3-489f-bec4-3193bc637a3e": {
        rewards: [],
        assetId: "d24e3609-30c3-489f-bec4-3193bc637a3e",
        fraction: 0.2487,
      },
    },
  ];

  const expected: AssetLayers = [
    {
      "e251ecf6-48c2-4538-afcd-fbb92424054d": {
        rewards: [],
        assetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
        fraction: -0.00009999999999987796,
      },
      "a4c294f1-5cb0-431a-9df7-ac2f784e9449": {
        rewards: [],
        assetId: "a4c294f1-5cb0-431a-9df7-ac2f784e9449",
        fraction: 0.00009999999999996123,
      },
      "822504af-d552-460b-bfd7-3648e0592bab": {
        rewards: [],
        assetId: "822504af-d552-460b-bfd7-3648e0592bab",
        fraction: 0,
      },
      "e938062f-929d-4f94-8ee0-e1223e50e2eb": {
        rewards: [],
        assetId: "e938062f-929d-4f94-8ee0-e1223e50e2eb",
        fraction: 0,
      },
      "b77f9ec4-ce5a-459c-921d-6850439d75ce": {
        rewards: [],
        assetId: "b77f9ec4-ce5a-459c-921d-6850439d75ce",
        fraction: 0,
      },
      "eb84598f-9e6f-4a7c-a765-c78adcd74dc3": {
        assetId: "eb84598f-9e6f-4a7c-a765-c78adcd74dc3",
        fraction: 0,
        rewards: [],
      },
      "203a6af7-eb4b-4922-b8ed-de9bdb22db19": {
        assetId: "203a6af7-eb4b-4922-b8ed-de9bdb22db19",
        fraction: 0,
        rewards: [],
      },
    },
    {
      "8ec9d949-6bdc-4dbe-8a46-738f9e27c920": {
        rewards: [],
        assetId: "8ec9d949-6bdc-4dbe-8a46-738f9e27c920",
        fraction: 0,
      },
      "bff58e67-a9bc-43fe-a720-b77ff5f292b4": {
        rewards: [],
        assetId: "bff58e67-a9bc-43fe-a720-b77ff5f292b4",
        fraction: 0,
      },
      "ae8638a2-fbd5-4d31-934e-2f9a6faf6b79": {
        rewards: [],
        assetId: "ae8638a2-fbd5-4d31-934e-2f9a6faf6b79",
        fraction: 0.00009999999999998899,
      },
      "ba857983-22ec-4da7-a499-7fe1f128b877": {
        rewards: [],
        assetId: "ba857983-22ec-4da7-a499-7fe1f128b877",
        fraction: 0,
      },
      "9c8618aa-c813-44bf-8bad-1fde15d57b60": {
        rewards: [],
        assetId: "9c8618aa-c813-44bf-8bad-1fde15d57b60",
        fraction: 0.00019999999999997797,
      },
      "c679d9c8-0433-4f78-9455-8dce23d358cd": {
        rewards: [],
        assetId: "c679d9c8-0433-4f78-9455-8dce23d358cd",
        fraction: 0,
      },
      "43533e47-2f3d-48e1-a782-8efcbce5ccf2": {
        rewards: [],
        assetId: "43533e47-2f3d-48e1-a782-8efcbce5ccf2",
        fraction: 0.00009999999999996123,
      },
      "e7938d9a-9702-4eb0-bb0e-0fc0f636dbc1": {
        assetId: "e7938d9a-9702-4eb0-bb0e-0fc0f636dbc1",
        fraction: -0.0004,
        rewards: [],
      },
    },
    {
      "9701461a-dbb8-4065-a7c8-8c9db0e7e3dc": {
        rewards: [],
        assetId: "9701461a-dbb8-4065-a7c8-8c9db0e7e3dc",
        fraction: 0,
      },
      "e4e84ad4-8d50-42d9-8b48-90f474146079": {
        rewards: [],
        assetId: "e4e84ad4-8d50-42d9-8b48-90f474146079",
        fraction: 0.00009999999999998899,
      },
      "d558fec2-1035-41e2-be38-272fef16c7b9": {
        rewards: [],
        assetId: "d558fec2-1035-41e2-be38-272fef16c7b9",
        fraction: 0.00019999999999997797,
      },
      "45f71644-cd4a-4e2e-9299-f69ebffa455f": {
        rewards: [],
        assetId: "45f71644-cd4a-4e2e-9299-f69ebffa455f",
        fraction: 0.2473,
      },
      "8facd57e-8b3d-4967-b553-5476f3113fb1": {
        assetId: "8facd57e-8b3d-4967-b553-5476f3113fb1",
        fraction: -0.0004,
        rewards: [],
      },
      "ac640151-e047-4c7b-acfa-0ceb48c6a8c4": {
        assetId: "ac640151-e047-4c7b-acfa-0ceb48c6a8c4",
        fraction: -0.0001,
        rewards: [],
      },
    },
    {
      "682968b6-ec76-4a4e-9844-70746a906e88": {
        rewards: [
          {
            assetId: "8facd57e-8b3d-4967-b553-5476f3113fb1",
            fraction: -0.0001,
          },
        ],
        assetId: "682968b6-ec76-4a4e-9844-70746a906e88",
        fraction: 0,
      },
      "499c28a9-8cfa-46df-9ac2-35fcd0373639": {
        rewards: [
          {
            assetId: "8facd57e-8b3d-4967-b553-5476f3113fb1",
            fraction: -0.0002,
          },
        ],
        assetId: "499c28a9-8cfa-46df-9ac2-35fcd0373639",
        fraction: 0.00009999999999998899,
      },
      "d24e3609-30c3-489f-bec4-3193bc637a3e": {
        rewards: [
          {
            assetId: "8facd57e-8b3d-4967-b553-5476f3113fb1",
            fraction: -0.0001,
          },
        ],
        assetId: "d24e3609-30c3-489f-bec4-3193bc637a3e",
        fraction: 0.00019999999999997797,
      },
      "cf1c5a25-0d5d-477e-95d0-732db1cf86b7": {
        assetId: "cf1c5a25-0d5d-477e-95d0-732db1cf86b7",
        fraction: -0.0001,
        rewards: [],
      },
    },
    {
      "45f71644-cd4a-4e2e-9299-f69ebffa455f": {
        rewards: [
          {
            assetId: "cf1c5a25-0d5d-477e-95d0-732db1cf86b7",
            fraction: -0.0001,
          },
        ],
        assetId: "45f71644-cd4a-4e2e-9299-f69ebffa455f",
        fraction: -0.24710000000000001,
      },
    },
  ];

  const received = calculateAssetLayersDelta({
    currentAssetLayers,
    futureAssetLayers,
  });

  expect(expected).toMatchObject(received);
});

test("computeAssetLayerDelta 3", () => {
  const currentAssetLayers: AssetLayers = [
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

  const futureAssetLayers: AssetLayers = [
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
      "c5129108-4b4d-4aa2-b75b-9d4348bd1678": {
        assetId: "c5129108-4b4d-4aa2-b75b-9d4348bd1678",
        fraction: 0.1405,
      },
    },
  ];

  const expected: AssetLayers = [
    {
      "72c7d69d-7bef-47e5-8907-4c4c6f0bd797": {
        assetId: "72c7d69d-7bef-47e5-8907-4c4c6f0bd797",
        fraction: 0,
        rewards: [],
      },
      "c1dd5c79-bd77-486c-afa4-a161c90d5464": {
        assetId: "c1dd5c79-bd77-486c-afa4-a161c90d5464",
        fraction: 0,
        rewards: [],
      },
      "459b5a5f-e739-4911-8095-b54d0d93879d": {
        assetId: "459b5a5f-e739-4911-8095-b54d0d93879d",
        fraction: 0,
        rewards: [],
      },
      "c5129108-4b4d-4aa2-b75b-9d4348bd1678": {
        assetId: "c5129108-4b4d-4aa2-b75b-9d4348bd1678",
        fraction: 0.1405,
        rewards: [],
      },
      "48f0325c-e5cc-4dac-9873-793f6c12fe08": {
        assetId: "48f0325c-e5cc-4dac-9873-793f6c12fe08",
        fraction: -0.096,
        rewards: [],
      },
      "85d42621-43a2-4189-930f-9b1ff0cf74f4": {
        assetId: "85d42621-43a2-4189-930f-9b1ff0cf74f4",
        fraction: -0.0254,
        rewards: [],
      },
      "8bcdeda0-1a23-4cb4-83a1-0b4ccd8ad00c": {
        assetId: "8bcdeda0-1a23-4cb4-83a1-0b4ccd8ad00c",
        fraction: -0.0191,
        rewards: [],
      },
    },
  ];

  const received = calculateAssetLayersDelta({
    currentAssetLayers,
    futureAssetLayers,
  });

  expect(expected).toMatchObject(received);
});
