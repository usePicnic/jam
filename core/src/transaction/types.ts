import { BigNumberish } from "ethers";

export interface Asset {
  id: string;
  name: string;
  chainId: number;
  active: boolean;
  price: number;
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

export type AssetPrices = { [key: string]: number };

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

export type StoreOperations = {
  storeOpType: 1 | 2 | 3;
  storeNumber: BigNumberish;
  offset: BigNumberish;
  fraction: BigNumberish;
};
export type DetailedStep = {
  stepAddress: string;
  stepEncodedCall: string;
  storeOperations: StoreOperations[];
};
export class DetailedStore {
  assetId: string;
  value: BigNumberish;

  constructor(assetId: string, value: BigNumberish) {
    this.assetId = assetId;
    this.value = value;
  }
}
export class DetailedStores {
  byId: { [key: string]: number };
  stores: DetailedStore[];

  constructor() {
    this.byId = {};
    this.stores = [];
  }

  findOrInitializeStoreIdx({
    assetId,
    value,
  }: {
    assetId: string;
    value?: BigNumberish;
  }): number {
    const idx = this.byId[assetId];
    if (idx !== undefined) {
      if (value !== undefined) {
        throw new Error(
          "A store with this assetId already exists, value should not be set."
        );
      }
      return idx;
    } else {
      const newValue = value ?? 0;
      const newStore = new DetailedStore(assetId, newValue);
      const newIndex = this.stores.length;
      this.stores.push(newStore);
      this.byId[assetId] = newIndex;
      return newIndex;
    }
  }

  equals(other: DetailedStores): boolean {
    // Compare lengths of stores array
    if (this.stores.length !== other.stores.length) return false;

    // Compare byId mappings
    for (const [key, value] of Object.entries(this.byId)) {
      if (other.byId[key] !== value) return false;
    }

    // Compare stores array
    for (let i = 0; i < this.stores.length; i++) {
      const thisStore = this.stores[i];
      const otherStore = other.stores[i];
      if (
        thisStore.assetId !== otherStore.assetId ||
        thisStore.value !== otherStore.value
      ) {
        return false;
      }
    }

    return true;
  }
}

export type DetailedRouterOp = {
  steps: DetailedStep[];
  stores: DetailedStores;
};
