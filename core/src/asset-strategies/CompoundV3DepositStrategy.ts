import { RequestTree } from "../transaction/get-prices-and-linked-assets";
import { StoreOpType } from "../transaction/types";
import {
  fetchPriceData,
  getPrice,
} from "../transaction/asset-type-strategies-helpers";
import { IERC20, CompoundComet, CompoundCometRewards } from "core/src/abis";
import {
  FRACTION_MULTIPLIER,
  MAGIC_REPLACERS,
} from "core/src/utils/get-magic-offset";
import {
  FetchPriceDataParams,
  GetPriceParams,
  GenerateStepParams,
} from "./InterfaceStrategy";
import { InterfaceStrategy } from "./InterfaceStrategy";

export class CompoundDepositStrategy extends InterfaceStrategy {
  fetchPriceData({ provider, assetStore, asset }: FetchPriceDataParams) {
    const linkedAsset = assetStore.getAssetById(asset.linkedAssets[0].assetId);

    const requestTree: RequestTree = fetchPriceData({
      provider,
      assetStore,
      asset: linkedAsset,
    });
    return requestTree;
  }

  getPrice({ assetStore, asset, requestTree }: GetPriceParams) {
    const linkedAsset = assetStore.getAssetById(asset.linkedAssets[0].assetId);

    return getPrice({ assetStore, asset: linkedAsset, requestTree });
  }

  async generateStep({
    assetAllocation,
    assetStore,
    walletAddress,
    value,
    chainId,
    currentAllocation,
    routerOperation,
  }: GenerateStepParams) {
    const asset = assetStore.getAssetById(assetAllocation.assetId);
    if (asset.linkedAssets.length != 1) {
      throw new Error(
        `CompoundDepositStrategy: asset ${asset.id} should have exactly one linked asset`
      );
    }
    const linkedAsset = assetStore.getAssetById(asset.linkedAssets[0].assetId);

    let cometRewardsAddress;
    if (chainId === 137) {
      cometRewardsAddress = "0x45939657d1CA34A8FA39A924B71D28Fe8431e581";
    } else {
      throw new Error("Unsupported chainId");
    }

    if (assetAllocation.fraction > 0) {
      const storeNumberFrom = routerOperation.stores.findOrInitializeStoreIdx({
        assetId: linkedAsset.id,
      });
      const storeNumberTo = routerOperation.stores.findOrInitializeStoreIdx({
        assetId: asset.id,
      });
      const storeNumberTmp = routerOperation.stores.findOrInitializeStoreIdx({
        tmpStoreName: `${asset.id} tmp store 0`,
      });

      const currentFraction = currentAllocation.getAssetById({
        assetId: linkedAsset.id,
      }).fraction;
      const newFraction = asset.linkedAssets[0].fraction / currentFraction;
      const variation = currentFraction * newFraction;

      currentAllocation.updateFraction({
        assetId: linkedAsset.id,
        delta: -variation,
      });
      currentAllocation.updateFraction({
        assetId: asset.id,
        delta: variation,
      });

      routerOperation.addStep({
        stepAddress: linkedAsset.address,
        encodedFunctionData: IERC20.encodeFunctionData("approve", [
          asset.address,
          MAGIC_REPLACERS[0],
        ]),
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveStoreAssignCall,
            storeNumber: storeNumberFrom,
            offsetReplacer: { replacer: MAGIC_REPLACERS[0], occurrence: 0 },
            fraction: Math.round(FRACTION_MULTIPLIER * newFraction),
          },
        ],
      });

