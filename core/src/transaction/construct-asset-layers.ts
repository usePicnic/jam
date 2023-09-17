import {
  AssetLayer,
  AssetLayers,
  AssetStore,
  FractionAllocation,
  FractionAllocationItem,
} from "./types";

// Recursively constructs asset layers based on linked assets and rewards.
// Expands the layers with the linked assets and their associated fractions.
function constructAssetLayersRecursive({
  layerNumber,
  assetStore,
  assetId,
  fraction,
  accumulatedLayers = [],
  rewards = [],
}: {
  layerNumber: number;
  assetStore: AssetStore;
  assetId: string;
  fraction: number;
  accumulatedLayers: AssetLayers;
  rewards?: FractionAllocationItem[];
}): AssetLayer[] {
  let layers = [...accumulatedLayers];
  const asset = assetStore.byId[assetId];
  if (asset.linkedAssets !== undefined) {
    for (let i = 0; i < asset.linkedAssets.length; i += 1) {
      layers = constructAssetLayersRecursive({
        layerNumber: layerNumber + 1,
        assetStore,
        assetId: asset.linkedAssets[i].assetId,
        fraction: fraction * asset.linkedAssets[i].fraction,
        accumulatedLayers: layers,
      });
    }
  }

  if (rewards.length > 0) {
    for (let i = 0; i < rewards.length; i += 1) {
      layers = constructAssetLayersRecursive({
        layerNumber: layerNumber + 1,
        assetStore,
        assetId: rewards[i].assetId,
        fraction: rewards[i].fraction,
        accumulatedLayers: layers,
      });
    }
  }

  while (layers[layerNumber] === undefined) {
    layers.push({});
  }

  layers[layerNumber][assetId] = { assetId, fraction };

  return layers;
}

// Computes the maximum depth (layer number) for a given asset taking into
// account its linked assets and rewards.
export function getMaxLayerDepth({
  assetStore,
  assetId,
  rewards,
}: {
  assetStore: AssetStore;
  assetId: string;
  rewards?: FractionAllocationItem[];
}) {
  const layers = constructAssetLayersRecursive({
    layerNumber: 0,
    assetStore,
    assetId,
    fraction: 1,
    accumulatedLayers: [],
    rewards,
  });
  return layers.length - 1;
}

// Combines two sets of asset layers.
// Ensures that fractions of common assets between the layers are summed up.
export function combineAssetLayers({
  assetLayers,
  processedAsset,
}: {
  assetLayers: AssetLayers;
  processedAsset: AssetLayers;
}) {
  const resultLayers = [...assetLayers];
  for (let layer = 0; layer < processedAsset.length; layer += 1) {
    const layerAssets = Object.keys(processedAsset[layer]);

    for (let i = 0; i < layerAssets.length; i += 1) {
      const assetId = layerAssets[i];

      while (resultLayers[layer] === undefined) {
        resultLayers.push({});
      }
      if (resultLayers[layer][assetId] === undefined) {
        resultLayers[layer][assetId] = { assetId, fraction: 0 };
      }
      if (processedAsset[layer][assetId].rewards !== undefined) {
        resultLayers[layer][assetId].rewards =
          processedAsset[layer][assetId].rewards;
      }

      resultLayers[layer][assetId].fraction +=
        processedAsset[layer][assetId].fraction;
    }
  }
  return resultLayers;
}

// Restructures the layers of assets based on a predefined depth or layer for each asset.
// Ensures that assets are positioned at the correct depth in the result.
export function restructureLayersByDepth({
  processedAsset,
  minLayerByAsset,
}: {
  processedAsset: AssetLayers;
  minLayerByAsset: { [key: string]: number };
}): AssetLayers {
  const resultLayers: AssetLayers = [];
  for (let layer = 0; layer < processedAsset.length; layer += 1) {
    const layerAssets = Object.keys(processedAsset[layer]);

    for (let i = 0; i < layerAssets.length; i += 1) {
      const assetId = layerAssets[i];

      while (resultLayers[layer] === undefined) {
        resultLayers.push({});
      }
      if (resultLayers[minLayerByAsset[assetId]][assetId] === undefined) {
        resultLayers[minLayerByAsset[assetId]][assetId] = {
          assetId,
          fraction: 0,
        };
      }
      if (processedAsset[layer][assetId].rewards !== undefined) {
        resultLayers[minLayerByAsset[assetId]][assetId].rewards =
          processedAsset[layer][assetId].rewards;
      }

      resultLayers[minLayerByAsset[assetId]][assetId].fraction +=
        processedAsset[layer][assetId].fraction;
    }
  }
  return resultLayers;
}

