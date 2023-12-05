import { RequestTree } from "../transaction/get-prices-and-linked-assets";
import {
  Asset,
  AssetStore,
  LinkedAsset,
  StoreOpType,
} from "../transaction/types";
import {
  getAmount,
  fetchPriceData,
  getPrice,
} from "../transaction/asset-type-strategies-helpers";
import { Contract } from "ethers";
import { getMagicOffsets } from "core/src/utils/get-magic-offset";
import {
  GammaRatiosCalculator,
  IERC20,
  IHypervisor,
  IHypervisorRouter,
} from "core/src/abis";
import {
  FRACTION_MULTIPLIER,
  MAGIC_REPLACERS,
} from "core/src/utils/get-magic-offset";
import { loadConfig } from "../config/load-config";
import {
  FetchPriceDataParams,
  GetPriceParams,
  GetLinkedAssetsParams,
  GenerateStepParams,
} from "./InterfaceStrategy";
import { InterfaceStrategy } from "./InterfaceStrategy";

export class GammaDepositStrategy extends InterfaceStrategy {
  fetchPriceData({ provider, assetStore, asset }: FetchPriceDataParams) {
    const linkedAssets = asset.linkedAssets.map((linkedAsset) =>
      assetStore.getAssetById(linkedAsset.assetId)
    );
    const hypervisor = new Contract(asset.address, IHypervisor, provider);

    let requestTree: RequestTree = {};
    requestTree[asset.address] = {};

    requestTree[asset.address].totalAmount = () =>
      hypervisor.getFunction("getTotalAmounts").call(null);

    requestTree[asset.address].supply = () =>
      hypervisor.getFunction("totalSupply").call(null);

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
    const tvls = this.getGammaTVLs({ asset, assetStore, requestTree });
    const tvl = tvls.reduce((a, b) => a + b, 0);

    const supply = getAmount({
      amount: requestTree[asset.address].supply,
      decimals: asset.decimals,
    });

    console.log("Gamma getPrice", {
      tvls,
      tvl,
      supply,
      supplyRaw: requestTree[asset.address].supply,
      decimals: asset.decimals,
    });

    return tvl / supply;
  }

  getLinkedAssets({
    assetStore,
    asset,
    requestTree,
  }: GetLinkedAssetsParams): LinkedAsset[] | null {
    const tvls = this.getGammaTVLs({ asset, assetStore, requestTree });

    const totalTvl = tvls.reduce((a, b) => a + b, 0);
    // fraction is to be rounded up to 0.00001 precision, sum of fractions needs to be 1
    const fractions = tvls.map(
      (tvl) => Math.round((tvl / totalTvl) * 100000) / 100000
    );
    console.log("gamma tvls", {
      tvls,
      totalTvl,
      fractions,
      linkedAssets: asset.linkedAssets,
    });

    // guarantee that fractions sum == 1, if not adjust it to be
    fractions[0] += 1 - fractions.reduce((a, b) => a + b, 0);

    return asset.linkedAssets.map((linkedAsset, i) => ({
      assetId: linkedAsset.assetId,
      fraction: fractions[i],
    }));
    // asset.linkedAssets[0].fraction = fractions[0];
    // asset.linkedAssets[1].fraction = fractions[1];
    // if (asset.linkedAssets[0].fraction == 0) {
    //   asset.linkedAssets[0].fraction = 0.00001;
    //   asset.linkedAssets[1].fraction -= 0.00001;
    // }
    // if (asset.linkedAssets[1].fraction == 0) {
    //   asset.linkedAssets[1].fraction = 0.00001;
    //   asset.linkedAssets[0].fraction -= 0.00001;
    // }
  }