      routerOperation.addStep({
        stepAddress: asset.address,
        encodedFunctionData: IERC20.encodeFunctionData("balanceOf", [
          walletAddress,
        ]),
        encodedFunctionResult: IERC20.encodeFunctionResult("balanceOf", [
          MAGIC_REPLACERS[0],
        ]),
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveResultAddStore,
            storeNumber: storeNumberTmp,
            offsetReplacer: { replacer: MAGIC_REPLACERS[0], occurrence: 0 },
            fraction: FRACTION_MULTIPLIER,
          },
        ],
      });

      routerOperation.addStep({
        stepAddress: asset.address,
        encodedFunctionData: CompoundComet.encodeFunctionData("supply", [
          linkedAsset.address, // asset
          MAGIC_REPLACERS[0], // amount
        ]),
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveStoreAssignCallSubtract,
            storeNumber: storeNumberFrom,
            offsetReplacer: { replacer: MAGIC_REPLACERS[0], occurrence: 0 },
            fraction: Math.round(newFraction * FRACTION_MULTIPLIER),
          },
        ],
      });

      routerOperation.addStep({
        stepAddress: asset.address,
        encodedFunctionData: IERC20.encodeFunctionData("balanceOf", [
          walletAddress,
        ]),
        encodedFunctionResult: IERC20.encodeFunctionResult("balanceOf", [
          MAGIC_REPLACERS[0],
        ]),
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveResultAddStore,
            storeNumber: storeNumberTo,
            offsetReplacer: { replacer: MAGIC_REPLACERS[0], occurrence: 0 },
            fraction: FRACTION_MULTIPLIER,
          },
          {
            storeOpType: StoreOpType.SubtractStoreFromStore,
            storeNumber: storeNumberTo,
            secondaryStoreNumber: storeNumberTmp,
            fraction: FRACTION_MULTIPLIER,
          },
        ],
      });
    } else if (assetAllocation.fraction < 0) {
      const storeNumberFrom = routerOperation.stores.findOrInitializeStoreIdx({
        assetId: asset.id,
      });
      const storeNumberTo = routerOperation.stores.findOrInitializeStoreIdx({
        assetId: linkedAsset.id,
      });
      const storeNumberTmp = routerOperation.stores.findOrInitializeStoreIdx({
        tmpStoreName: `${asset.id} tmp store 0`,
      });

      const currentFraction = currentAllocation.getAssetById({
        assetId: asset.id,
      }).fraction;
      const newFraction = -assetAllocation.fraction / currentFraction;
      const variation = newFraction * currentFraction;

      asset.linkedAssets.map((la, i) => {
        currentAllocation.updateFraction({
          assetId: la.assetId,
          delta: variation * la.fraction,
        });
        currentAllocation.updateFraction({
          assetId: asset.id,
          delta: -variation * la.fraction,
        });
      });

      routerOperation.addStep({
        stepAddress: linkedAsset.address,
        encodedFunctionData: IERC20.encodeFunctionData("balanceOf", [
          walletAddress,
        ]),
        encodedFunctionResult: IERC20.encodeFunctionResult("balanceOf", [
          MAGIC_REPLACERS[0],
        ]),
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveResultAddStore,
            storeNumber: storeNumberTmp,
            offsetReplacer: {
              replacer: MAGIC_REPLACERS[0],
              occurrence: 0,
            },
            fraction: FRACTION_MULTIPLIER,
          },
        ],
      });

      routerOperation.addStep({
        stepAddress: asset.address,
        encodedFunctionData: CompoundComet.encodeFunctionData("withdraw", [
          linkedAsset.address, // asset
          MAGIC_REPLACERS[0], // amount
        ]),
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveStoreAssignCallSubtract,
            storeNumber: storeNumberFrom,

            offsetReplacer: { replacer: MAGIC_REPLACERS[0], occurrence: 0 },
            fraction: Math.round(newFraction * FRACTION_MULTIPLIER),
          },
        ],
      });

      routerOperation.addStep({
        stepAddress: cometRewardsAddress,
        encodedFunctionData: CompoundCometRewards.encodeFunctionData("claim", [
          linkedAsset.address, // asset
          walletAddress, // src
          true, // shouldAccrue
        ]),
        storeOperations: [],
      });

      routerOperation.addStep({
        stepAddress: linkedAsset.address,
        encodedFunctionData: IERC20.encodeFunctionData("balanceOf", [
          walletAddress,
        ]),
        encodedFunctionResult: IERC20.encodeFunctionResult("balanceOf", [
          MAGIC_REPLACERS[0],
        ]),
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveResultAddStore,
            storeNumber: storeNumberTo,

            offsetReplacer: {
              replacer: MAGIC_REPLACERS[0],
              occurrence: 0,
            },
            fraction: FRACTION_MULTIPLIER,
          },
          {
            storeOpType: StoreOpType.SubtractStoreFromStore,
            storeNumber: storeNumberTo,
            secondaryStoreNumber: storeNumberTmp,
            fraction: FRACTION_MULTIPLIER,
          },
        ],
      });
    }

    return routerOperation;
  }
}
