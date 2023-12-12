import { getParaswapPrice } from "../external-apis/paraswap";
import { RequestTree } from "../transaction/get-prices-and-linked-assets";
import { SELL_AMOUNT } from "../transaction/asset-type-strategies-helpers";
import {
  FetchPriceDataParams,
  GetPriceParams,
  GenerateStepParams,
} from "./InterfaceStrategy";
import { InterfaceStrategy } from "./InterfaceStrategy";

export class TokenStrategy extends InterfaceStrategy {
  fetchPriceData({ provider, assetStore, asset }: FetchPriceDataParams) {
    let usdcAddress;
    if (asset.chainId === 1) {
      usdcAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    } else if (asset.chainId === 137) {
      usdcAddress = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
    } else {
      throw new Error("Unsupported chainId");
    }

    const sellToken = usdcAddress;
    const buyToken = asset.address;
    const sellAmount = SELL_AMOUNT;

    const price = () =>
      getParaswapPrice({
        sellToken: assetStore.getAssetByAddress(sellToken),
        buyToken: asset,
        sellAmount,
      });

    let requestTree: RequestTree = {};
    requestTree[buyToken] = {};
    requestTree[buyToken].price = price;

    return requestTree;
  }

  getPrice({ assetStore, asset, requestTree }: GetPriceParams) {
    return requestTree[asset.address].price;
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