// Computes the shallowest (smallest) layer in which each asset appears.
// Helps in determining the correct layer for each asset during restructuring.
function getShallowestLayerByAsset({
  portfolioAssetLayers,
}: {
  portfolioAssetLayers: AssetLayers;
}): { [key: string]: number } {
  const minLayerByAsset: { [key: string]: number } = {};

  for (let layer = 0; layer < portfolioAssetLayers.length; layer += 1) {
    const layerAssets = Object.keys(portfolioAssetLayers[layer]);

    for (let i = 0; i < layerAssets.length; i += 1) {
      const assetId = layerAssets[i];
      if (minLayerByAsset[assetId] === undefined) {
        minLayerByAsset[assetId] = layer;
      } else {
        minLayerByAsset[assetId] = Math.min(minLayerByAsset[assetId], layer);
      }
    }
  }

  return minLayerByAsset;
}

// Constructs asset layers up to a specified maximum depth (maxLayer).
// Considers linked assets and their fractions and organizes them by type (token vs non-token) and their respective layer depth.
export function accumulateLayersUpToMax({
  maxLayer,
  layerNumber,
  assetStore,
  assetId,
  fraction,
  previousLayers,
  rewards = [],
}: {
  maxLayer: number;
  layerNumber: number;
  assetStore: AssetStore;
  assetId: string;
  fraction: number;
  previousLayers: AssetLayers;
  rewards?: FractionAllocation;
}) {
  let layers = [...previousLayers];
  const asset = assetStore.byId[assetId];
  if (asset.linkedAssets !== undefined) {
    for (let i = 0; i < asset.linkedAssets.length; i += 1) {
      layers = accumulateLayersUpToMax({
        maxLayer,
        layerNumber: layerNumber + 1,
        assetStore,
        assetId: asset.linkedAssets[i].assetId,
        fraction: fraction * asset.linkedAssets[i].fraction,
        previousLayers: layers,
      });
    }
  }
  if (rewards) {
    for (let i = 0; i < rewards.length; i += 1) {
      layers = accumulateLayersUpToMax({
        maxLayer,
        layerNumber: layerNumber + 1,
        assetStore,
        assetId: rewards[i].assetId,
        fraction: rewards[i].fraction,
        previousLayers: layers,
      });
    }
  }

  while (layers[maxLayer] === undefined) {
    layers.push({});
  }

  const layer = asset.type === "token" ? maxLayer : layerNumber;
  if (layers[layer][assetId] === undefined) {
    layers[layer][assetId] = {
      assetId: assetId,
      fraction,
      rewards: rewards,
    };
  } else {
    layers[layer][assetId].fraction += fraction;
    // TODO will need to refactor when we have nested rewards
  }

  return layers;
}

// Constructs the overall asset layers based on a provided allocation.
// Uses a combination of helper functions to ensure assets are organized properly in their respective layers.
export function constructAssetLayers({
  assetStore,
  allocation,
}: {
  assetStore: AssetStore;
  allocation: FractionAllocation;
}) {
  let baseAssetLayers: AssetLayers = [];
  for (let i = 0; i < allocation.length; i += 1) {
    const maxLayer = getMaxLayerDepth({
      assetStore,
      assetId: allocation[i].assetId,
      rewards: allocation[i].rewards,
    });
    const assetLayers = accumulateLayersUpToMax({
      maxLayer,
      layerNumber: 0,
      assetStore,
      assetId: allocation[i].assetId,
      fraction: allocation[i].fraction,
      previousLayers: [],
      rewards: allocation[i].rewards,
    }).reverse();
    baseAssetLayers = combineAssetLayers({
      assetLayers: baseAssetLayers,
      processedAsset: assetLayers,
    });
  }
  const minLayerByAsset = getShallowestLayerByAsset({
    portfolioAssetLayers: baseAssetLayers,
  });
  return restructureLayersByDepth({
    processedAsset: baseAssetLayers,
    minLayerByAsset,
  });
}
