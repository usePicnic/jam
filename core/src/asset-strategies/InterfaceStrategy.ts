import { Provider } from "ethers";
import { RequestTree } from "../transaction/get-prices-and-linked-assets";
import {
  RouterOperation,
  LinkedAsset,
  Asset,
  AssetStore,
  CurrentAllocation,
  FractionAllocationItem,
} from "../transaction/types";

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
export interface GenerateStepParams {
  chainId: number;
  provider: Provider;
  walletAddress: string;
  assetAllocation: FractionAllocationItem;
  assetStore: AssetStore;
  value: number;
  currentAllocation: CurrentAllocation;
  routerOperation: RouterOperation;
}

export interface FetchPriceDataParams {
  provider: Provider;
  assetStore: AssetStore;
  asset: Asset;
}

export interface GetPriceParams {
  assetStore: AssetStore;
  asset: Asset;
  requestTree: RequestTree;
}

export interface GetLinkedAssetsParams {
  assetStore: AssetStore;
  asset: Asset;
  requestTree: RequestTree;
}
