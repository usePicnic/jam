import { RequestTree } from "./get-prices-and-linked-assets";
import { Asset, AssetStore, LinkedAsset } from "./types";
import { Provider } from "ethers";
import { assetTypeStrategies } from "../asset-strategies/asset-type-strategies";
import { BigNumberish, formatUnits } from "ethers";

export const SELL_AMOUNT = "25000000"; // 25 USD

export function getAmount({
  amount,
  decimals,
}: {
  amount: BigNumberish;
  decimals: number;
}): number {
  return Number(formatUnits(amount, decimals));
}

export function getPrice({
  assetStore,
  asset,
  requestTree,
}: {
  assetStore: AssetStore;
  asset: Asset;
  requestTree: RequestTree;
}): number {
  const strategy = assetTypeStrategies[asset.type];

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
  const strategy = assetTypeStrategies[asset.type];

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
  const strategy = assetTypeStrategies[asset.type];

  if (strategy === null || strategy === undefined) {
    throw new Error(
      `fetchData: unimplemented asset type strategy for ${asset.chainId} ${asset.type}`
    );
  } else {
    return strategy.fetchPriceData({ provider, assetStore, asset });
  }
}