  async generateStep({
    chainId,
    provider,
    walletAddress,
    assetAllocation,
    assetStore,
    value,
    currentAllocation,
    routerOperation,
  }: GenerateStepParams) {
    const asset = assetStore.getAssetById(assetAllocation.assetId);
    if (assetAllocation.fraction > 0) {
      const storeNumberFrom0 = routerOperation.stores.findOrInitializeStoreIdx({
        assetId: asset.linkedAssets[0].assetId,
      });
      const storeNumberFrom1 = routerOperation.stores.findOrInitializeStoreIdx({
        assetId: asset.linkedAssets[1].assetId,
      });
      const storeNumberTo = routerOperation.stores.findOrInitializeStoreIdx({
        assetId: asset.id,
      });

      const linkedAssetFractions = asset.linkedAssets.map((la, i) => {
        const currentFraction = currentAllocation.getAssetById({
          assetId: la.assetId,
        }).fraction;
        const newFraction = la.fraction / currentFraction;
        const variation = currentFraction * newFraction;

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

      const linkedAssetAddresses = asset.linkedAssets.map(
        (la) => assetStore.getAssetById(la.assetId).address
      );

      const storeNumberTmp = [
        routerOperation.stores.findOrInitializeStoreIdx({
          tmpStoreName: `${asset.id} tmp store 0`,
        }),
        routerOperation.stores.findOrInitializeStoreIdx({
          tmpStoreName: `${asset.id} tmp store 1`,
        }),
      ];

      const hypervisor = new Contract(asset.address, IHypervisor, provider);
      const hypervisorRouterAddress = await hypervisor.whitelistedAddress();

      const config = await loadConfig();
      const {
        data: calculateRatiosEncodedCall,
        offsets: calculateRatiosFromOffsets,
      } = getMagicOffsets({
        data: GammaRatiosCalculator.encodeFunctionData("calculateRatios", [
          [linkedAssetAddresses[0], linkedAssetAddresses[1]],
          [MAGIC_REPLACERS[0], MAGIC_REPLACERS[1]],
          asset.address,
          hypervisorRouterAddress, // hypervisorRouterAddress
        ]),
        magicReplacers: [MAGIC_REPLACERS[0], MAGIC_REPLACERS[1]],
      });
      const { offsets: calculateRatiosToOffsets } = getMagicOffsets({
        data: GammaRatiosCalculator.encodeFunctionResult("calculateRatios", [
          MAGIC_REPLACERS[0],
          MAGIC_REPLACERS[1],
        ]),
        magicReplacers: [MAGIC_REPLACERS[0], MAGIC_REPLACERS[1]],
      });

      routerOperation.steps.push({
        stepAddress: config.networks[chainId].gammaRatiosCalculator,
        stepEncodedCall: calculateRatiosEncodedCall,
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveStoreAssignCall,
            storeNumber: storeNumberFrom0,
            secondaryStoreNumber: 0,
            offset: calculateRatiosFromOffsets[0],
            fraction: Math.round(linkedAssetFractions[0] * FRACTION_MULTIPLIER),
          },
          {
            storeOpType: StoreOpType.RetrieveStoreAssignCall,
            storeNumber: storeNumberFrom1,
            secondaryStoreNumber: 0,
            offset: calculateRatiosFromOffsets[1],
            fraction: Math.round(linkedAssetFractions[1] * FRACTION_MULTIPLIER),
          },
          {
            storeOpType: StoreOpType.RetrieveResultAddStore,
            storeNumber: storeNumberTmp[0],
            secondaryStoreNumber: 0,
            offset: calculateRatiosToOffsets[0],
            fraction: FRACTION_MULTIPLIER,
          },
          {
            storeOpType: StoreOpType.RetrieveResultAddStore,
            storeNumber: storeNumberTmp[1],
            secondaryStoreNumber: 0,
            offset: calculateRatiosToOffsets[1],
            fraction: FRACTION_MULTIPLIER,
          },
        ],
      });

      for (const [i, la] of asset.linkedAssets.entries()) {
        const linkedAsset = assetStore.getAssetById(la.assetId);

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
              storeNumber: storeNumberTmp[i],
              secondaryStoreNumber: 0,
              offset: approveFromOffsets[0],
              fraction: FRACTION_MULTIPLIER,
            },
          ],
        });
      }

      const { data: depositEncodedCall, offsets: depositFromOffsets } =
        getMagicOffsets({
          data: IHypervisorRouter.encodeFunctionData("deposit", [
            MAGIC_REPLACERS[0],
            MAGIC_REPLACERS[1],
            walletAddress,
            asset.address,
            [0, 0, 0, 0], // minIn
          ]),
          magicReplacers: [MAGIC_REPLACERS[0], MAGIC_REPLACERS[1]],
        });

      const { offsets: depositToOffsets } = getMagicOffsets({
        data: IHypervisorRouter.encodeFunctionResult("deposit", [
          MAGIC_REPLACERS[0],
        ]),
        magicReplacers: [MAGIC_REPLACERS[0]],
      });

      routerOperation.steps.push({
        stepAddress: hypervisorRouterAddress,
        stepEncodedCall: depositEncodedCall,
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveStoreAssignCall,
            storeNumber: storeNumberTmp[0],
            secondaryStoreNumber: 0,
            offset: depositFromOffsets[0],
            fraction: FRACTION_MULTIPLIER,
          },
          {
            storeOpType: StoreOpType.RetrieveStoreAssignCall,
            storeNumber: storeNumberTmp[1],
            secondaryStoreNumber: 0,
            offset: depositFromOffsets[1],
            fraction: FRACTION_MULTIPLIER,
          },
          {
            storeOpType: StoreOpType.SubtractStoreFromStore,
            storeNumber: storeNumberFrom0,
            secondaryStoreNumber: storeNumberTmp[0],
            offset: 0,
            fraction: FRACTION_MULTIPLIER,
          },
          {
            storeOpType: StoreOpType.SubtractStoreFromStore,
            storeNumber: storeNumberFrom1,
            secondaryStoreNumber: storeNumberTmp[1],
            offset: 0,
            fraction: FRACTION_MULTIPLIER,
          },
          {
            storeOpType: StoreOpType.RetrieveResultAddStore,
            storeNumber: storeNumberTo,
            secondaryStoreNumber: 0,
            offset: depositToOffsets[0],
            fraction: FRACTION_MULTIPLIER,
          },
        ],
      });

      return routerOperation;
    } else if (assetAllocation.fraction < 0) {
      const storeNumberFrom = routerOperation.stores.findOrInitializeStoreIdx({
        assetId: asset.id,
      });
      const storeNumberTo0 = routerOperation.stores.findOrInitializeStoreIdx({
        assetId: asset.linkedAssets[0].assetId,
      });
      const storeNumberTo1 = routerOperation.stores.findOrInitializeStoreIdx({
        assetId: asset.linkedAssets[1].assetId,
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
          data: IHypervisor.encodeFunctionData("withdraw", [
            MAGIC_REPLACERS[0],
            walletAddress,
            walletAddress,
            [0, 0, 0, 0], // minAmounts
          ]),
          magicReplacers: [MAGIC_REPLACERS[0]],
        });

      const { offsets: withdrawToOffsets } = getMagicOffsets({
        data: IHypervisor.encodeFunctionResult("withdraw", [
          MAGIC_REPLACERS[0],
          MAGIC_REPLACERS[1],
        ]),
        magicReplacers: [MAGIC_REPLACERS[0], MAGIC_REPLACERS[1]],
      });

      routerOperation.steps.push({
        stepAddress: asset.address,
        stepEncodedCall: withdrawEncodedCall,
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveStoreAssignCall,
            storeNumber: storeNumberFrom,
            secondaryStoreNumber: 0,
            offset: withdrawFromOffsets[0],
            fraction: Math.round(newFraction * FRACTION_MULTIPLIER),
          },
          {
            storeOpType: StoreOpType.RetrieveResultAddStore,
            storeNumber: storeNumberTo0,
            secondaryStoreNumber: 0,
            offset: withdrawToOffsets[0],
            fraction: FRACTION_MULTIPLIER,
          },
          {
            storeOpType: StoreOpType.RetrieveResultAddStore,
            storeNumber: storeNumberTo1,
            secondaryStoreNumber: 0,
            offset: withdrawToOffsets[1],
            fraction: FRACTION_MULTIPLIER,
          },
        ],
      });

      return routerOperation;
    }
  }

  getGammaTVLs({
    asset,
    assetStore,
    requestTree,
  }: {
    asset: Asset;
    assetStore: AssetStore;
    requestTree: RequestTree;
  }) {
    const linkedAssets = asset.linkedAssets.map((linkedAsset) =>
      assetStore.getAssetById(linkedAsset.assetId)
    );

    return linkedAssets.map((linkedAsset, i) => {
      const amount = requestTree[asset.address].totalAmount[i];
      console.log({ "getGammaTVLs amount123": amount });
      console.log({
        "getGammaTVLs price123": getPrice({
          assetStore,
          asset: linkedAsset,
          requestTree,
        }),
      });
      return (
        getPrice({ assetStore, asset: linkedAsset, requestTree }) *
        getAmount({ amount, decimals: linkedAsset.decimals })
      );
    });
  }
}
