import { RequestTree } from "../transaction/get-prices-and-linked-assets";
import { StoreOpType } from "../transaction/types";
import {
  fetchPriceData,
  getPrice,
} from "../transaction/asset-type-strategies-helpers";
import { getMagicOffsets } from "core/src/utils/get-magic-offset";
import { AaveIncentivesController, IERC20, LendingPool } from "core/src/abis";
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

export class AaveV2DepositStrategy extends InterfaceStrategy {
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
        `AaveV2DepositStrategy: asset ${asset.id} should have exactly one linked asset`
      );
    }
    const linkedAsset = assetStore.getAssetById(asset.linkedAssets[0].assetId);

    let lendingPoolAddress;
    let incentivesControllerAddress;
    if (chainId === 137) {
      lendingPoolAddress = "0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf";
      incentivesControllerAddress =
        "0x357D51124f59836DeD84c8a1730D72B749d8BC23";
    } else {
      throw new Error(
        `AaveV2DepositStrategy: not implemented for chain ${chainId}`
      );
    }

    const storeNumberAToken = routerOperation.stores.findOrInitializeStoreIdx({
      assetId: asset.id,
    });
    const storeNumberToken = routerOperation.stores.findOrInitializeStoreIdx({
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

      const { data: approveEncodedCall, offsets: approveFromOffsets } =
        getMagicOffsets({
          data: IERC20.encodeFunctionData("approve", [
            lendingPoolAddress,
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
            storeNumber: storeNumberToken,
            secondaryStoreNumber: 0,
            offset: approveFromOffsets[0],
            fraction: Math.round(FRACTION_MULTIPLIER * newFraction),
          },
        ],
      });

      const { data: depositEncodedCall, offsets: depositFromOffsets } =
        getMagicOffsets({
          data: LendingPool.encodeFunctionData("deposit", [
            linkedAsset.address, // assetIn
            MAGIC_REPLACERS[0], // amount
            walletAddress, // onBehalfOf
            0, // referralCode
          ]),
          magicReplacers: [MAGIC_REPLACERS[0]],
        });

      routerOperation.steps.push({
        stepAddress: lendingPoolAddress,
        stepEncodedCall: depositEncodedCall,
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveStoreAssignCallSubtract,
            storeNumber: storeNumberToken,
            secondaryStoreNumber: 0,
            offset: depositFromOffsets[0],
            fraction: Math.round(newFraction * FRACTION_MULTIPLIER),
          },
          {
            storeOpType: StoreOpType.AddStoreToStore,
            storeNumber: storeNumberAToken,
            secondaryStoreNumber: storeNumberToken,
            offset: 0,
            fraction: Math.round(newFraction * FRACTION_MULTIPLIER),
          },
        ],
      });
    } else if (assetAllocation.fraction < 0) {
      const storeNumberReward = routerOperation.stores.findOrInitializeStoreIdx(
        {
          tmpStoreName: `${asset.id} reward store`,
        }
      );

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
          data: LendingPool.encodeFunctionData("withdraw", [
            linkedAsset.address, // asset
            MAGIC_REPLACERS[0], // amount
            walletAddress, // to
          ]),
          magicReplacers: [MAGIC_REPLACERS[0]],
        });

      const { offsets: withdrawToOffsets } = getMagicOffsets({
        data: LendingPool.encodeFunctionResult("withdraw", [
          MAGIC_REPLACERS[0],
        ]),
        magicReplacers: [MAGIC_REPLACERS[0]],
      });

      routerOperation.steps.push({
        stepAddress: lendingPoolAddress,
        stepEncodedCall: withdrawEncodedCall,
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveStoreAssignCallSubtract,
            storeNumber: storeNumberAToken,
            secondaryStoreNumber: 0,
            offset: withdrawFromOffsets[0],
            fraction: Math.round(newFraction * FRACTION_MULTIPLIER),
          },
          {
            storeOpType: StoreOpType.RetrieveResultAddStore,
            storeNumber: storeNumberToken,
            secondaryStoreNumber: 0,
            offset: withdrawToOffsets[0],
            fraction: FRACTION_MULTIPLIER,
          },
        ],
      });

      // uint256 amountToClaim = distributor.getRewardsBalance(assets, address(this));
      // uint256 claimedReward = distributor.claimRewards(assets, amountToClaim, address(this));

      const {
        data: getRewardBalanceEncodedCall,
        offsets: _getRewardBalanceFromOffsets,
      } = getMagicOffsets({
        data: AaveIncentivesController.encodeFunctionData("getRewardsBalance", [
          [asset.address], // assets
          walletAddress, // to
        ]),
        magicReplacers: [],
      });

      const { offsets: getRewardBalanceToOffsets } = getMagicOffsets({
        data: AaveIncentivesController.encodeFunctionResult(
          "getRewardsBalance",
          [MAGIC_REPLACERS[0]]
        ),
        magicReplacers: [MAGIC_REPLACERS[0]],
      });

      routerOperation.steps.push({
        stepAddress: incentivesControllerAddress,
        stepEncodedCall: getRewardBalanceEncodedCall,
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveResultAddStore,
            storeNumber: storeNumberReward,
            secondaryStoreNumber: 0,
            offset: withdrawToOffsets[0],
            fraction: FRACTION_MULTIPLIER,
          },
        ],
      });

      const {
        data: claimRewardsEncodedCall,
        offsets: claimRewardsFromOffsets,
      } = getMagicOffsets({
        data: AaveIncentivesController.encodeFunctionData("claimRewards", [
          [asset.address], // assets
          MAGIC_REPLACERS[0], // amount
          walletAddress, // to
        ]),
        magicReplacers: [MAGIC_REPLACERS[0]],
      });

      const { offsets: claimRewardsToOffsets } = getMagicOffsets({
        data: AaveIncentivesController.encodeFunctionResult("claimRewards", [
          MAGIC_REPLACERS[0],
        ]),
        magicReplacers: [MAGIC_REPLACERS[0]],
      });

      routerOperation.steps.push({
        stepAddress: incentivesControllerAddress,
        stepEncodedCall: claimRewardsEncodedCall,
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveStoreAssignCall,
            storeNumber: storeNumberReward,
            secondaryStoreNumber: 0,
            offset: withdrawFromOffsets[0],
            fraction: FRACTION_MULTIPLIER,
          },
        ],
      });
    }

    return routerOperation;
  }
}
