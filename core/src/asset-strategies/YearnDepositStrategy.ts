import { RequestTree } from "../transaction/get-prices-and-linked-assets";
import { StoreOpType } from "../transaction/types";
import {
  fetchPriceData,
  getPrice,
} from "../transaction/asset-type-strategies-helpers";
import { IERC20, YearnVault } from "core/src/abis";
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

export class YearnDepositStrategy extends InterfaceStrategy {
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
    chainId,
    value,
    currentAllocation,
    routerOperation,
  }: GenerateStepParams) {
    const asset = assetStore.getAssetById(assetAllocation.assetId);
    if (asset.linkedAssets.length != 1) {
      throw new Error(
        `YearnDepositStrategy: asset ${asset.id} should have exactly one linked asset`
      );
    }
    const linkedAsset = assetStore.getAssetById(asset.linkedAssets[0].assetId);

    const storeNumberToken = routerOperation.stores.findOrInitializeStoreIdx({
      assetId: linkedAsset.id,
    });
    const storeNumberYVault = routerOperation.stores.findOrInitializeStoreIdx({
      assetId: asset.id,
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
            storeNumber: storeNumberToken,
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
        encodedFunctionData: YearnVault.encodeFunctionData(
          "deposit(uint256,address)",
          [
            MAGIC_REPLACERS[0], // assets
            walletAddress, // receiver
          ]
        ),
        encodedFunctionResult: YearnVault.encodeFunctionResult(
          "deposit(uint256,address)",
          [
            MAGIC_REPLACERS[0], // shares
          ]
        ),
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveStoreAssignCallSubtract,
            storeNumber: storeNumberToken,
            offsetReplacer: { replacer: MAGIC_REPLACERS[0], occurrence: 0 },
            fraction: Math.round(newFraction * FRACTION_MULTIPLIER),
          },
          {
            storeOpType: StoreOpType.RetrieveResultAddStore,
            storeNumber: storeNumberYVault,
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
        encodedFunctionData: YearnVault.encodeFunctionData(
          "withdraw(uint256,address)",
          [
            MAGIC_REPLACERS[0], // maxShares
            walletAddress, // recipient
          ]
        ),
        encodedFunctionResult: YearnVault.encodeFunctionResult(
          "withdraw(uint256,address)",
          [MAGIC_REPLACERS[0]]
        ),
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveStoreAssignCallSubtract,
            storeNumber: storeNumberYVault,
            offsetReplacer: {
              replacer: MAGIC_REPLACERS[0],
              occurrence: 0,
            },
            fraction: Math.round(newFraction * FRACTION_MULTIPLIER),
          },
          {
            storeOpType: StoreOpType.RetrieveResultAddStore,
            storeNumber: storeNumberToken,
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
