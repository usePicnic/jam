import { getParaswapPrice } from "../external-apis/paraswap";
import { getCoingeckoPrice } from "../external-apis/coingecko";
import { RequestTree } from "./get-prices";
import {
  Asset,
  AssetStore,
  AssetType,
  DetailedSteps,
  FractionAllocation,
  FractionAllocationItem,
  LinkedAsset,
} from "./types";
import {
  getAmount,
  getGammaPair,
  getGammaTVLs,
} from "./asset-type-strategies-helpers";
import { Contract, Provider } from "ethers";

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
  assetAllocation: FractionAllocationItem;
  assetStore: AssetStore;
  value: number;
  // currentAllocation: FractionAllocation;
  currentSteps: RouterOperation;
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

export abstract class InterfaceStrategy {
  abstract generateStep({
    assetStore,
    currentSteps,
  }: GenerateStepParams): Promise<RouterOperation>;
  abstract fetchPriceData({
    provider,
    assetStore,
    asset,
  }: FetchPriceDataParams): RequestTree;

  abstract getPrice({ assetStore, asset, requestTree }: GetPriceParams): number;
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
    currentSteps,
  }: GenerateStepParams) {
    return currentSteps;
  }
}

class TokenStrategy extends InterfaceStrategy {
  fetchPriceData({ provider, assetStore, asset }: FetchPriceDataParams) {
    const sellToken = USDC_ADDRESS;
    const buyToken = asset.address;
    const sellAmount = SELL_AMOUNT;

    const price = () =>
      getParaswapPrice({
        sellToken: assetStore.byAddress[sellToken],
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
    currentSteps,
  }: GenerateStepParams) {
    return currentSteps;
  }
}

class GammaDepositStrategy extends InterfaceStrategy {
  fetchPriceData({ provider, assetStore, asset }: FetchPriceDataParams) {
    const linkedAssets = asset.linkedAssets.map(
      (linkedAsset) => assetStore.byId[linkedAsset.assetId]
    );
    const pair = getGammaPair({ provider, address: asset.address });

    let requestTree: RequestTree = {};
    requestTree[asset.address] = {};

    console.log({ pair, getFunction: pair.getFunction("getTotalAmounts") });
    requestTree[asset.address].totalAmount = () =>
      pair.getFunction("getTotalAmounts").call(null);

    requestTree[asset.address].supply = () =>
      pair.getFunction("totalSupply").call(null);

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
    const tvls = getGammaTVLs({ asset, assetStore, requestTree });
    const tvl = tvls.reduce((a, b) => a + b, 0);

    const supply = getAmount({
      amount: requestTree[asset.address].supply,
      decimals: asset.decimals,
    });

    console.log({ tvls, tvl, supply, supplyRaw: requestTree[asset.address].supply, decimals: asset.decimals })

    return tvl / supply;
  }

  async generateStep({
    assetAllocation,
    assetStore,
    value,
    currentAllocation,
    currentSteps,
  }: GenerateStepParams) {
    return currentSteps;
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
    gammaDeposit: new GammaDepositStrategy(),
  },
};
