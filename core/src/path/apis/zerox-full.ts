import fetch from "node-fetch";
import { Exchange, exchanges, ZeroX, ZeroXFullParams } from "../exchanges";
import { ParamsAPI, Route } from "./api";
import { limiter0x, useLimiter } from "../../external-apis/use-limiter";
import { Asset } from "../../transaction/types";

function adjustAmount(amount) {
  const amountBN = BigInt(amount);
  const adjustedAmount = (amountBN * BigInt(9)) / BigInt(10);
  return adjustedAmount.toString();
}

async function callZeroXFullAPI({
  buyToken,
  sellToken,
  sellAmount,
  exchangeNames,
}: ParamsAPI): Promise<any> {
  let baseUrl;
  if (buyToken.chainId === 1) {
    baseUrl = "https://api.0x.org";
  } else if (buyToken.chainId === 137) {
    baseUrl = "https://polygon.api.0x.org";
  } else {
    throw new Error("Unsupported chainId");
  }

  const adjustedSellAmount = adjustAmount(sellAmount);
  const url = `${baseUrl}/swap/v1/quote?buyToken=${buyToken.address}&sellToken=${sellToken.address}&sellAmount=${adjustedSellAmount}`;

  const req = await fetch(url, {
    headers: {
      "0x-api-key": process.env.ZEROX_API_KEY,
    },
  });

  const data = await req.json();
  console.log(
    `API response - ZeroX - sellToken: ${sellToken} buyToken: ${buyToken}`,
    { url, data }
  );

  if (data.data === undefined) {
    throw new Error(`ZeroX API response is undefined: ${JSON.stringify(data)}`);
  }
  return data;
}

export async function getZeroXFullData(
  sellToken: Asset,
  buyToken: Asset,
  sellAmount: string,
  exchangeList: Exchange[] = exchanges
): Promise<Route[]> {
  const params = { sellToken, buyToken, sellAmount };
  const data = await useLimiter(limiter0x, callZeroXFullAPI, params);

  const zeroXAddress = data.to;
  const approveAddress = data.allowanceTarget;

  return [
    {
      fraction: 1,
      exchange: new ZeroX(),
      fromToken: sellToken.address,
      toToken: buyToken.address,
      params: {
        zeroXAddress,
        approveAddress,
        data: data.data,
      } as ZeroXFullParams,
    },
  ];
}
