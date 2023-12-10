import { BigNumberish, Provider, getAddress } from "ethers";
import { getPricesAndLinkedAssets } from "./get-prices-and-linked-assets";
import { Router } from "core/src/abis";
import path from "path";
import fs from "fs";
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

    const consolidatedAssets = assets ?? this.loadAssets();

    consolidatedAssets.forEach((asset) => {
      this.#byId[asset.id] = asset;
      this.#byAddress[asset.address] = asset;
    });
  }

  loadAssets() {
    const assetDirPath = path.join(__dirname, "../../../data/assets");
    const chainIds = fs.readdirSync(assetDirPath);
    let allAssets = [];

    for (const chainId of chainIds) {
      const protocolDirPath = path.join(assetDirPath, chainId);
      const protocolTypes = fs.readdirSync(protocolDirPath);

      for (const protocolType of protocolTypes) {
        const filePath = path.join(protocolDirPath, protocolType);
        const assets = JSON.parse(fs.readFileSync(filePath, "utf8"));
        allAssets = allAssets.concat(assets);
      }
    }

    return allAssets;
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

export type AssetType =
  | "token"
  | "networkToken"
  | "gammaDeposit"
  | "beefyDeposit"
  | "aaveV2Deposit"
  | "aaveV3Deposit"
  | "stargateDeposit"
  | "savingsDaiDeposit"
  | "balancerDeposit"
  | "uniswapV2Liquidity";

export enum StoreOpType {
  RetrieveStoreAssignValue, // 0
  RetrieveStoreAssignCall, // 1
  RetrieveResultAddStore, // 2
  RetrieveResultSubtractStore, // 3
  RetrieveStoreAssignValueSubtract, // 4
  RetrieveStoreAssignCallSubtract, // 5
  SubtractStoreFromStore, // 6
  AddStoreToStore, // 7
}

export type StoreOperation = {
  storeOpType: StoreOpType;
  storeNumber: BigNumberish;
  secondaryStoreNumber?: BigNumberish;
  offsetReplacer?: { replacer: string; occurrence: BigNumberish };
  fraction: BigNumberish;
};

export type DetailedStoreOperation = {
  storeOpType: StoreOpType;
  storeNumber: BigNumberish;
  secondaryStoreNumber?: BigNumberish;
  offset?: BigNumberish;
  fraction: BigNumberish;
};
export type DetailedStep = {
  stepAddress: string;
  stepEncodedCall: string;
  storeOperations: DetailedStoreOperation[];
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

  addStep({
    stepAddress,
    encodedFunctionData,
    encodedFunctionResult,
    storeOperations,
  }: {
    stepAddress: string;
    encodedFunctionData: string;
    encodedFunctionResult?: string;
    storeOperations: StoreOperation[];
  }) {
    function nthIndex(str, pat, n) {
      console.log({ str, pat, n });

      var L = str.length,
        i = -1;
      while (n-- >= 0 && i++ < L) {
        i = str.indexOf(pat, i);
        if (i < 0) break;
      }

      console.log({ i });
      return i;
    }

    const detailedStoreOperations: DetailedStoreOperation[] =
      storeOperations.map((storeOperation) => {
        if (
          storeOperation.storeOpType === StoreOpType.RetrieveStoreAssignCall ||
          storeOperation.storeOpType ===
            StoreOpType.RetrieveStoreAssignCallSubtract
        ) {
          const replacerWithout0x =
            storeOperation.offsetReplacer.replacer.substring(2);
          const idx = nthIndex(
            encodedFunctionData,
            replacerWithout0x,
            storeOperation.offsetReplacer.occurrence
          );
          if (idx === -1) {
            throw new Error(
              `Replacer ${storeOperation.offsetReplacer.replacer} not found in data ${encodedFunctionData}`
            );
          }
          const offset = idx / 2 - 1;
          return {
            storeOpType: storeOperation.storeOpType,
            fraction: storeOperation.fraction,
            storeNumber: storeOperation.storeNumber,
            secondaryStoreNumber: 0,
            offset,
          };
        } else if (
          storeOperation.storeOpType === StoreOpType.RetrieveResultAddStore ||
          storeOperation.storeOpType === StoreOpType.RetrieveResultSubtractStore
        ) {
          const replacerWithout0x =
            storeOperation.offsetReplacer.replacer.substring(2);
          const idx = nthIndex(
            encodedFunctionResult,
            replacerWithout0x,
            storeOperation.offsetReplacer.occurrence
          );
          if (idx === -1) {
            throw new Error(
              `Replacer ${storeOperation.offsetReplacer.replacer} not found in data ${encodedFunctionResult}`
            );
          }
          const offset = idx / 2 - 1;
          return {
            storeOpType: storeOperation.storeOpType,
            fraction: storeOperation.fraction,
            storeNumber: storeOperation.storeNumber,
            secondaryStoreNumber: 0,
            offset,
          };
        } else if (
          storeOperation.storeOpType === StoreOpType.RetrieveStoreAssignValue ||
          storeOperation.storeOpType ===
            StoreOpType.RetrieveStoreAssignValueSubtract
        ) {
          return {
            storeOpType: storeOperation.storeOpType,
            fraction: storeOperation.fraction,
            storeNumber: storeOperation.storeNumber,
            secondaryStoreNumber: 0,
            offset: 0,
          };
        } else if (
          storeOperation.storeOpType === StoreOpType.AddStoreToStore ||
          storeOperation.storeOpType === StoreOpType.SubtractStoreFromStore
        ) {
          return {
            storeOpType: storeOperation.storeOpType,
            fraction: storeOperation.fraction,
            storeNumber: storeOperation.storeNumber,
            secondaryStoreNumber: storeOperation.secondaryStoreNumber,
            offset: 0,
          };
        } else {
          throw new Error(
            `Invalid store operation type ${storeOperation.storeOpType}`
          );
        }
      });

    let stepEncodedCall = encodedFunctionData;
    storeOperations.map((storeOperation) => {
      if (
        storeOperation.storeOpType === StoreOpType.RetrieveStoreAssignCall ||
        storeOperation.storeOpType ===
          StoreOpType.RetrieveStoreAssignCallSubtract
      ) {
        const replacerWithout0x =
          storeOperation.offsetReplacer.replacer.substring(2);
        const zeroReplacer = "0".repeat(replacerWithout0x.length);
        stepEncodedCall = stepEncodedCall.replaceAll(
          replacerWithout0x,
          zeroReplacer
        );
      }
    });

    this.steps.push({
      stepAddress,
      stepEncodedCall,
      storeOperations: detailedStoreOperations,
    });
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
          secondaryStoreNumber: storeOperation.secondaryStoreNumber,
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
