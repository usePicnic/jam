import { formatUnits } from "ethers";
import { Asset } from "../transaction/types";
import { limiterParaswap, useLimiter } from "./use-limiter";
import { get0xPrice } from "./zero-x";
import fetch from "node-fetch";

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

export async function getParaswapPrice({
  sellToken,
  buyToken,
  sellAmount,
  exchangeNames = "",
}: {
  sellToken: Asset;
  buyToken: Asset;
  sellAmount: string;
  exchangeNames?: string;
}): Promise<number> {
  if (buyToken.address == sellToken.address) {
    return 1;
  }

  const params = { sellToken: sellToken.address, buyToken, sellAmount };
  const data = await useLimiter(limiterParaswap, callParaswapFullAPI, params);

  if (data.priceRoute === undefined || data.priceRoute.maxImpactReached) {
    return await get0xPrice({ sellToken, buyToken, sellAmount });
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
