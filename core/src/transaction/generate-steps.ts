import { Provider } from "ethers";
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
  CurrentAllocation,
} from "./types";
import _ from "lodash";

async function processBridges({
  chainId,
  walletAddress,
  provider,
  assetStore,
  totalValue,
  currentLayer,
  currentAllocation,
  isPositive,
  routerOperation,
}: {
  chainId: number;
  walletAddress: string;
  provider: Provider;
  assetStore: AssetStore;
  totalValue: number;
  currentLayer: AssetLayer;
  currentAllocation: CurrentAllocation;
  isPositive: boolean;
  routerOperation: RouterOperation;
}): Promise<RouterOperation> {
  let output = routerOperation;

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
      const asset = assetStore.getAssetById(assetId);
      const value = totalValue * fraction;
      console.log("step", { asset, fraction, rewards });

      const assetAllocation = currentLayer[assetId];

      output = await assetTypeStrategies[chainId][asset.type].generateStep({
        chainId,
        provider,
        walletAddress,
        assetAllocation,
        assetStore,
        value,
        currentAllocation,
        routerOperation: output,
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
  fraction: number;
};

type SwapWithRoute = {
  from: string;
  to: string;
  fraction: number;
  routes: Route[];
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
        updatedSwapLayer[to].fraction > 0.0001 &&
        updatedSwapLayer[from].fraction < -0.0001
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

export async function buildSwapOutput({
  chainId,
  walletAddress,
  provider,
  swaps,
  assetStore,
  routerOperation,
  currentLayer,
  currentAllocation,
}: {
  chainId: number;
  walletAddress: string;
  provider: Provider;
  swaps: SwapWithRoute[];
  // amounts: number[];
  assetStore: AssetStore;
  routerOperation: RouterOperation;
  currentLayer: AssetLayer;
  currentAllocation: CurrentAllocation;
  // swapBridgeContracts: { [key: string]: Contract };
  // realAssets;
}): Promise<RouterOperation> {
  console.log("buildSwapOutput", { swaps: JSON.stringify(swaps) });

  let output = routerOperation;

  for (let i = 0; i < swaps.length; i += 1) {
    for (let j = 0; j < swaps[i].routes.length; j += 1) {
      // const fromAsset = assetStore.getAssetByAddress(
      //   swaps[i].routes[j].fromToken
      // );

      // const toAsset = assetStore.getAssetByAddress(swaps[i].routes[j].toToken);

      const amount = swaps[i].fraction * swaps[i].routes[j].fraction;
      // console.log(
      //   `builtSwapOutput i=${i} j=${j} swaps[i].fraction: ${swaps[i].fraction} swaps[i].routes[j].fraction: ${swaps[i].routes[j].fraction} amount: ${amount}`
      // );

      swaps[i].routes[j].fraction =
        amount /
        currentAllocation.getAssetByAddress({
          address: swaps[i].routes[j].fromToken,
        }).fraction;

      console.log(`buildSwapOutput: fraction: %d`, swaps[i].routes[j].fraction);

      currentAllocation.updateFraction({
        address: swaps[i].routes[j].fromToken,
        delta: -amount,
      });
      currentAllocation.updateFraction({
        address: swaps[i].routes[j].toToken,
        delta: amount,
      });

      // const bridgeName = swaps[i].routes[j].exchange.contractName;
      // console.log(`bridgeName: ${bridgeName}`);

      // const bridgeCall = await generateSwap(swapBridgeContracts, swaps[i].routes[j]);

      // output = output.concat(bridgeCall);
      output = await swaps[i].routes[j].exchange.buildSwapOutput({
        chainId,
        walletAddress,
        provider,
        path: swaps[i].routes[j],
        routerOperation: output,
      });
      // output = await generateSwapSteps({
      // });
    }
  }

  return output;
}

async function swapsToRouterOperation({
  chainId,
  walletAddress,
  provider,
  totalValue,
  assetStore,
  swaps,
  currentLayer,
  currentAllocation,
  routerOperation,
}: {
  chainId: number;
  walletAddress: string;
  provider: Provider;
  totalValue: number;
  assetStore: AssetStore;
  swaps: Swap[];
  currentLayer: AssetLayer;
  currentAllocation: CurrentAllocation;
  routerOperation: RouterOperation;
}): Promise<RouterOperation> {
  let output = routerOperation;
  console.log("Running swapsToRouterOperation");

  const promises: Promise<Route[]>[] = [];
  // const swapBridgeContracts = getSwapBridgeContracts(network);

  for (let i = 0; i < swaps.length; i += 1) {
    console.log("swap %d", i);

    const fromAsset = assetStore.getAssetById(swaps[i].from);
    const toAsset = assetStore.getAssetById(swaps[i].to);

    console.log(`fromAsset name: ${fromAsset.name}, type: ${fromAsset.type}`, {
      fromAsset,
    });
    console.log(`toAsset name: ${toAsset.name} type: ${toAsset.type}`, {
      toAsset,
    });

    console.log(`swap ${i}`, swaps[i]);
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
    const swapValue = totalValue * fraction;

    promises.push(
      calculatePath({
        chainId,
        provider,
        sellToken: fromAsset,
        buyToken: toAsset,
        swapValue,
      })
    );
  }

  const paths = await Promise.all(promises);

  const swapsWithRoutes = _.zipWith(
    swaps,
    paths,
    (swap, routes): SwapWithRoute => {
      return { ...swap, routes };
    }
  );

  console.log({ swapsWithRoutes: JSON.stringify(swapsWithRoutes) });

  console.log({ paths: JSON.stringify(paths) });

  // const assetByAddressMap = getAssetByAddressMap(assetMap);

  // const fractions = swaps.map((swap) => swap.fraction);

  output = await buildSwapOutput({
    chainId,
    walletAddress,
    provider,
    swaps: swapsWithRoutes,
    // amounts,
    assetStore,
    routerOperation,
    // swapBridgeContracts,
    // realAssets,
    currentAllocation,
    currentLayer,
  });

  return output;
}

export async function generateSteps({
  chainId,
  walletAddress,
  provider,
  diff,
  assetStore,
  totalValue, // TODO: check whether it's better to include a usdValue on each asset
  inputAllocation,
  currentAllocation,
}: {
  chainId: number;
  walletAddress: string;
  provider: Provider;
  diff: AssetLayers;
  assetStore: AssetStore;
  totalValue: number;
  inputAllocation: AbsoluteAllocation;
  currentAllocation: CurrentAllocation;
}): Promise<RouterOperation> {
  let output = new RouterOperation();

  for (const allocation of inputAllocation) {
    const asset = assetStore.getAssetById(allocation.assetId);

    output.stores.findOrInitializeStoreIdx({
      assetId: allocation.assetId,
      address: asset.address,
      value: allocation.amountStr,
    });
  }

  for (const assetLayer of diff) {
    for (const key in assetLayer) {
      const asset = assetStore.getAssetById(assetLayer[key].assetId);
      output.stores.findOrInitializeStoreIdx({
        assetId: assetLayer[key].assetId,
        address: asset.address,
      });
      currentAllocation.getAssetById({ assetId: asset.id });
    }
  }

  for (let i = diff.length - 1; i > 0; i -= 1) {
    output = await processBridges({
      chainId,
      walletAddress,
      provider,
      assetStore,
      totalValue,
      currentLayer: diff[i],
      currentAllocation,
      isPositive: false,
      routerOperation: output,
    });
  }

  console.log("Post negative processBridges", {
    stores: output.stores.stores,
    steps: output.steps,
  });

  const { swaps, updatedSwapLayer } = calculateSwaps({ swapLayer: diff[0] });

  console.dir({ swaps }, { depth: null });

  output = await swapsToRouterOperation({
    chainId,
    walletAddress,
    provider,
    totalValue,
    assetStore,
    swaps,
    currentLayer: diff[0],
    currentAllocation,
    routerOperation: output,
  });

  console.dir(
    {
      postSwapStores: output.stores.stores,
      postSwapSteps: output.steps,
    },
    { depth: null }
  );

  for (let i = diff.length - 1; i > 0; i -= 1) {
    output = await processBridges({
      chainId,
      walletAddress,
      provider,
      assetStore,
      totalValue,
      currentLayer: diff[i],
      currentAllocation,
      isPositive: true,
      routerOperation: output,
    });
  }

  console.dir(
    {
      postBridgesStores: output.stores.stores,
      postBridgesSteps: output.steps,
    },
    { depth: null }
  );

  return output;
}
