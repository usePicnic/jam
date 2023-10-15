import { getCoingeckoPrice } from "../external-apis/coingecko";
import { RequestTree } from "../transaction/get-prices-and-linked-assets";
import {
  FetchPriceDataParams,
  GetPriceParams,
  GenerateStepParams,
} from "./InterfaceStrategy";
import { InterfaceStrategy } from "./InterfaceStrategy";

export class NetworkTokenStrategy extends InterfaceStrategy {
  fetchPriceData({ provider, assetStore, asset }: FetchPriceDataParams) {
    let requestTree: RequestTree = {};
    requestTree["networkToken"] = {};
    requestTree["networkToken"].price = () =>
      getCoingeckoPrice("matic-network");

    return requestTree;
  }

  getPrice({ assetStore, asset, requestTree }: GetPriceParams) {
    return requestTree["networkToken"].price;
  }

  async generateStep({
    assetAllocation,
    assetStore,
    value,
    currentAllocation,
    routerOperation,
  }: GenerateStepParams) {
    return routerOperation;
  }
}
