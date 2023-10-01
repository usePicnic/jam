import {
  AbsoluteAllocation,
  AssetStore,
  CurrentAllocation,
  FractionAllocation,
  RouterOperation,
} from "./types";
import { generateAssetLayers } from "./generate-asset-layers";
import { calculateFractionAllocation } from "./calculate-fraction-allocation";
import { calculateAssetLayersDelta } from "./calculate-asset-layers-delta";
import { getProvider } from "../utils/get-provider";
import { generateSteps } from "./generate-steps";

export async function generateTransaction({
  chainId,
  walletAddress,
  inputAllocation,
  outputAllocation,
  assetStore,
}: {
  chainId: number;
  walletAddress: string;
  assetStore: AssetStore;
  inputAllocation: AbsoluteAllocation;
  outputAllocation: FractionAllocation;
}): Promise<RouterOperation> {
  if (inputAllocation.length === 0 || outputAllocation.length === 0) {
    throw new Error("Input or output allocation is empty");
  }

  const provider = await getProvider({ chainId });
  console.log("inputAllocation", { inputAllocation });
  console.log("outputAllocation", { outputAllocation });

  // if (!checkAllocations(inputAllocation, desiredAllocation)) {
  //   throw new Error(
  //     "generateTransaction: Input or Desired allocations are not close to 100%"
  //   );
  // }

  await assetStore.cachePricesAndLinkedAssets({
    allocation: [...inputAllocation, ...outputAllocation],
    provider,
    assetStore,
  });

  const { totalValue, fractionAllocation: inputFractionAllocation } =
    calculateFractionAllocation({
      absoluteAllocation: inputAllocation,
      assetStore,
    });

  const currentAssetLayers = generateAssetLayers({
    assetStore,
    allocation: inputFractionAllocation,
  });
  console.dir({ currentAssetLayers }, { depth: null });

  const futureAssetLayers = generateAssetLayers({
    assetStore,
    allocation: outputAllocation,
  });
  console.dir({ futureAssetLayers }, { depth: null });

  const diff = calculateAssetLayersDelta({
    currentAssetLayers,
    futureAssetLayers,
  });
  console.dir({ diff }, { depth: null });

  const currentAllocation = new CurrentAllocation({
    fractionAllocation: inputFractionAllocation,
    assetStore,
  });

  const received = await generateSteps({
    chainId,
    walletAddress,
    provider,
    diff,
    assetStore,
    totalValue,
    inputAllocation,
    currentAllocation,
  });

  return received;
}
