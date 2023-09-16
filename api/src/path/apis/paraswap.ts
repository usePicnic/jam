import { ethers, formatUnits } from "ethers";
import fetch from "node-fetch";
import { Exchange, exchanges, paraswapExchanges } from "../exchanges";
import { ParamsAPI, Route } from "./api";
import { limiterParaswap, useLimiter } from "../../external-apis/use-limiter";
import { get0xPrice } from "./zerox";
import { Asset } from "transaction/types";

async function callParaswapAPI({
  buyToken,
  sellToken,
  sellAmount,
  exchangeNames,
}: ParamsAPI): Promise<any> {
  const url = `https://apiv5.paraswap.io/prices/?srcToken=${sellToken.address}&destToken=${buyToken.address}&amount=${sellAmount}&side=SELL&network=137&includeDEXS=${exchangeNames},Multipath,Megapath`;
  const req = await fetch(url);

  let data;
  try {
    data = await req.json();
  } catch (e) {
    const responseText = await req.text();
    console.error(`Paraswap API error: ${e}`, { url, responseText });
    throw e;
  }

  console.log(
    `API response - Paraswap - sellToken: ${sellToken} buyToken: ${buyToken}`,
    { url, data }
  );
  return data;
}

async function callParaswapFullAPI({
  buyToken,
  sellToken,
  sellAmount,
}: {
  buyToken: Asset;
  sellToken: string;
  sellAmount: string;
}): Promise<any> {
  const url = `https://apiv5.paraswap.io/prices/?destDecimals=${buyToken.decimals}&srcToken=${sellToken}&destToken=${buyToken.address}&amount=${sellAmount}&side=SELL&network=137`;
  const req = await fetch(url);
  const reqClone = req.clone(); // workaround to avoid response already read error

  let data;
  try {
    data = await req.json();
  } catch (e) {
    const status = reqClone.status;
    const headers = reqClone.headers.raw();
    const responseText = await reqClone.text();
    console.error(`Paraswap API error: ${e}`, {
      url,
      status,
      headers,
      responseText,
    });
    return {}; // empty object so we can get to 0x routine
  }

  console.debug(
    `API response - Paraswap - sellToken: ${sellToken} buyToken asset ID: ${buyToken?._id}`,
    { url, data }
  );
  return data;
}

export async function getParaswapData(
  sellToken: string,
  buyToken: string,
  sellAmount: string,
  exchangeList: Exchange[] = exchanges
): Promise<Route[]> {
  const exchangeNames = exchangeList
    .map((exchange) => exchange.nameParaswap)
    .join(",");
  const params = { sellToken, buyToken, sellAmount, exchangeNames };
  const data = await useLimiter(limiterParaswap, callParaswapAPI, params);

  if (data.priceRoute !== undefined) {
    return processParaswapBestRoute(data.priceRoute);
  } else {
    return [];
  }
}

function paraswapConvertMATICtoWMATIC(address: string): string {
  return address == "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
    ? "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"
    : address;
}

export function processParaswapBestRoute(priceRoute) {
  const result = [] as Route[];
  priceRoute.bestRoute.map((route) => {
    route.swaps.map((swap) => {
      swap.swapExchanges.map((swapExchange) => {
        if (!(swapExchange.exchange in paraswapExchanges)) {
          return []; // Paraswap filter for input exchanges doesn't work consistently
        }

        // Additional data on the swap level (not sure on where to put it)
        swapExchange.srcToken = paraswapConvertMATICtoWMATIC(swap.srcToken);
        swapExchange.destToken = paraswapConvertMATICtoWMATIC(swap.destToken);

        const exchange = paraswapExchanges[swapExchange.exchange];
        const percentage = (route.percent * swapExchange.percent) / 100;
        const paramsList = exchange.getParams("paraswap", swapExchange);

        paramsList.map((params) => {
          const route = {
            exchange,
            percentage,
            params,
            fromToken: swapExchange.srcToken,
            toToken: swapExchange.destToken,
          };
          result.push(route);
        });
      });
    });
  });
  return result;
}

export async function getParaswapPrice(
  sellToken: Asset,
  buyToken: Asset,
  sellAmount: string,
  exchangeNames: string = ""
): Promise<number> {
  if (buyToken.address == sellToken.address) {
    return 1;
  }

  const params = { sellToken: sellToken.address, buyToken, sellAmount };
  const data = await useLimiter(limiterParaswap, callParaswapFullAPI, params);

  if (data.priceRoute === undefined || data.priceRoute.maxImpactReached) {
    return await get0xPrice(sellToken, buyToken, sellAmount);
  }

  const destAmount = parseFloat(
    formatUnits(data.priceRoute.destAmount, data.priceRoute.destDecimals)
  );
  const srcAmount = parseFloat(
    formatUnits(data.priceRoute.srcAmount, data.priceRoute.srcDecimals)
  );
  const price = srcAmount / destAmount;

  return price;
}
