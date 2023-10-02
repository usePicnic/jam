import { BigNumberish, Provider, getAddress } from "ethers";
import { getPricesAndLinkedAssets } from "./get-prices-and-linked-assets";
import { Router } from "core/src/interfaces";

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
  maxSize?: number;
  allowSlot?: number;
  balanceSlot?: number;
  callParams?: any;
  price?: number;
  // rawLogoUri?: string;
  // logos?: {
  //   logoUri: string;
  //   name: string;
  //   symbol: string;
  //   color: string;
  // }[];
}

export interface LinkedAsset {
  assetId: string;
  fraction: number;
}

export class AssetStore {
  #byId: { [key: string]: Asset };
  #byAddress: { [key: string]: Asset };
  #prices: { [key: string]: number };
  #linkedAssets: { [key: string]: LinkedAsset[] };

  constructor(assets?: Asset[]) {
    this.#byId = {};
    this.#byAddress = {};
    this.#prices = {};
    this.#linkedAssets = {};

    const definiteAssets: Asset[] =
      assets ?? require("../../../data/assets.json");

    definiteAssets.forEach((asset) => {
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

    const price = this.getPrice(asset.id);
    const linkedAssets = this.getLinkedAssets(asset.id);

    return { ...asset, price, linkedAssets };
  }

  // Function that gets asset by address, if not found throws an error
  getAssetByAddress(address: string): Asset {
    const asset = this.#byAddress[address];

    if (asset === undefined) {
      throw new Error(`Asset with address ${address} not found`);
    }

    const price = this.getPrice(asset.id);
    const linkedAssets = this.getLinkedAssets(asset.id);

    return { ...asset, price, linkedAssets };
  }

  getPrice(assetId: string): number | undefined {
    const price = this.#prices[assetId];

    return price ? price : undefined;
  }

  getLinkedAssets(assetId: string): LinkedAsset[] | undefined {
    const asset = this.#byId[assetId];
    const linkedAssets = this.#linkedAssets[assetId];

    return linkedAssets
      ? linkedAssets
      : asset.linkedAssets
      ? asset.linkedAssets
      : undefined;
  }

  getAssets(): Asset[] {
    return Object.values(this.#byId);
  }

  async cachePricesAndLinkedAssets({
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

        if ("rewards" in item && item.rewards !== undefined) {
          addAssetIds(item.rewards);
        }

        if (asset.linkedAssets !== undefined) {
          addAssetIds(asset.linkedAssets);
        }
      });
    };
    addAssetIds(allocation);

    const { prices, linkedAssets } = await getPricesAndLinkedAssets({
      assetStore,
      provider,
      assetIds,
    });

    this.#prices = prices;
    this.#linkedAssets = linkedAssets;
  }
}

interface CurrentAllocationItem {
  assetId?: string;
  address?: string;
  fraction: number;
}

export class CurrentAllocation {
  private assetStore: AssetStore;
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
    this.assetStore = assetStore;
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

  getAssetById({ assetId }: { assetId: string }): CurrentAllocationItem {
    let currentAsset = this.assetIdMap.get(assetId);
    if (!currentAsset) {
      const asset = this.assetStore.getAssetById(assetId);
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
    address,
    delta,
  }: {
    assetId?: string;
    address?: string;
    delta: number;
  }): boolean {
    let asset: CurrentAllocationItem | undefined;

    if (assetId) {
      asset = this.getAssetById({ assetId });
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

export interface AbsoluteAllocationItem {
  assetId: string;
  amountStr: BigNumberish;
  rewards?: AbsoluteAllocationItem[];
}

export type AbsoluteAllocation = AbsoluteAllocationItem[];
export type FractionAllocation = FractionAllocationItem[];

export type AssetLayer = { [key: string]: FractionAllocationItem };
export type AssetLayers = AssetLayer[];

export type AssetType = "token" | "networkToken" | "gammaDeposit";

export enum StoreOpType {
  RetrieveStoreAssignValue, // 0
  RetrieveStoreAssignCall, // 1
  RetrieveResultAssignStore, // 2
  RetrieveStoreAssignValueSubtract, // 3
  RetrieveStoreAssignCallSubtract, // 4
  SubtractStoreFromStore, // 5
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
  tmpStoreName?: string;
  value: BigNumberish;

  constructor({
    assetId,
    address,
    value,
    tmpStoreName,
  }: {
    assetId?: string;
    address?: string;
    tmpStoreName?: string;
    value: BigNumberish;
  }) {
    this.assetId = assetId;
    this.address = address;
    this.value = value;
    this.tmpStoreName = tmpStoreName;
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
    tmpStoreName,
  }: {
    assetId?: string;
    address?: string;
    tmpStoreName?: string;
    value?: BigNumberish;
  }): number {
    if (
      assetId === undefined &&
      address === undefined &&
      tmpStoreName === undefined
    ) {
      throw new Error(
        "Either assetId, address or tmpStoreName must be defined"
      );
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
        tmpStoreName,
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
        thisStore.value !== otherStore.value ||
        thisStore.tmpStoreName !== otherStore.tmpStoreName
      ) {
        return false;
      }
    }

    return true;
  }
}

export class RouterOperation {
  steps: DetailedStep[];
  stores: DetailedStores;

  constructor() {
    this.steps = [];
    this.stores = new DetailedStores();
  }

  getTransactionDetails(): {
    steps: {
      stepAddress: string;
      stepEncodedCall: string;
      storeOperations: {
        storeOpType: BigNumberish;
        storeNumber: BigNumberish;
        offset: BigNumberish;
        fraction: BigNumberish;
      }[];
    }[];
    stores: BigNumberish[];
  } {
    return {
      steps: this.steps.map((step) => ({
        stepAddress: step.stepAddress,
        stepEncodedCall: step.stepEncodedCall,
        storeOperations: step.storeOperations.map((storeOperation) => ({
          storeOpType: storeOperation.storeOpType,
          storeNumber: storeOperation.storeNumber,
          offset: storeOperation.offset,
          fraction: storeOperation.fraction,
        })),
      })),
      stores: this.stores.stores.map((store) => store.value),
    };
  }

  getEncodedTransactionData(): string {
    const transactionData = this.getTransactionDetails();

    return Router.encodeFunctionData("runSteps", [
      transactionData.steps,
      transactionData.stores,
    ]);
  }
}
