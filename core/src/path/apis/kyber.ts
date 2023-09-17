import fetch from "node-fetch";
import { Exchange, kyberExchanges } from "../exchanges";
import { ParamsAPI, Route } from "./api";
import { useLimiter, limiterKyber } from "../../external-apis/use-limiter";

// Kyber DEX list
// https://github.com/KyberNetwork/kyberswap-aggregator-sdk/blob/main/src/config/dexes.ts

// Function to call kyber API and return a JSON object
async function callKyberAPI({
  buyToken,
  sellToken,
  sellAmount,
  exchangeNames,
}: ParamsAPI): Promise<any> {
  const url = `https://aggregator-api.kyberswap.com/polygon/route/encode?tokenIn=${sellToken.address}&tokenOut=${buyToken.address}&amountIn=${sellAmount}0&to=0xee13C86EE4eb1EC3a05E2cc3AB70576F31666b3b&dexes=${exchangeNames}`;
  const req = await fetch(url, {
    headers: {
      accept: "*/*",
      "accept-language": "en-US,en;q=0.9,pt;q=0.8",
      "accept-version": "Latest",
      "sec-ch-ua":
        '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Linux"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "x-request-id": "1f92a42b-109f-42f6-8bb8-84e6e25a47fc",
    },
    referrer: "https://kyberswap.com/",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: null,
    method: "GET",
    mode: "cors",
    credentials: "omit",
  });
  const data = await req.json();
  console.log(
    `API response - Kyber - sellToken: ${sellToken} buyToken: ${buyToken}`,
    { url, data }
  );
  return data;
}

export async function getKyberData(
  sellToken: string,
  buyToken: string,
  sellAmount: string,
  exchangeList: Exchange[]
): Promise<Route[]> {
  const exchangeNames = exchangeList
    .map((exchange) => exchange.nameKyber)
    .join(",");

  const params = { sellToken, buyToken, sellAmount, exchangeNames };
  const data = await useLimiter(limiterKyber, callKyberAPI, params);

  if (data.swaps !== undefined) {
    return processKyberSwaps(data);
  } else {
    return [];
  }
}

function getKyberTotalTakerAmount(data: any): any {
  const totalTakerAmount: { [key: string]: number } = {};
  data.swaps.map((swapBatch) => {
    const swap = swapBatch[0];
    if (totalTakerAmount[swap.tokenIn]) {
      totalTakerAmount[swap.tokenIn] += parseFloat(swap.swapAmount);
    } else {
      totalTakerAmount[swap.tokenIn] = parseFloat(swap.swapAmount);
    }
  });
  return totalTakerAmount;
}

export function processKyberSwaps(data: any): Route[] {
  const result: Route[] = [];
  const totalTakerAmount = getKyberTotalTakerAmount(data);

  data.swaps.map((swapBatch) => {
    swapBatch.map((swap) => {
      const exchange = kyberExchanges[swap.exchange];
      const percentage =
        (swapBatch[0].swapAmount / totalTakerAmount[swapBatch[0].tokenIn]) *
        100;
      const paramsList = exchange.getParams("kyber", swap);

      paramsList.map((params) => {
        const route = {
          exchange,
          percentage,
          params,
          fromToken: swap.tokenIn,
          toToken: swap.tokenOut,
        };
        result.push(route);
      });
    });
  });

  return result;
}
