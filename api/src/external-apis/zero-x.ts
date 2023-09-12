import { Asset } from "../transaction/types";
import { zeroxNames } from "./exchanges";
import { ParamsAPI } from "./params-api";

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
      }
    ];
  };
  source: string;
  sourcePathId: string;
  type: number;

  // Added by us
  takerPercentage: number;
  estimatedPriceImpact: number;
};

export async function call0XAPIUnfiltered({
  buyToken,
  sellToken,
  sellAmount,
  exchangeNames,
}: ParamsAPI): Promise<any> {
  const url = `https://polygon.api.0x.org/swap/v1/quote?buyToken=${buyToken.address}&sellToken=${sellToken.address}&sellAmount=${sellAmount}`;
  const req = await fetch(url);
  const data = (await req.json()) as Order0X;
  console.debug(
    `API response - 0x - sellToken: ${sellToken} buyToken: ${buyToken}`,
    { url, data }
  );
  return data;
}

export async function get0xPrice({
  sellToken,
  buyToken,
  sellAmount,
  exchangeNames = zeroxNames,
}: {
  sellToken: Asset;
  buyToken: Asset;
  sellAmount: string;
  exchangeNames?: string;
}): Promise<number> {
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
    console.debug("ZeroX: price impact too high");
    return 0.00000001;
  }
  const price = data?.price ? 1 / Number(data.price) : null;

  return price;
}
