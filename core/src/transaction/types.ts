import { BigNumberish, Provider, getAddress } from "ethers";
import { getPrices } from "./get-prices";

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

export type AssetWithPrice = Asset & { price: number };

export interface LinkedAsset {
  assetId: string;
  fraction: number;
}

export class AssetStore {
  #byId: { [key: string]: Asset };
  #byAddress: { [key: string]: Asset };
  #prices: { [key: string]: number };

  constructor(assets: Asset[]) {
    this.#byId = {};
    this.#byAddress = {};
    this.#prices = {};

    assets.forEach((asset) => {
      this.#byId[asset.id] = asset;
      this.#byAddress[asset.address] = asset;
    });
  }

  // Function that gets asset by ID, if not found throws an error
  getAssetById(assetId: string): Asset {
    const asset = this.#byId[assetId];
    if (asset === undefined) {
      throw new Error(`Asset with id ${assetId} not found`);
    }
    return asset;
  }

  // Function that gets asset by address, if not found throws an error
  getAssetByAddress(address: string): Asset {
    const asset = this.#byAddress[address];
    if (asset === undefined) {
      throw new Error(`Asset with address ${address} not found`);
    }
    return asset;
  }

  getPrice(assetId: string): number {
    const price = this.#prices[assetId];
    if (price === undefined) {
      throw new Error(`Price for asset with id ${assetId} not found`);
    }
    return price;
  }

  getFullAssetById(assetId: string): AssetWithPrice {
    const asset = this.getAssetById(assetId);
    const price = this.getPrice(assetId);
    return { ...asset, price };
  }

  async cachePrices({
    allocation,
    assetStore,
    provider,
  }: {
    allocation: (AbsoluteAllocationItem | FractionAllocationItem)[];
    assetStore: AssetStore;
    provider: Provider;
  }) {
    const assetIds: string[] = [];

    // Recursively add assetIds and linkedAssets to array, as well as reward assets
    const addAssetIds = (
      allocation: (
        | AbsoluteAllocationItem
        | FractionAllocationItem
        | LinkedAsset
      )[]
    ) => {
      allocation.forEach((item) => {
        const asset = assetStore.getAssetById(item.assetId);

        assetIds.push(asset.id);

        if (asset.rewards !== undefined) {
          addAssetIds(item.rewards);
        }

        if (asset.linkedAssets !== undefined) {
          addAssetIds(asset.linkedAssets);
        }
      });
    };
    addAssetIds(allocation);

    const ret = await getPrices({ assetStore, provider, assetIds });

    this.#prices = ret;
  }
}

export type AssetPrices = { [key: string]: number };

export interface AbsoluteAllocationItem {
  assetId: string;
  amountStr: BigNumberish;
}

interface CurrentAllocationItem {
  assetId?: string;
  address?: string;
  fraction: number;
}

export class CurrentAllocation {
  private allocations: CurrentAllocationItem[] = [];
  private assetIdMap: Map<string, CurrentAllocationItem> = new Map();
  private addressMap: Map<string, CurrentAllocationItem> = new Map();

  constructor({
    fractionAllocation,
    assetStore,
  }: {
    fractionAllocation: FractionAllocation;
    assetStore: AssetStore;
  }) {
    fractionAllocation.forEach((item) => {
      const asset = assetStore.getAssetById(item.assetId);
      this.addAsset({
        asset: {
          assetId: item.assetId,
          address: getAddress(asset.address),
          fraction: item.fraction,
        },
      });

      if (item.rewards) {
        // TODO: Handle rewards
      }
    });
  }

  private addAsset({ asset }: { asset: CurrentAllocationItem }) {
    this.allocations.push(asset);
    if (asset.assetId) {
      this.assetIdMap.set(asset.assetId, asset);
    }
    if (asset.address) {
      this.addressMap.set(asset.address, asset);
    }
  }

  getAssetById({
    assetId,
    assetStore,
  }: {
    assetId: string;
    assetStore: AssetStore;
  }): CurrentAllocationItem {
    let currentAsset = this.assetIdMap.get(assetId);
    if (!currentAsset) {
      const asset = assetStore.getAssetById(assetId);
      currentAsset = {
        assetId,
        address: getAddress(asset.address),
        fraction: 0,
      };
      this.addAsset({
        asset: currentAsset,
      });
    }
    return currentAsset;
  }

  getAssetByAddress({ address }: { address: string }): CurrentAllocationItem {
    const checksummedAddress = getAddress(address);
    let asset = this.addressMap.get(checksummedAddress);
    if (!asset) {
      asset = { address, fraction: 0 };
      this.addAsset({ asset });
    }
    return asset;
  }

  updateFraction({
    assetId,
    assetStore,
    address,
    delta,
  }: {
    assetId?: string;
    assetStore?: AssetStore;
    address?: string;
    delta: number;
  }): boolean {
    let asset: CurrentAllocationItem | undefined;

    if (assetId) {
      if (!assetStore) {
        throw new Error("assetStore must be defined if assetId is defined");
      }
      asset = this.getAssetById({ assetId, assetStore });
    } else if (address) {
      asset = this.getAssetByAddress({ address });
    }

    if (!asset) {
      asset = { assetId, address, fraction: 0 };
      this.addAsset({ asset });
    }

    asset.fraction += delta;
    return true;
  }
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

export enum StoreOpType {
  RetrieveStoreAssignValue, // 0
  RetrieveStoreAssignCall, // 1
  RetrieveResultAssignStore, // 2
  RetrieveStoreAssignValueSubtract, // 3
  RetrieveStoreAssignCallSubtract, // 4
}

export type StoreOperations = {
  storeOpType: StoreOpType;
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
  assetId?: string;
  address?: string;
  value: BigNumberish;

  constructor({
    assetId,
    address,
    value,
  }: {
    assetId?: string;
    address?: string;
    value: BigNumberish;
  }) {
    this.assetId = assetId;
    this.address = address;
    this.value = value;
  }
}
export class DetailedStores {
  byId: { [key: string]: number };
  byAddress: { [key: string]: number };
  stores: DetailedStore[];

  constructor() {
    this.byId = {};
    this.byAddress = {};
    this.stores = [];
  }

  findOrInitializeStoreIdx({
    assetId,
    address,
    value,
  }: {
    assetId?: string;
    address?: string;
    value?: BigNumberish;
  }): number {
    if (assetId === undefined && address === undefined) {
      throw new Error("Either assetId or address must be defined");
    }

    const checksummedAddress = address ? getAddress(address) : undefined;
    let idx;
    if (assetId) {
      idx = this.byId[assetId];
    } else if (checksummedAddress) {
      idx = this.byAddress[checksummedAddress];
    }

    if (idx !== undefined) {
      if (value !== undefined) {
        throw new Error(
          "A store with this assetId already exists, value should not be set."
        );
      }
      return idx;
    } else {
      const newValue = value ?? 0;
      const newStore = new DetailedStore({
        assetId,
        address: checksummedAddress,
        value: newValue,
      });
      const newIndex = this.stores.length;
      this.stores.push(newStore);

      if (assetId) {
        this.byId[assetId] = newIndex;
      }
      if (checksummedAddress) {
        this.byAddress[checksummedAddress] = newIndex;
      }

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

export type RouterOperation = {
  steps: DetailedStep[];
  stores: DetailedStores;
};
