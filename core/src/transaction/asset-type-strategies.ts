import { getParaswapPrice } from "../external-apis/paraswap";
import { getCoingeckoPrice } from "../external-apis/coingecko";
import { RequestTree } from "./get-prices-and-linked-assets";
import {
  Asset,
  AssetStore,
  AssetType,
  RouterOperation,
  FractionAllocation,
  FractionAllocationItem,
  LinkedAsset,
  StoreOpType,
  CurrentAllocation,
} from "./types";
import { getAmount } from "./asset-type-strategies-helpers";
import { Contract, Provider } from "ethers";
import { getMagicOffsets } from "core/src/utils/get-magic-offset";
import {
  GammaRatiosCalculator,
  IBeefyVaultV6,
  IERC20,
  IHypervisor,
  IHypervisorRouter,
} from "core/src/interfaces";
import {
  FRACTION_MULTIPLIER,
  MAGIC_REPLACER_0,
  MAGIC_REPLACER_1,
} from "core/src/utils/get-magic-offset";
import { loadConfig } from "../config/load-config";

const USDC_ADDRESS = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
const SELL_AMOUNT = "25000000"; // 25 USD

export function getPrice({
  assetStore,
  asset,
  requestTree,
}: {
  assetStore: AssetStore;
  asset: Asset;
  requestTree: RequestTree;
}): number {
  const strategy = assetTypeStrategies[asset.chainId][asset.type];

  if (strategy === null || strategy === undefined) {
    throw new Error(
      `unimplemented interface strategy for ${asset.chainId} ${asset.type}`
    );
  } else {
    try {
      const price = strategy.getPrice({ assetStore, asset, requestTree });

      return price;
    } catch (e) {
      console.error(`Failed to get price (getPrice) for asset ${asset.id}`, {
        e,
      });
      throw e;
    }
  }
}

export function getLinkedAssets({
  assetStore,
  asset,
  requestTree,
}: {
  assetStore: AssetStore;
  asset: Asset;
  requestTree: RequestTree;
}): LinkedAsset[] {
  const strategy = assetTypeStrategies[asset.chainId][asset.type];

  if (strategy === null || strategy === undefined) {
    throw new Error(
      `unimplemented interface strategy for ${asset.chainId} ${asset.type}`
    );
  } else {
    try {
      const linkedAssets = strategy.getLinkedAssets({
        assetStore,
        asset,
        requestTree,
      });

      return linkedAssets;
    } catch (e) {
      console.error(`Failed to getLinkedAssets for asset ${asset.id}`, {
        e,
      });
      throw e;
    }
  }
}

export function fetchPriceData({
  provider,
  assetStore,
  asset,
}: {
  provider: Provider;
  assetStore: AssetStore;
  asset: Asset;
}): RequestTree {
  if (!asset?.chainId || !asset?.type) {
    throw new Error(
      `fetchData: invalid chainId or type for asset ID ${asset?.id}`
    );
  }
  const strategy = assetTypeStrategies[asset.chainId][asset.type];

  if (strategy === null || strategy === undefined) {
    throw new Error(
      `fetchData: unimplemented asset type strategy for ${asset.chainId} ${asset.type}`
    );
  } else {
    return strategy.fetchPriceData({ provider, assetStore, asset });
  }
}

interface GenerateStepParams {
  chainId: number;
  provider: Provider;
  walletAddress: string;
  assetAllocation: FractionAllocationItem;
  assetStore: AssetStore;
  value: number;
  currentAllocation: CurrentAllocation;
  routerOperation: RouterOperation;
}

interface FetchPriceDataParams {
  provider: Provider;
  assetStore: AssetStore;
  asset: Asset;
}

interface GetPriceParams {
  assetStore: AssetStore;
  asset: Asset;
  requestTree: RequestTree;
}

interface GetLinkedAssetsParams {
  assetStore: AssetStore;
  asset: Asset;
  requestTree: RequestTree;
}

export abstract class InterfaceStrategy {
  abstract generateStep({
    chainId,
    provider,
    walletAddress,
    assetAllocation,
    assetStore,
    value,
    currentAllocation,
    routerOperation,
  }: GenerateStepParams): Promise<RouterOperation>;

  abstract fetchPriceData({
    provider,
    assetStore,
    asset,
  }: FetchPriceDataParams): RequestTree;

  abstract getPrice({ assetStore, asset, requestTree }: GetPriceParams): number;

  getLinkedAssets({
    assetStore,
    asset,
    requestTree,
  }: GetLinkedAssetsParams): LinkedAsset[] | null {
    return asset.linkedAssets ? asset.linkedAssets : null;
  }
}

