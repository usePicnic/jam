import fetch from "node-fetch";
import {
  Exchange,
  exchanges,
  Paraswap,
  ParaswapFullParams,
} from "../exchanges";
import { ParamsAPI, Route } from "./api";
import { limiterParaswap, useLimiter } from "../../external-apis/use-limiter";
import { Asset } from "../../transaction/types";

async function callParaswapFullAPI({
  buyToken,
  sellToken,
  sellAmount,
  exchangeNames,
}: ParamsAPI): Promise<any> {
  const url = `https://apiv5.paraswap.io/prices/?srcToken=${sellToken.address}&srcDecimals=${sellToken.decimals}&destToken=${buyToken.address}&destDecimals=${buyToken.decimals}&amount=${sellAmount}&side=SELL&network=137&includeContractMethods=MegaSwap,MultiSwap`;

  const req = await fetch(url);

  const data = await req.json();
  console.log(
    `API response - Paraswap - sellToken: ${sellToken} buyToken: ${buyToken}`,
    { url, data }
  );
  return data;
}

// ParaswapTxAPIParams has one field, which is body of type any
interface ParaswapTxAPIParams {
  body: any;
}

async function callParaswapFullTxAPI({
  body,
}: ParaswapTxAPIParams): Promise<any> {
  const finalBody = {
    network: body.network,
    srcToken: body.srcToken,
    srcDecimals: body.srcDecimals,
    srcAmount: body.srcAmount,
    destToken: body.destToken,
    destDecimals: body.destDecimals,
    destAmount: body.destAmount,
    side: body.side,
    priceRoute: body,
    userAddress: "0xee13C86EE4eb1EC3a05E2cc3AB70576F31666b3b",
  };

  const transactionsUrl =
    "https://apiv5.paraswap.io/transactions/137?ignoreChecks=true";

  const req = await fetch(transactionsUrl, {
    method: "POST",
    body: JSON.stringify(finalBody),
    headers: { "Content-Type": "application/json" },
  });

  return await req.json();
}

export async function getParaswapFullData(
  sellToken: Asset,
  buyToken: Asset,
  sellAmount: string,
  exchangeList: Exchange[] = exchanges
): Promise<Route[]> {
  const params = { sellToken, buyToken, sellAmount };
  const data = await useLimiter(limiterParaswap, callParaswapFullAPI, params);

  if (data.error !== undefined) {
    throw new Error(`Paraswap API returned an error: ${JSON.stringify(data)}`);
  }

  const paraswapAddress = data.priceRoute.contractAddress;
  const approveAddress = data.priceRoute.tokenTransferProxy;

  const txData = await useLimiter(limiterParaswap, callParaswapFullTxAPI, {
    body: data.priceRoute,
  });

  return [
    {
      fraction: 1,
      exchange: new Paraswap(),
      fromToken: sellToken.address,
      toToken: buyToken.address,
      params: {
        paraswapAddress,
        approveAddress,
        data: txData.data,
      } as ParaswapFullParams,
    },
  ];
}
