import { Route } from "../path/apis/api";
import { calculatePath } from "../path/calculate-path";
import { assetTypeStrategies } from "./asset-type-strategies";
import {
  AbsoluteAllocation,
  AssetLayer,
  AssetLayers,
  AssetStore,
  RouterOperation,
  DetailedStores,
} from "./types";
import _ from "lodash";

async function processBridges({
  assetStore,
  portfolioValue,
  currentLayer,
  // currentAllocation,
  isPositive,
  output,
}: {
  assetStore: AssetStore;
  portfolioValue: number;
  currentLayer: AssetLayer;
  // currentAllocation: FractionAllocation;
  isPositive: boolean;
  output: RouterOperation;
}): Promise<RouterOperation> {
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
        // currentAllocation,
        currentSteps: output,
      });

      // console.log("currentAllocation", { currentAllocation });
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
  fraction: number; // TODO: should be called percentage?
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
          const fraction = updatedSwapLayer[to].fraction;

          updatedSwapLayer[from].fraction += updatedSwapLayer[to].fraction;

          updatedSwapLayer[to].fraction = 0;
          if (fraction > 0.0001) {
            const swap = { from, to, fraction };
            swaps.push(swap);
          }
        } else {
          const fraction = -updatedSwapLayer[from].fraction;

          updatedSwapLayer[to].fraction += updatedSwapLayer[from].fraction;

          updatedSwapLayer[from].fraction = 0;
          const swap: Swap = { from, to, fraction };
          swaps.push(swap);
        }
      }
    }
  }

  return { swaps, updatedSwapLayer };
}

async function swapsToSRouterOperation({
  chainId,
  portfolioValue,
  assetStore,
  swaps,
  currentLayer,
  // currentAllocation,
  output,
}: {
  chainId: number;
  portfolioValue: number;
  assetStore: AssetStore;
  swaps: Swap[];
  currentLayer: AssetLayer;
  // currentAllocation: FractionAllocation;
  output: RouterOperation;
}): Promise<RouterOperation> {
  console.log("Running swapsToSRouterOperation");

  const promises: Promise<Route[]>[] = [];
  // const swapBridgeContracts = getSwapBridgeContracts(network);

  for (let i = 0; i < swaps.length; i += 1) {
    console.log("swap %d", i);

    const fromAsset = assetStore.byId[swaps[i].from];
    const toAsset = assetStore.byId[swaps[i].to];

    console.log(`fromAsset name: ${fromAsset.name}, type: ${fromAsset.type}`, {
      fromAsset,
    });
    console.log(`toAsset name: ${toAsset.name} type: ${toAsset.type}`, {
      toAsset,
    });

    console.log(
      `swaps[${i}].fraction: ${
        swaps[i].fraction
      } of store idx ${output.stores.findOrInitializeStoreIdx({
        assetId: swaps[i].from,
      })}`
    );
    // console.log(`diffLayer[swaps[${i}].from]: ${diffLayer[swaps[i].from]}`);
    // console.log(`realAssets[swaps[${i}].from]: ${realAssets[swaps[i].from]}`);

    const fraction = swaps[i].fraction;
    const swapValue = portfolioValue * fraction; // TODO: This value is incorrect
    promises.push(
      calculatePath({
        chainId,
        sellToken: fromAsset,
        buyToken: toAsset,
        swapValue,
      })
    );
  }

  const paths = await Promise.all(promises);

  console.log({ paths });

  // const assetByAddressMap = getAssetByAddressMap(assetMap);

  const fractions = swaps.map((swap) => swap.fraction);

  // const output = await buildSwapOutput(
  //   paths,
  //   amounts,
  //   assetByAddressMap,
  //   swapBridgeContracts,
  //   realAssets
  // );

  return output;
}

export async function generateSteps({
  chainId,
  diff,
  assetStore,
  portfolioValue, // TODO: check whether it's better to include a usdValue on each asset
  currentAllocation,
}: {
  chainId: number;
  diff: AssetLayers;
  assetStore: AssetStore;
  portfolioValue: number;
  currentAllocation: AbsoluteAllocation;
}): Promise<RouterOperation> {
  let output: RouterOperation = { steps: [], stores: new DetailedStores() };
  for (const allocation of currentAllocation) {
    output.stores.findOrInitializeStoreIdx({
      assetId: allocation.assetId,
      value: allocation.amountStr,
    });
  }

  for (let i = diff.length - 1; i > 0; i -= 1) {
    output = await processBridges({
      assetStore,
      portfolioValue,
      currentLayer: diff[i],
      // currentAllocation,
      isPositive: false,
      output,
    });
  }

  console.log("Post negative processBridges", {
    stores: output.stores.stores,
    steps: output.steps,
  });

  const { swaps, updatedSwapLayer } = calculateSwaps({ swapLayer: diff[0] });

  console.log("Swaps", { swaps });

  output = await swapsToSRouterOperation({
    chainId,
    portfolioValue,
    assetStore,
    swaps,
    currentLayer: diff[0],
    // currentAllocation,
    output,
  });

  console.log("Post swaps output", {
    stores: output.stores.stores,
    steps: output.steps,
  });

  for (let i = diff.length - 1; i > 0; i -= 1) {
    output = await processBridges({
      assetStore,
      portfolioValue,
      currentLayer: diff[i],
      // currentAllocation,
      isPositive: true,
      output,
    });
  }

  console.log("Post positive processBridges", { output });

  return output;
}