class NetworkTokenStrategy extends InterfaceStrategy {
  fetchPriceData({ provider, assetStore, asset }: FetchPriceDataParams) {
    let requestTree: RequestTree = {};
    requestTree["networkToken"] = {};
    requestTree["networkToken"].price = () =>
      getCoingeckoPrice("matic-network");

    return requestTree;
  }

  getPrice({ assetStore, asset, requestTree }: GetPriceParams) {
    return requestTree["networkToken"].price;
  }

  async generateStep({
    assetAllocation,
    assetStore,
    value,
    currentAllocation,
    routerOperation,
  }: GenerateStepParams) {
    return routerOperation;
  }
}

class TokenStrategy extends InterfaceStrategy {
  fetchPriceData({ provider, assetStore, asset }: FetchPriceDataParams) {
    const sellToken = USDC_ADDRESS;
    const buyToken = asset.address;
    const sellAmount = SELL_AMOUNT;

    const price = () =>
      getParaswapPrice({
        sellToken: assetStore.getAssetByAddress(sellToken),
        buyToken: asset,
        sellAmount,
      });

    let requestTree: RequestTree = {};
    requestTree[buyToken] = {};
    requestTree[buyToken].price = price;

    return requestTree;
  }

  getPrice({ assetStore, asset, requestTree }: GetPriceParams) {
    return requestTree[asset.address].price;
  }

  async generateStep({
    assetAllocation,
    assetStore,
    value,
    currentAllocation,
    routerOperation,
  }: GenerateStepParams) {
    return routerOperation;
  }
}

