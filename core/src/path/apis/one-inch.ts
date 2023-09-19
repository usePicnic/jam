import { Exchange, exchanges, OneInch, OneInchParams } from "../exchanges";
import { ParamsAPI, Route } from "./api";
import { ONEINCH_ABI } from "./helpers/one-inch-abi";
import { limiterOneInch, useLimiter } from "../../external-apis/use-limiter";
import { Asset } from "../../transaction/types";
import { Contract, formatUnits } from "ethers";

export async function callOneInchAPI({
  buyToken,
  sellToken,
  sellAmount,
  exchangeNames,
}: ParamsAPI): Promise<any> {
  //const fromAddress = "0x13BE18cEe264d1bda8eD618A4b5d836Ceca871Ea";
  const fromAddress = "0xee13C86EE4eb1EC3a05E2cc3AB70576F31666b3b";
  const chainId = 137;

  const url = `https://api.1inch.io/v5.0/${chainId}/swap?fromTokenAddress=${sellToken.address}&toTokenAddress=${buyToken.address}&amount=${sellAmount}&fromAddress=${fromAddress}&slippage=10&disableEstimate=true&usePatching=true`;
  const req = await fetch(url);
  const data = await req.json();
  console.log(
    `API response - 1Inch - sellToken: ${sellToken} buyToken: ${buyToken}`,
    { url, data }
  );

  return data;
}

export async function getOneInchData(
  sellToken: Asset,
  buyToken: Asset,
  sellAmount: string,
  exchangeList: Exchange[] = exchanges
): Promise<Route[]> {
  const params = { sellToken, buyToken, sellAmount };
  const data = await useLimiter(limiterOneInch, callOneInchAPI, params);

  const oneInchAddress = data.tx.to;

  const contract = new Contract(oneInchAddress, ONEINCH_ABI);
  const decodedTx = await contract.interface.parseTransaction({
    data: data.tx.data,
  });

  return [
    {
      fraction: 1,
      exchange: new OneInch(),
      fromToken: sellToken.address,
      toToken: buyToken.address,
      params: {
        oneInchAddress,
        executor: decodedTx.args.executor,
        desc: decodedTx.args.desc,
        permit: decodedTx.args.permit,
        data: decodedTx.args.data,
      } as OneInchParams,
    },
  ];
}

export async function getOneInchAmount(
  sellToken: string,
  buyToken: string,
  sellAmount: string,
  exchangeList: Exchange[] = exchanges
): Promise<string> {
  const params = { sellToken, buyToken, sellAmount };
  const data = await useLimiter(limiterOneInch, callOneInchAPI, params);
  if (data.toTokenAmount !== undefined) {
    return data.toTokenAmount;
  } else {
    return "0";
  }
}

export async function get1InchPrice(
  sellToken: string,
  buyToken: string,
  sellAmount: string,
  exchangeNames: Exchange[] = exchanges
): Promise<number> {
  const params = { sellToken, buyToken, sellAmount };
  const data = await useLimiter(limiterOneInch, callOneInchAPI, params);

  if (data.toTokenAmount !== undefined) {
    const fromAmount = formatUnits(
      data.fromTokenAmount,
      data.fromToken.decimals
    );

    const toAmount = formatUnits(data.toTokenAmount, data.toToken.decimals);

    return Number(fromAmount) / Number(toAmount);
  } else {
    return 0;
  }
}
