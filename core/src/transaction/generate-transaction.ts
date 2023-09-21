import {
  AbsoluteAllocation,
  AssetStore,
  CurrentAllocation,
  FractionAllocation,
} from "./types";
import { constructAssetLayers } from "./construct-asset-layers";
import { calculateFractionAllocation } from "./calculate-fraction-allocation";
import { computeAssetLayersDelta } from "./compute-asset-layers-delta";
import { getProvider } from "../utils/get-provider";
import { generateSteps } from "./generate-steps";

export async function generateTransaction({
  chainId,
  inputAllocation,
  outputAllocation,
  assetStore,
}: {
  chainId: number;
  assetStore: AssetStore;
  inputAllocation: AbsoluteAllocation;
  outputAllocation: FractionAllocation;
}) {
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

  await assetStore.cachePrices({
    allocation: [...inputAllocation, ...outputAllocation],
    provider,
    assetStore,
  });

  console.log("after cachePrices");

  const { totalValue, fractionAllocation: inputFractionAllocation } =
    calculateFractionAllocation({
      absoluteAllocation: inputAllocation,
      assetStore,
    });

  const currentAssetLayers = constructAssetLayers({
    assetStore,
    allocation: inputFractionAllocation,
  });
  console.log("currentAssetLayers", { currentAssetLayers });

  const futureAssetLayers = constructAssetLayers({
    assetStore,
    allocation: outputAllocation,
  });
  console.log("futureAssetLayers", { futureAssetLayers });

  const diff = computeAssetLayersDelta({
    currentAssetLayers,
    futureAssetLayers,
  });
  console.log("diff", { diff });

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

  // return output;
}
