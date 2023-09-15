import { assetTypeStrategies } from "./asset-type-strategies";
import {
  AssetLayer,
  AssetLayers,
  AssetStore,
  DetailedSteps,
  FractionAllocation,
} from "./types";
import _ from "lodash";

async function processBridges({
  assetStore,
  portfolioValue,
  currentLayer,
  currentAllocation,
  isPositive,
  output,
}: {
  assetStore: AssetStore;
  portfolioValue: number;
  currentLayer: AssetLayer;
  currentAllocation: FractionAllocation;
  isPositive: boolean;
  output: DetailedSteps;
}): Promise<DetailedSteps> {
  debugger;
  const assetIds = Object.keys(currentLayer);
  for (const assetId of assetIds) {
    const rewardsSum =
      currentLayer[assetId].rewards
        ?.map((r) => r.fraction)
        .reduce((a, b) => a + b, 0) ?? 0;

    const harvestRewards =
      currentLayer[assetId].fraction >= 0 && rewardsSum < 0 && !isPositive;

    const rewards =
      harvestRewards || currentLayer[assetId].fraction < 0
        ? currentLayer[assetId].rewards
        : [];

    const fraction = harvestRewards ? 0 : currentLayer[assetId].fraction;

    if (
      (isPositive && fraction > 0) ||
      (!isPositive && fraction < 0) ||
      (!isPositive && harvestRewards)
    ) {
      const asset = assetStore.byId[assetId];
      const value = portfolioValue * fraction;
      console.log("step", { asset, fraction, rewards });

      const assetAllocation = currentLayer[assetId];

      // TODO: remove hardcoded chainId
      output = await assetTypeStrategies[137][asset.type].generateStep({
        assetAllocation,
        assetStore,
        value,
        currentAllocation,
        currentSteps: output,
      });

      console.log("currentAllocation", { currentAllocation });
    }
  }
  return output;
}

function splitAssets({ swapLayer }: { swapLayer: AssetLayer }) {
  const positiveAssets = [];
  const negativeAssets = [];

  const swapAssets = Object.keys(swapLayer);

  for (let i = 0; i < swapAssets.length; i += 1) {
    const assetId = swapAssets[i];
    if (swapLayer[assetId].fraction > 0) {
      positiveAssets.push(assetId);
    }
    if (swapLayer[assetId].fraction < 0) {
      negativeAssets.push(assetId);
    }
  }
  return { positiveAssets, negativeAssets };
}

type Swap = {
  from: string;
  to: string;
  amount: number; // TODO: should be called percentage?
};

function calculateSwaps({ swapLayer }: { swapLayer: AssetLayer }): {
  swaps: Swap[];
  updatedSwapLayer: AssetLayer;
} {
  // Clone the input object
  const updatedSwapLayer: AssetLayer = JSON.parse(JSON.stringify(swapLayer));

  const { positiveAssets, negativeAssets } = splitAssets({
    swapLayer: updatedSwapLayer,
  });
  const swaps = [];

  for (let i = 0; i < positiveAssets.length; i += 1) {
    for (let j = 0; j < negativeAssets.length; j += 1) {
      const from = negativeAssets[j];
      const to = positiveAssets[i];

      if (
        updatedSwapLayer[positiveAssets[i]].fraction > 0.0001 &&
        updatedSwapLayer[negativeAssets[j]].fraction < -0.0001
      ) {
        if (updatedSwapLayer[to].fraction <= -updatedSwapLayer[from].fraction) {
          const amount = updatedSwapLayer[to].fraction;

          updatedSwapLayer[from].fraction += updatedSwapLayer[to].fraction;

          updatedSwapLayer[to].fraction = 0;
          if (amount > 0.0001) {
            const swap = { from, to, amount };
            swaps.push(swap);
          }
        } else {
          const amount = -updatedSwapLayer[from].fraction;

          updatedSwapLayer[to].fraction += updatedSwapLayer[from].fraction;

          updatedSwapLayer[from].fraction = 0;
          const swap = { from, to, amount };
          swaps.push(swap);
        }
      }
    }
  }

  return { swaps, updatedSwapLayer };
}

async function swapsToSDetailedSteps({
  portfolioValue,
  assetStore,
  swaps,
  currentLayer,
  currentAllocation,
  output,
}: {
  portfolioValue: number;
  assetStore: AssetStore;
  swaps: Swap[];
  currentLayer: AssetLayer;
  currentAllocation: FractionAllocation;
  output: DetailedSteps;
}): Promise<DetailedSteps> {
  console.log("Running swapsToSDetailedSteps");


  return output;
}

export async function generateSteps({
  diff,
  assetStore,
  portfolioValue, // TODO: check whether it's better to include a usdValue on each asset
  currentAllocation, // TODO: check whether it makes more sense to use AbsoluteAllocation instead
}: {
  diff: AssetLayers;
  assetStore: AssetStore;
  portfolioValue: number;
  currentAllocation: FractionAllocation;
}): Promise<DetailedSteps> {
  let output: DetailedSteps = { steps: [], stores: [] };

  for (let i = diff.length - 1; i > 0; i -= 1) {
    output = await processBridges({
      assetStore,
      portfolioValue,
      currentLayer: diff[i],
      currentAllocation,
      isPositive: false,
      output,
    });
  }

  console.log("Post negative processBridges", {
    output,
  });

  const { swaps, updatedSwapLayer } = calculateSwaps({ swapLayer: diff[0] });

  console.log("Swaps", { swaps });

  output = await swapsToSDetailedSteps({
    portfolioValue,
    assetStore,
    swaps,
    currentLayer: diff[0],
    currentAllocation,
    output,
  });

  console.log("Post swaps output", { output });

  for (let i = diff.length - 1; i > 0; i -= 1) {
    output = await processBridges({
      assetStore,
      portfolioValue,
      currentLayer: diff[i],
      currentAllocation,
      isPositive: true,
      output,
    });
  }

  console.log("Post positive processBridges", { output });

  return output;
}
