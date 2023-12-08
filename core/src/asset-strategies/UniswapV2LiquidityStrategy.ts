import { RequestTree } from "../transaction/get-prices-and-linked-assets";
import { StoreOpType } from "../transaction/types";
import {
  getAmount,
  fetchPriceData,
  getPrice,
} from "../transaction/asset-type-strategies-helpers";
import { Contract } from "ethers";
import { IERC20, UniswapV2Pair, UniswapV2Router02 } from "core/src/abis";
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

export class UniswapV2LiquidityStrategy extends InterfaceStrategy {
  fetchPriceData({ provider, assetStore, asset }: FetchPriceDataParams) {
    const linkedAssets = asset.linkedAssets.map((linkedAsset) =>
      assetStore.getAssetById(linkedAsset.assetId)
    );

    const pair = new Contract(asset.address, UniswapV2Pair, provider);

    let requestTree: RequestTree = {};
    requestTree[asset.address] = {};

    requestTree[asset.address].reserves = () => pair.getReserves();
    requestTree[asset.address].supply = () => pair.totalSupply();

    // Underlying Prices
    linkedAssets.map((linkedAsset) => {
      const fetchedData = fetchPriceData({
        provider,
        assetStore,
        asset: linkedAsset,
      });
      requestTree = {
        ...requestTree,
        ...fetchedData,
      };
    });
    return requestTree;
  }

  getPrice({ assetStore, asset, requestTree }: GetPriceParams) {
    const linkedAssets = asset.linkedAssets.map((linkedAsset) =>
      assetStore.getAssetById(linkedAsset.assetId)
    );

    let tvl = 0;
    linkedAssets.map((linkedAsset, i) => {
      const amount = requestTree[asset.address].reserves[i];

      console.log({ amount, decimals: linkedAsset.decimals });
      tvl +=
        getPrice({ assetStore, asset: linkedAsset, requestTree }) *
        getAmount({ amount, decimals: linkedAsset.decimals });
    });

    const supply = getAmount({
      amount: requestTree[asset.address].supply,
      decimals: asset.decimals,
    });
    return tvl / supply;
  }

