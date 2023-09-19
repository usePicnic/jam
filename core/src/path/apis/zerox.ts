import fetch from "node-fetch";
import { Exchange, zeroxExchanges, zeroxNames } from "../exchanges";
import { ParamsAPI, Route } from "./api";
import { limiter0x, useLimiter } from "../../external-apis/use-limiter";
import { Asset } from "../../transaction/types";

export type Order0X = {
  // Fields originally from 0X API
  price: string;
  makerToken: string;
  takerToken: string;
  makerAmount: string;
  takerAmount: string;
  fillData: {
    assets: string[];
    tokenAddressPath: string[];
    router: string;
    poolId: string;
    vault: string;
    pool: {
      poolAddress: string;
      exchangeFunctionSelector: string;
      takerTokenIdx: string;
      makerTokenIdx: string;
    };
    uniswapPath: string;
    poolsPath: string;
    swapSteps: [
      {
        poolId: string;
        assetInIndex: number;
        assetOutIndex: number;
        userData: string;
      },
    ];
  };
  source: string;
  sourcePathId: string;
  type: number;

  // Added by us
  takerPercentage: number;
  estimatedPriceImpact: number;
};

export async function call0XAPI({
  buyToken,
  sellToken,
  sellAmount,
  exchangeNames,
}: ParamsAPI): Promise<any> {
  const url = `https://polygon.api.0x.org/swap/v1/quote?buyToken=${buyToken.address}&sellToken=${sellToken.address}&includedSources=${exchangeNames},MultiHop&sellAmount=${sellAmount}`;
  const req = await fetch(url);
  const data = (await req.json()) as Order0X;
  console.log(
    `API response - 0x - sellToken: ${sellToken} buyToken: ${buyToken}`,
    { url, data }
  );
  return data;
}

export async function call0XAPIUnfiltered({
  buyToken,
  sellToken,
  sellAmount,
  exchangeNames,
}: ParamsAPI): Promise<any> {
  const url = `https://polygon.api.0x.org/swap/v1/quote?buyToken=${buyToken.address}&sellToken=${sellToken.address}&sellAmount=${sellAmount}`;
  const req = await fetch(url);
  const data = (await req.json()) as Order0X;
  console.log(
    `API response - 0x - sellToken: ${sellToken} buyToken: ${buyToken}`,
    { url, data }
  );
  return data;
}

export async function get0xPrice(
  sellToken: Asset,
  buyToken: Asset,
  sellAmount: string,
  exchangeNames: string = zeroxNames
): Promise<number> {
  if (buyToken == sellToken) {
    return 1;
  }
  const data = await call0XAPIUnfiltered({
    sellToken,
    buyToken,
    sellAmount,
    exchangeNames,
  });

  // Hack to deal with illiquid swaps
  const priceImpact = data?.estimatedPriceImpact
    ? Number(data.estimatedPriceImpact)
    : 0;

  if (priceImpact > 50) {
    console.log("ZeroX: price impact too high");
    return 0.00000001;
  }
  const price = data?.price ? 1 / Number(data.price) : null;

  return price;
}

export async function get0xData(
  sellToken: string,
  buyToken: string,
  sellAmount: string,
  exchangeList: Exchange[]
): Promise<Route[]> {
  const exchangeNames = exchangeList
    .map((exchange) => exchange.name0x)
    .join(",");

  const params = { sellToken, buyToken, sellAmount, exchangeNames };
  const data = await useLimiter(limiter0x, call0XAPI, params);
  if (data.orders === undefined) {
    return [];
  } else {
  }
  return process0xData(data);
}

function get0xTotalTakerAmount(data: any) {
  const totalTakerAmount: { [key: string]: number } = {};
  data.orders.map((order) => {
    if (totalTakerAmount[order.takerToken]) {
      totalTakerAmount[order.takerToken] += parseFloat(order.takerAmount);
    } else {
      totalTakerAmount[order.takerToken] = parseFloat(order.takerAmount);
    }
  });

  return totalTakerAmount;
}

export function process0xData(data: any): Route[] {
  const result = [] as Route[];
  const totalTakerAmount = get0xTotalTakerAmount(data);

  let fraction: number;
  data.orders.map((order) => {
    if (order.makerAmount == "0") {
      fraction = 1;
    } else {
      fraction =
        parseFloat(order.takerAmount) / totalTakerAmount[order.takerToken];
    }

    const exchange = zeroxExchanges[order.source];
    const paramsList = exchange.getParams("0x", order);

    paramsList.map((params) => {
      const route = {
        exchange,
        fraction,
        params,
        fromToken: params.tokenIn ? params.tokenIn : order.takerToken,
        toToken: params.tokenOut ? params.tokenOut : order.makerToken,
      };
      result.push(route);
    });
  });

  return result;
}
