import { RequestTree } from "../transaction/get-prices-and-linked-assets";
import { StoreOpType } from "../transaction/types";
import {
  fetchPriceData,
  getPrice,
} from "../transaction/asset-type-strategies-helpers";
import { getMagicOffsets } from "core/src/utils/get-magic-offset";
import { IERC20, IPool } from "core/src/abis";
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

const poolAddress = "0x794a61358D6845594F94dc1DB02A252b5b4814aD";

export class AaveV3DepositStrategy extends InterfaceStrategy {
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
    value,
    currentAllocation,
    routerOperation,
  }: GenerateStepParams) {
    const asset = assetStore.getAssetById(assetAllocation.assetId);
    if (asset.linkedAssets.length != 1) {
      throw new Error(
        `AaveV3DepositStrategy: asset ${asset.id} should have exactly one linked asset`
      );
    }
    const linkedAsset = assetStore.getAssetById(asset.linkedAssets[0].assetId);

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

      const { data: approveEncodedCall, offsets: approveFromOffsets } =
        getMagicOffsets({
          data: IERC20.encodeFunctionData("approve", [
            poolAddress,
            MAGIC_REPLACERS[0],
          ]),
          magicReplacers: [MAGIC_REPLACERS[0]],
        });

      routerOperation.steps.push({
        stepAddress: linkedAsset.address,
        stepEncodedCall: approveEncodedCall,
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveStoreAssignCall,
            storeNumber: storeNumberFrom,
            offset: approveFromOffsets[0],
            fraction: Math.round(FRACTION_MULTIPLIER * newFraction),
          },
        ],
      });

      const { offsets: balanceOfToOffsets } = getMagicOffsets({
        data: IERC20.encodeFunctionResult("balanceOf", [MAGIC_REPLACERS[0]]),
        magicReplacers: [MAGIC_REPLACERS[0]],
      });

      routerOperation.steps.push({
        stepAddress: asset.address,
        stepEncodedCall: IERC20.encodeFunctionData("balanceOf", [
          walletAddress,
        ]),
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveResultAddStore,
            storeNumber: storeNumberTmp,
            offset: balanceOfToOffsets[0],
            fraction: FRACTION_MULTIPLIER,
          },
        ],
      });

      const { data: supplyEncodedCall, offsets: supplyFromOffsets } =
        getMagicOffsets({
          data: IPool.encodeFunctionData("supply", [
            linkedAsset.address, // asset
            MAGIC_REPLACERS[0], // amount
            walletAddress, // onBehalfOf
            0, // referralCode
          ]),
          magicReplacers: [MAGIC_REPLACERS[0]],
        });

      routerOperation.steps.push({
        stepAddress: poolAddress,
        stepEncodedCall: supplyEncodedCall,
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveStoreAssignCallSubtract,
            storeNumber: storeNumberFrom,
            offset: supplyFromOffsets[0],
            fraction: newFraction * FRACTION_MULTIPLIER,
          },
        ],
      });

      routerOperation.steps.push({
        stepAddress: asset.address,
        stepEncodedCall: IERC20.encodeFunctionData("balanceOf", [
          walletAddress,
        ]),
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveResultAddStore,
            storeNumber: storeNumberTo,
            offset: balanceOfToOffsets[0],
            fraction: FRACTION_MULTIPLIER,
          },
          {
            storeOpType: StoreOpType.SubtractStoreFromStore,
            storeNumber: storeNumberTmp,
            offset: storeNumberTo,
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

      const { data: withdrawEncodedCall, offsets: withdrawFromOffsets } =
        getMagicOffsets({
          data: IPool.encodeFunctionData("withdraw", [
            linkedAsset.address, // asset
            MAGIC_REPLACERS[0], // _shares
            walletAddress, // to
          ]),
          magicReplacers: [MAGIC_REPLACERS[0]],
        });

      const { offsets: withdrawToOffsets } = getMagicOffsets({
        data: IPool.encodeFunctionResult("withdraw", [MAGIC_REPLACERS[0]]),
        magicReplacers: [MAGIC_REPLACERS[0]],
      });

      routerOperation.steps.push({
        stepAddress: poolAddress,
        stepEncodedCall: withdrawEncodedCall,
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveStoreAssignCallSubtract,
            storeNumber: storeNumberFrom,
            offset: withdrawFromOffsets[0],
            fraction: newFraction * FRACTION_MULTIPLIER,
          },
          {
            storeOpType: StoreOpType.RetrieveResultAddStore,
            storeNumber: storeNumberTo,
            offset: withdrawToOffsets[0],
            fraction: FRACTION_MULTIPLIER,
          },
        ],
      });
    }

    return routerOperation;
  }
}