  async generateStep({
    assetAllocation,
    assetStore,
    walletAddress,
    provider,
    currentAllocation,
    routerOperation,
  }: GenerateStepParams) {
    const asset = assetStore.getAssetById(assetAllocation.assetId);

    if (asset.linkedAssets.length != 2) {
      throw new Error(
        `UniswapV2LiquidityStrategy: asset ${asset.id} should have exactly two linked assets`
      );
    }

    let routerAddress;
    if (asset.callParams.protocol === "sushiswap") {
      routerAddress = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506";
    } else if (asset.callParams.protocol === "quickswap") {
      routerAddress = "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff";
    } else {
      throw new Error(
        `UniswapV2LiquidityStrategy: not implemented for protocol ${asset.callParams.protocol}`
      );
    }

    const linkedAssets = asset.linkedAssets.map((la) =>
      assetStore.getAssetById(la.assetId)
    );

    const storeNumberPool = routerOperation.stores.findOrInitializeStoreIdx({
      assetId: asset.id,
    });
    const storeNumbersLinkedAssets = linkedAssets.map((linkedAsset) =>
      routerOperation.stores.findOrInitializeStoreIdx({
        assetId: linkedAsset.id,
      })
    );

    if (assetAllocation.fraction > 0) {
      const linkedAssetFractions = asset.linkedAssets.map((la, i) => {
        const currentFraction = currentAllocation.getAssetById({
          assetId: la.assetId,
        }).fraction;
        const newFraction =
          la.fraction !== 0 ? la.fraction / currentFraction : 0;
        const variation = currentFraction * newFraction;

        console.log({
          currentFraction,
          laFraction: la.fraction,
          newFraction,
          variation,
        });

        currentAllocation.updateFraction({
          assetId: la.assetId,
          delta: -variation,
        });
        currentAllocation.updateFraction({
          assetId: asset.id,
          delta: variation,
        });

        return newFraction;
      });

      for (const [i, linkedAsset] of linkedAssets.entries()) {
        if (linkedAssetFractions[i] === 0) {
          continue;
        }

        routerOperation.addStep({
          stepAddress: linkedAsset.address,
          encodedFunctionData: IERC20.encodeFunctionData("approve", [
            routerAddress,
            MAGIC_REPLACERS[0],
          ]),
          storeOperations: [
            {
              storeOpType: StoreOpType.RetrieveStoreAssignCall,
              storeNumber: storeNumbersLinkedAssets[i],
              offsetReplacer: {
                replacer: MAGIC_REPLACERS[0],
                occurrence: 0,
              },
              fraction: Math.round(
                FRACTION_MULTIPLIER * linkedAssetFractions[i]
              ),
            },
          ],
        });
      }

      const block = await provider.getBlock("latest");

      if (block === null) {
        throw new Error("Failed to fetch the latest block");
      }

      routerOperation.addStep({
        stepAddress: routerAddress,
        encodedFunctionData: UniswapV2Router02.encodeFunctionData(
          "addLiquidity",
          [
            linkedAssets[0].address, //        address tokenA,
            linkedAssets[1].address, //        address tokenB,
            MAGIC_REPLACERS[0], //        uint amountADesired,
            MAGIC_REPLACERS[1], //        uint amountBDesired,
            1, //        uint amountAMin, // TODO: set minimum amount
            1, //        uint amountBMin, // TODO: set minimum amount
            walletAddress, //  address to,
            block.timestamp + 100000, //   uint deadline
          ]
        ),
        encodedFunctionResult: UniswapV2Router02.encodeFunctionResult(
          "addLiquidity",
          [MAGIC_REPLACERS[0], MAGIC_REPLACERS[1], MAGIC_REPLACERS[2]]
        ),
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveStoreAssignCall,
            storeNumber: storeNumbersLinkedAssets[0],

            offsetReplacer: {
              replacer: MAGIC_REPLACERS[0],
              occurrence: 0,
            },
            fraction: Math.round(linkedAssetFractions[0] * FRACTION_MULTIPLIER),
          },
          {
            storeOpType: StoreOpType.RetrieveStoreAssignCall,
            storeNumber: storeNumbersLinkedAssets[1],

            offsetReplacer: {
              replacer: MAGIC_REPLACERS[1],
              occurrence: 0,
            },
            fraction: Math.round(linkedAssetFractions[1] * FRACTION_MULTIPLIER),
          },
          {
            storeOpType: StoreOpType.RetrieveResultSubtractStore,
            storeNumber: storeNumbersLinkedAssets[0],

            offsetReplacer: {
              replacer: MAGIC_REPLACERS[0],
              occurrence: 0,
            },
            fraction: FRACTION_MULTIPLIER,
          },
          {
            storeOpType: StoreOpType.RetrieveResultSubtractStore,
            storeNumber: storeNumbersLinkedAssets[1],

            offsetReplacer: {
              replacer: MAGIC_REPLACERS[1],
              occurrence: 0,
            },
            fraction: FRACTION_MULTIPLIER,
          },
          {
            storeOpType: StoreOpType.RetrieveResultAddStore,
            storeNumber: storeNumberPool,

            offsetReplacer: {
              replacer: MAGIC_REPLACERS[2],
              occurrence: 0,
            },
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

      const block = await provider.getBlock("latest");

      if (block === null) {
        throw new Error("Failed to fetch the latest block");
      }

      routerOperation.addStep({
        stepAddress: routerAddress,
        encodedFunctionData: UniswapV2Router02.encodeFunctionData(
          "removeLiquidity",
          [
            linkedAssets[0].address, // tokenA
            linkedAssets[1].address, // tokenB
            MAGIC_REPLACERS[0], // liquidity,
            1, // amountAMin // TODO: set minimum amount
            1, // amountBMin // TODO: set minimum amount
            walletAddress, // address to,
            block.timestamp + 100000, // uint deadline
          ]
        ),
        encodedFunctionResult: UniswapV2Router02.encodeFunctionResult(
          "removeLiquidity",
          [MAGIC_REPLACERS[0], MAGIC_REPLACERS[1]]
        ),
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveStoreAssignCallSubtract,
            storeNumber: storeNumberPool,

            offsetReplacer: {
              replacer: MAGIC_REPLACERS[0],
              occurrence: 0,
            },
            fraction: Math.round(newFraction * FRACTION_MULTIPLIER),
          },
          {
            storeOpType: StoreOpType.RetrieveResultAddStore,
            storeNumber: storeNumbersLinkedAssets[0],

            offsetReplacer: {
              replacer: MAGIC_REPLACERS[0],
              occurrence: 0,
            },
            fraction: FRACTION_MULTIPLIER,
          },
          {
            storeOpType: StoreOpType.RetrieveResultAddStore,
            storeNumber: storeNumbersLinkedAssets[1],

            offsetReplacer: {
              replacer: MAGIC_REPLACERS[1],
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
