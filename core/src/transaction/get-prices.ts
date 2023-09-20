import { Provider } from "ethers";
import { retry } from "../utils/retry";
import { fetchPriceData, getPrice } from "./asset-type-strategies";
import { AssetPrices, AssetStore } from "./types";
export interface CallRequest {
  // TODO: this should not be any, but something similar to PriceInfo above
  [key: string]: any;
}

export interface RequestTree {
  [key: string]: CallRequest;
}

export async function fetchUnderlyingPromises(
  fetchObject: RequestTree
): Promise<RequestTree> {
  const keys = Object.keys(fetchObject);

  await Promise.all(
    keys.map(async (key) => {
      const keys2 = Object.keys(fetchObject[key]);
      await Promise.all(
        keys2.map(async (key2) => {
          fetchObject[key][key2] = await retry(
            async () => {
              const ret = await fetchObject[key][key2]();
              return ret;
            },
            () => {
              console.log("retrying...");
            },
            1,
            100
          );
        })
      );
    })
  );

  return fetchObject;
}

export async function getPrices({
  assetStore,
  provider,
  assetIds,
}: {
  assetStore: AssetStore;
  provider: Provider;
  assetIds: string[];
}): Promise<AssetPrices> {
  const assetPrices: AssetPrices = {};
  let fetchRequestTree: RequestTree = {};

  assetIds.map((assetId) => {
    const asset = assetStore.getAssetById(assetId);

    const fetchedData = fetchPriceData({ provider, assetStore, asset });
      fetchRequestTree = {
        ...fetchRequestTree,
        ...fetchedData,
      };
  });

  // Fetching promises underneath
  const requestTree = await fetchUnderlyingPromises(fetchRequestTree);

  assetIds.map((assetId) => {
    const asset = assetStore.getAssetById(assetId);
    assetPrices[assetId] = getPrice({ assetStore, asset, requestTree });
  });

  return assetPrices;
}
