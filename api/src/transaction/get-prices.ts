import { Provider } from "@ethersproject/providers";
import * as Sentry from "@sentry/node";
import { logger } from "../utils/logger";
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
          try {
            fetchObject[key][key2] = await retry(
              async () => {
                return await fetchObject[key][key2]();
              },
              () => {},
              8,
              30
            );
          } catch (e) {
            logger.error(`fetchUnderlyingPromises: ${e}`);
          }
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
  debugger;
  const assetPrices: AssetPrices = {};
  let fetchRequestTree: RequestTree = {};

  assetIds.map((assetId) => {
    const asset = assetStore.byId[assetId];
    // fetchObject still has lots of promises underneath
    try {
      const fetchedData = fetchPriceData({ provider, assetStore, asset });
      fetchRequestTree = {
        ...fetchRequestTree,
        ...fetchedData,
      };
    } catch (e) {
      logger.error(`Failed to get price (fetchData) for asset ${assetId}`, {
        e,
      });
      Sentry.captureException(e);
    }
  });

  // Fetching promises underneath
  const requestTree = await fetchUnderlyingPromises(fetchRequestTree);

  assetIds.map((assetId) => {
    const asset = assetStore.byId[assetId];
    assetPrices[assetId] = getPrice({ assetStore, asset, requestTree });
  });

  return assetPrices;
}
