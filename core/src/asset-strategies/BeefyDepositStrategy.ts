import { RequestTree } from "../transaction/get-prices-and-linked-assets";
import { StoreOpType } from "../transaction/types";
import {
  getAmount,
  fetchPriceData,
  getPrice,
} from "../transaction/asset-type-strategies-helpers";
import { Contract } from "ethers";
import { getMagicOffsets } from "core/src/utils/get-magic-offset";
import { IBeefyVaultV6, IERC20 } from "core/src/abis";
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

export class BeefyDepositStrategy extends InterfaceStrategy {
  fetchPriceData({ provider, assetStore, asset }: FetchPriceDataParams) {
    const linkedAsset = assetStore.getAssetById(asset.linkedAssets[0].assetId);

    const pool = new Contract(asset.address, IBeefyVaultV6, provider);

    let requestTree: RequestTree = {};

    requestTree[asset.address] = {};
    requestTree[asset.address].underlyingAmount = () => pool.balance();

    requestTree[asset.address].supply = () => pool.totalSupply();

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

    const amount = getAmount({
      amount: requestTree[asset.address].underlyingAmount,
      decimals: linkedAsset.decimals,
    });
    const supply = getAmount({
      amount: requestTree[asset.address].supply,
      decimals: asset.decimals,
    });

    return (
      (amount * getPrice({ assetStore, asset: linkedAsset, requestTree })) /
      supply
    );
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
        `BeefyDepositStrategy: asset ${asset.id} should have exactly one linked asset`
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
            asset.address,
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
            secondaryStoreNumber: 0,
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
            secondaryStoreNumber: 0,
            offset: balanceOfToOffsets[0],
            fraction: FRACTION_MULTIPLIER,
          },
        ],
      });

      const { data: depositEncodedCall, offsets: depositFromOffsets } =
        getMagicOffsets({
          data: IBeefyVaultV6.encodeFunctionData("deposit", [
            MAGIC_REPLACERS[0], // _amount
          ]),
          magicReplacers: [MAGIC_REPLACERS[0]],
        });

      routerOperation.steps.push({
        stepAddress: asset.address,
        stepEncodedCall: depositEncodedCall,
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveStoreAssignCallSubtract,
            storeNumber: storeNumberFrom,
            secondaryStoreNumber: 0,
            offset: depositFromOffsets[0],
            fraction: FRACTION_MULTIPLIER,
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
            secondaryStoreNumber: 0,
            offset: balanceOfToOffsets[0],
            fraction: FRACTION_MULTIPLIER,
          },
          {
            storeOpType: StoreOpType.SubtractStoreFromStore,
            storeNumber: storeNumberTo,
            secondaryStoreNumber: storeNumberTmp,
            offset: 0,
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

      const { offsets: balanceOfToOffsets } = getMagicOffsets({
        data: IERC20.encodeFunctionResult("balanceOf", [MAGIC_REPLACERS[0]]),
        magicReplacers: [MAGIC_REPLACERS[0]],
      });

      routerOperation.steps.push({
        stepAddress: linkedAsset.address,
        stepEncodedCall: IERC20.encodeFunctionData("balanceOf", [
          walletAddress,
        ]),
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveResultAddStore,
            storeNumber: storeNumberTmp,
            secondaryStoreNumber: 0,
            offset: balanceOfToOffsets[0],
            fraction: FRACTION_MULTIPLIER,
          },
        ],
      });

      const { data: withdrawEncodedCall, offsets: withdrawFromOffsets } =
        getMagicOffsets({
          data: IBeefyVaultV6.encodeFunctionData("withdraw", [
            MAGIC_REPLACERS[0], // _shares
          ]),
          magicReplacers: [MAGIC_REPLACERS[0]],
        });

      routerOperation.steps.push({
        stepAddress: asset.address,
        stepEncodedCall: withdrawEncodedCall,
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveStoreAssignCallSubtract,
            storeNumber: storeNumberTo,
            secondaryStoreNumber: 0,
            offset: withdrawFromOffsets[0],
            fraction: Math.round(newFraction * FRACTION_MULTIPLIER),
          },
        ],
      });

      routerOperation.steps.push({
        stepAddress: linkedAsset.address,
        stepEncodedCall: IERC20.encodeFunctionData("balanceOf", [
          walletAddress,
        ]),
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveResultAddStore,
            storeNumber: storeNumberTo,
            secondaryStoreNumber: 0,
            offset: balanceOfToOffsets[0],
            fraction: FRACTION_MULTIPLIER,
          },
          {
            storeOpType: StoreOpType.SubtractStoreFromStore,
            storeNumber: storeNumberTo,
            secondaryStoreNumber: storeNumberTmp,
            offset: 0,
            fraction: FRACTION_MULTIPLIER,
          },
        ],
      });
    }

    return routerOperation;
  }
}
