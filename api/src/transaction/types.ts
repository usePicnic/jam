import { BigNumberish } from "ethers";

interface Asset {
  id: string;
  name: string;
  networkName: string;
  active: boolean;
  address: string;
  color: string;
  decimals: number;
  symbol: string;
  type: string;
  visible: boolean;
  linkedAssets?: {
    assetId: string;
    fraction: number;
  }[];
  rawLogoUri?: string;
  logos?: {
    logoUri: string;
    name: string;
    symbol: string;
    color: string;
  }[];
}

export interface AssetStore {
  [key: string]: Asset;
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
