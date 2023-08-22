import { AssetLayers, FractionAllocationItem } from "./types";
import _ from "lodash";

export function computeAssetLayersDelta({
  currentAssetLayers,
  futureAssetLayers,
}: {
  currentAssetLayers: AssetLayers;
  futureAssetLayers: AssetLayers;
}): AssetLayers {
  const returnAssetLayers = _.cloneDeep(futureAssetLayers);

  for (let i = 0; i < currentAssetLayers.length; i += 1) {
    const currentLayer = currentAssetLayers[i];
    const currentLayerAssets = Object.keys(currentLayer);
    for (let j = 0; j < currentLayerAssets.length; j += 1) {
      const assetId = currentLayerAssets[j];

      if (returnAssetLayers[i] === undefined) {
        returnAssetLayers[i] = {};
      }
      if (returnAssetLayers[i][assetId] === undefined) {
        returnAssetLayers[i][assetId] = { assetId, fraction: 0 };
      }

      returnAssetLayers[i][assetId].fraction -=
        currentAssetLayers[i][assetId].fraction;

      const rewards = currentAssetLayers[i][assetId].rewards;
      const returnRewards: FractionAllocationItem[] = [];
      if (rewards !== undefined) {
        for (let k = 0; k < rewards.length; k += 1) {
          const reward = rewards[k];
          if (returnRewards[k] === undefined) {
            returnRewards.push({
              assetId: reward.assetId,
              fraction: 0,
            });
          }

          returnRewards[k].fraction -= reward.fraction;
        }
      }

      returnAssetLayers[i][assetId].rewards = returnRewards;
    }
  }
  return returnAssetLayers;
}
