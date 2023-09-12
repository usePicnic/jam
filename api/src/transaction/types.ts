import { BigNumberish } from "ethers";

export interface Asset {
  id: string;
  name: string;
  chainId: number;
  active: boolean;
  address: string;
  color: string;
  decimals: number;
  symbol: string;
  type: AssetType;
  visible: boolean;
  linkedAssets?: LinkedAsset[];
  rawLogoUri?: string;
  logos?: {
    logoUri: string;
    name: string;
    symbol: string;
    color: string;
  }[];
}

export interface LinkedAsset {
  assetId: string;
  fraction: number;
}

export class AssetStore {
  // Class that takes in its constructor a list of assets and organizes them in two methods:
  // - byId: a map of assetId -> Asset
  // - byAddress: a map of address -> Asset

  byId: { [key: string]: Asset };
  byAddress: { [key: string]: Asset };

  constructor(assets: Asset[]) {
    this.byId = {};
    this.byAddress = {};

    assets.forEach((asset) => {
      this.byId[asset.id] = asset;
      this.byAddress[asset.address] = asset;
    });
}
}

export interface AbsoluteAllocationItem {
  assetId: string;
  amountStr: BigNumberish;
}

export interface FractionAllocationItem {
  assetId: string;
  fraction: number;
  rewards?: FractionAllocationItem[];
}

export type AbsoluteAllocation = AbsoluteAllocationItem[];
export type FractionAllocation = FractionAllocationItem[];

export type AssetLayer = { [key: string]: FractionAllocationItem };
export type AssetLayers = AssetLayer[];

export type AssetType =
  | "token"
  | "networkToken"
  | "beefyDeposit"
  | "gammaDeposit";

