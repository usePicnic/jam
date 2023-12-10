import { RequestTree } from "../transaction/get-prices-and-linked-assets";
import { StoreOpType } from "../transaction/types";
import {
  fetchPriceData,
  getAmount,
  getPrice,
} from "../transaction/asset-type-strategies-helpers";
import { IERC20, StargateRouter } from "core/src/abis";
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
import { Contract, parseUnits } from "ethers";
import router from "api/src/router";

export class StargateDepositStrategy extends InterfaceStrategy {
  fetchPriceData({ provider, assetStore, asset }: FetchPriceDataParams) {
    const linkedAsset = assetStore.getAssetById(asset.linkedAssets[0].assetId);

    const stargateToken = new Contract(
      asset.address,
      ["function amountLPtoLD(uint256) view returns (uint256)"],
      provider
    );

    let requestTree: RequestTree = {};

    requestTree[asset.address] = {};

    requestTree[asset.address].ratio = () =>
      stargateToken.amountLPtoLD(parseUnits("1", asset.decimals));

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

    const ratio = getAmount({
      amount: requestTree[asset.address].ratio,
      decimals: asset.decimals,
    });
    return getPrice({ assetStore, asset: linkedAsset, requestTree }) * ratio;
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
    let routerAddress;
    if (chainId === 137) {
      routerAddress = "0x45A01E4e04F14f7A4a6702c74187c5F6222033cd";
    } else {
      throw new Error(
        `StargateDepositStrategy: chainId ${chainId} not supported`
      );
    }

    const asset = assetStore.getAssetById(assetAllocation.assetId);
    if (asset.linkedAssets.length != 1) {
      throw new Error(
        `StargateDepositStrategy: asset ${asset.id} should have exactly one linked asset`
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

      routerOperation.addStep({
        stepAddress: linkedAsset.address,
        encodedFunctionData: IERC20.encodeFunctionData("approve", [
          routerAddress,
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
        stepAddress: routerAddress,
        encodedFunctionData: StargateRouter.encodeFunctionData("addLiquidity", [
          asset.callParams.poolId, // _poolId
          MAGIC_REPLACERS[0], // _amountLD
          walletAddress, // _to
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
        stepAddress: routerAddress,
        encodedFunctionData: StargateRouter.encodeFunctionData(
          "instantRedeemLocal",
          [
            asset.callParams.poolId, // _srcPoolId
            MAGIC_REPLACERS[0], // _amountLP
            walletAddress, // to
          ]
        ),
        encodedFunctionResult: StargateRouter.encodeFunctionResult(
          "instantRedeemLocal",
          [MAGIC_REPLACERS[0]]
        ),
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveStoreAssignCallSubtract,
            storeNumber: storeNumberFrom,

            offsetReplacer: { replacer: MAGIC_REPLACERS[0], occurrence: 0 },
            fraction: Math.round(newFraction * FRACTION_MULTIPLIER),
          },
          {
            storeOpType: StoreOpType.RetrieveResultAddStore,
            storeNumber: storeNumberTo,

            offsetReplacer: { replacer: MAGIC_REPLACERS[0], occurrence: 0 },
            fraction: FRACTION_MULTIPLIER,
          },
        ],
      });
    }

    return routerOperation;
  }
}