class GammaDepositStrategy extends InterfaceStrategy {
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
      (tvl) => Math.round((tvl / totalTvl) * 100_000) / 100_000
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
          [linkedAssetAddresses[0], linkedAssetAddresses[1]], // tokens
          [MAGIC_REPLACER_0, MAGIC_REPLACER_1], // amounts
          asset.address, // hypervisorAddress
          hypervisorRouterAddress, // hypervisorRouterAddress
        ]),
        magicReplacers: [MAGIC_REPLACER_0, MAGIC_REPLACER_1],
      });
      const { offsets: calculateRatiosToOffsets } = getMagicOffsets({
        data: GammaRatiosCalculator.encodeFunctionResult("calculateRatios", [
          MAGIC_REPLACER_0,
          MAGIC_REPLACER_1,
        ]),
        magicReplacers: [MAGIC_REPLACER_0, MAGIC_REPLACER_1],
      });

      routerOperation.steps.push({
        stepAddress: config.networks[chainId].gammaRatiosCalculator,
        stepEncodedCall: calculateRatiosEncodedCall,
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveStoreAssignCall,
            storeNumber: storeNumberFrom0,
            offset: calculateRatiosFromOffsets[0],
            fraction: Math.round(linkedAssetFractions[0] * FRACTION_MULTIPLIER),
          },
          {
            storeOpType: StoreOpType.RetrieveStoreAssignCall,
            storeNumber: storeNumberFrom1,
            offset: calculateRatiosFromOffsets[1],
            fraction: Math.round(linkedAssetFractions[1] * FRACTION_MULTIPLIER),
          },
          {
            storeOpType: StoreOpType.RetrieveResultAssignStore,
            storeNumber: storeNumberTmp[0],
            offset: calculateRatiosToOffsets[0],
            fraction: FRACTION_MULTIPLIER,
          },
          {
            storeOpType: StoreOpType.RetrieveResultAssignStore,
            storeNumber: storeNumberTmp[1],
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
              MAGIC_REPLACER_0,
            ]),
            magicReplacers: [MAGIC_REPLACER_0],
          });

        routerOperation.steps.push({
          stepAddress: linkedAsset.address,
          stepEncodedCall: approveEncodedCall,
          storeOperations: [
            {
              storeOpType: StoreOpType.RetrieveStoreAssignCall,
              storeNumber: storeNumberTmp[i],
              offset: approveFromOffsets[0],
              fraction: FRACTION_MULTIPLIER,
            },
          ],
        });
      }

      const { data: depositEncodedCall, offsets: depositFromOffsets } =
        getMagicOffsets({
          data: IHypervisorRouter.encodeFunctionData("deposit", [
            MAGIC_REPLACER_0, // deposit0
            MAGIC_REPLACER_1, // deposit1
            walletAddress, // to
            asset.address, // pos
            [0, 0, 0, 0], // minIn
          ]),
          magicReplacers: [MAGIC_REPLACER_0, MAGIC_REPLACER_1],
        });

      const { offsets: depositToOffsets } = getMagicOffsets({
        data: IHypervisorRouter.encodeFunctionResult("deposit", [
          MAGIC_REPLACER_0,
        ]),
        magicReplacers: [MAGIC_REPLACER_0],
      });

      routerOperation.steps.push({
        stepAddress: hypervisorRouterAddress,
        stepEncodedCall: depositEncodedCall,
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveStoreAssignCall,
            storeNumber: storeNumberTmp[0],
            offset: depositFromOffsets[0],
            fraction: FRACTION_MULTIPLIER,
          },
          {
            storeOpType: StoreOpType.RetrieveStoreAssignCall,
            storeNumber: storeNumberTmp[1],
            offset: depositFromOffsets[1],
            fraction: FRACTION_MULTIPLIER,
          },
          {
            storeOpType: StoreOpType.SubtractStoreFromStore,
            storeNumber: storeNumberTmp[0],
            offset: storeNumberFrom0,
            fraction: FRACTION_MULTIPLIER,
          },
          {
            storeOpType: StoreOpType.SubtractStoreFromStore,
            storeNumber: storeNumberTmp[1],
            offset: storeNumberFrom1,
            fraction: FRACTION_MULTIPLIER,
          },
          {
            storeOpType: StoreOpType.RetrieveResultAssignStore,
            storeNumber: storeNumberTo,
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
            MAGIC_REPLACER_0, // shares
            walletAddress, // to
            walletAddress, // from
            [0, 0, 0, 0], // minAmounts
          ]),
          magicReplacers: [MAGIC_REPLACER_0],
        });

      const { offsets: withdrawToOffsets } = getMagicOffsets({
        data: IHypervisor.encodeFunctionResult("withdraw", [
          MAGIC_REPLACER_0,
          MAGIC_REPLACER_1,
        ]),
        magicReplacers: [MAGIC_REPLACER_0, MAGIC_REPLACER_1],
      });

      routerOperation.steps.push({
        stepAddress: asset.address,
        stepEncodedCall: withdrawEncodedCall,
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveStoreAssignCall,
            storeNumber: storeNumberFrom,
            offset: withdrawFromOffsets[0],
            fraction: newFraction * FRACTION_MULTIPLIER,
          },
          {
            storeOpType: StoreOpType.RetrieveResultAssignStore,
            storeNumber: storeNumberTo0,
            offset: withdrawToOffsets[0],
            fraction: FRACTION_MULTIPLIER,
          },
          {
            storeOpType: StoreOpType.RetrieveResultAssignStore,
            storeNumber: storeNumberTo1,
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

class BeefyDepositStrategy extends InterfaceStrategy {
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
            MAGIC_REPLACER_0,
          ]),
          magicReplacers: [MAGIC_REPLACER_0],
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
        data: IERC20.encodeFunctionResult("balanceOf", [MAGIC_REPLACER_0]),
        magicReplacers: [MAGIC_REPLACER_0],
      });

      routerOperation.steps.push({
        stepAddress: asset.address,
        stepEncodedCall: IERC20.encodeFunctionData("balanceOf", [
          asset.address,
        ]),
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveResultAssignStore,
            storeNumber: storeNumberTmp,
            offset: balanceOfToOffsets[0],
            fraction: FRACTION_MULTIPLIER,
          },
        ],
      });

      const { data: depositEncodedCall, offsets: depositFromOffsets } =
        getMagicOffsets({
          data: IBeefyVaultV6.encodeFunctionData("deposit", [
            MAGIC_REPLACER_0, // deposit0
          ]),
          magicReplacers: [MAGIC_REPLACER_0],
        });

      routerOperation.steps.push({
        stepAddress: asset.address,
        stepEncodedCall: depositEncodedCall,
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveStoreAssignCallSubtract,
            storeNumber: storeNumberFrom,
            offset: depositFromOffsets[0],
            fraction: FRACTION_MULTIPLIER,
          },
        ],
      });

      routerOperation.steps.push({
        stepAddress: asset.address,
        stepEncodedCall: IERC20.encodeFunctionData("balanceOf", [
          asset.address,
        ]),
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveResultSubtractStore,
            storeNumber: storeNumberTmp,
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
    }

    return routerOperation;
  }
}

export const assetTypeStrategies: {
  [chainId: number]: {
    [interfaceName in AssetType]: InterfaceStrategy;
  };
} = {
  137: {
    token: new TokenStrategy(),
    networkToken: new NetworkTokenStrategy(),
    beefyDeposit: new BeefyDepositStrategy(),
    gammaDeposit: new GammaDepositStrategy(),
  },
};
