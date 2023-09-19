import fetch from "node-fetch";
import { Exchange, ExchangeParams, exchanges } from "../exchanges";
import { getIlliquidAssetsData } from "./illiquid-assets";
import { getKyberData } from "./kyber";
import { getOneInchData } from "./one-inch";
import { getParaswapData } from "./paraswap";
import { getParaswapFullData } from "./paraswap-full";
import { get0xData } from "./zerox";
import { getZeroXFullData } from "./zerox-full";
import { Asset } from "../../transaction/types";

export interface RouteAggregator {
  paraswap?: Route[];
  zeroX?: Route[];
  kyber?: Route[];
  oneinch?: Route[];
  illiquid?: Route[];
  paraswapFull?: Route[];
}
export interface Route {
  fraction: number;
  exchange: Exchange;
  fromToken: string;
  toToken: string;
  params: ExchangeParams;
}

export interface ParamsAPI {
  buyToken: Asset;
  sellToken: Asset;
  sellAmount: string;
  exchangeNames: string;
}

const aggToFunctionMap = {
  oneinch: getOneInchData,
  zeroX: get0xData,
  paraswap: getParaswapData,
  kyber: getKyberData,
  illiquid: getIlliquidAssetsData,
  paraswapFull: getParaswapFullData,
  zeroXFull: getZeroXFullData,
};
export const aggregators = Object.keys(aggToFunctionMap);

async function callAggAPI({
  agg,
  sellToken,
  buyToken,
  sellAmount,
  exchangeList,
  tryNumber = 0,
}: {
  agg: string;
  sellToken: Asset;
  buyToken: Asset;
  sellAmount: string;
  exchangeList: Exchange[];
  tryNumber?: number;
}): Promise<RouteAggregator> {
  try {
    return await aggToFunctionMap[agg](
      sellToken,
      buyToken,
      sellAmount,
      exchangeList
    );
  } catch (e) {
    if (tryNumber < 3) {
      console.error(`Call API failed, ${agg}, tryNumber: ${tryNumber}`, { e });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return callAggAPI({
        agg,
        sellToken,
        buyToken,
        sellAmount,
        exchangeList,
        tryNumber: tryNumber + 1,
      });
    } else {
      throw e;
    }
  }
}

export async function getAggregatorResults({
  sellToken,
  buyToken,
  sellAmount,
  exchangeList = exchanges,
  aggregators,
  multiplier = "",
}: {
  sellToken: Asset;
  buyToken: Asset;
  sellAmount: string;
  exchangeList?: Exchange[];
  aggregators: string[];
  multiplier?: string;
}): Promise<RouteAggregator> {
  const sellAmountAdj = sellAmount + multiplier; // Multiplying value by 10 helps with flimsy routes
  const output = {};

  const promises = aggregators.map(async (key) => {
    try {
      output[key] = await callAggAPI({
        agg: key,
        sellToken,
        buyToken,
        sellAmount: sellAmountAdj,
        exchangeList,
      });
    } catch (e) {
      console.log(`Error found in meta-agg calls ${key}`, { e });
    }
  });

  await Promise.all(promises);

  return output;
}

export type APICoingeckoResponse = {
  [key: string]: {
    usd: number;
  };
};

export async function callCoingeckoAPI(
  coingeckoId: string
): Promise<APICoingeckoResponse> {
  const uri = `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd`;
  // TODO: native fetch should be used on next.js, but node-fetch on server-side
  const req = await fetch(uri);
  const data = (await req.json()) as APICoingeckoResponse;

  return data;
}

export async function getCoingeckoPrice(coingeckoId: string): Promise<number> {
  const data = await callCoingeckoAPI(coingeckoId);
  const priceNumber = Number(data[coingeckoId].usd);
  return priceNumber;
}
