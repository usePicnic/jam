import { RequestTree } from "../transaction/get-prices-and-linked-assets";
import { StoreOpType } from "../transaction/types";
import {
  fetchPriceData,
  getPrice,
} from "../transaction/asset-type-strategies-helpers";
import { IERC20, SavingsDai } from "core/src/abis";
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

export class SavingsDaiDepositStrategy extends InterfaceStrategy {
  fetchPriceData({ provider, assetStore, asset }: FetchPriceDataParams) {
    const linkedAsset = assetStore.getAssetById(asset.linkedAssets[0].assetId);

    let requestTree: RequestTree = {};

    requestTree[asset.address] = {};

    const fetchedData = fetchPriceData({
      provider,
      assetStore,
      asset: linkedAsset,
    });
    requestTree = {
      ...requestTree,
      ...fetchedData,
    };
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
    chainId,
    value,
    currentAllocation,
    routerOperation,
  }: GenerateStepParams) {
    const asset = assetStore.getAssetById(assetAllocation.assetId);
    if (asset.linkedAssets.length != 1) {
      throw new Error(
        `SavingsDaiDepositStrategy: asset ${asset.id} should have exactly one linked asset`
      );
    }
    const linkedAsset = assetStore.getAssetById(asset.linkedAssets[0].assetId);

    const storeNumberSDai = routerOperation.stores.findOrInitializeStoreIdx({
      assetId: asset.id,
    });
    const storeNumberDai = routerOperation.stores.findOrInitializeStoreIdx({
      assetId: linkedAsset.id,
    });

    if (assetAllocation.fraction > 0) {
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
            storeNumber: storeNumberDai,
            offsetReplacer: {
              replacer: MAGIC_REPLACERS[0],
              occurrence: 0,
            },
            fraction: Math.round(FRACTION_MULTIPLIER * newFraction),
          },
        ],
      });

      routerOperation.addStep({
        stepAddress: asset.address,
        encodedFunctionData: SavingsDai.encodeFunctionData("deposit", [
          MAGIC_REPLACERS[0], // assets
          walletAddress, // receiver
        ]),
        encodedFunctionResult: SavingsDai.encodeFunctionResult("deposit", [
          MAGIC_REPLACERS[0], // shares
        ]),
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveStoreAssignCallSubtract,
            storeNumber: storeNumberDai,
            offsetReplacer: { replacer: MAGIC_REPLACERS[0], occurrence: 0 },
            fraction: Math.round(newFraction * FRACTION_MULTIPLIER),
          },
          {
            storeOpType: StoreOpType.RetrieveResultAddStore,
            storeNumber: storeNumberSDai,
            offsetReplacer: { replacer: MAGIC_REPLACERS[0], occurrence: 0 },
            fraction: FRACTION_MULTIPLIER,
          },
        ],
      });
    } else if (assetAllocation.fraction < 0) {
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
        stepAddress: asset.address,
        encodedFunctionData: SavingsDai.encodeFunctionData("redeem", [
          MAGIC_REPLACERS[0], // shares
          walletAddress, // receiver
          walletAddress, // owner
        ]),
        encodedFunctionResult: SavingsDai.encodeFunctionResult("redeem", [
          MAGIC_REPLACERS[0],
        ]),
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveStoreAssignCallSubtract,
            storeNumber: storeNumberSDai,
            offsetReplacer: {
              replacer: MAGIC_REPLACERS[0],
              occurrence: 0,
            },
            fraction: Math.round(newFraction * FRACTION_MULTIPLIER),
          },
          {
            storeOpType: StoreOpType.RetrieveResultAddStore,
            storeNumber: storeNumberDai,
            offsetReplacer: {
              replacer: MAGIC_REPLACERS[0],
              occurrence: 0,
            },
            fraction: FRACTION_MULTIPLIER,
          },
        ],
      });
    }

    return routerOperation;
  }
}
