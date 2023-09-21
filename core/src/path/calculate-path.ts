import { parseUnits } from "ethers";
import { simulateAndChooseRoute } from "./tx-simulator";
import { AssetWithPrice } from "../transaction/types";
import { Route } from "./apis/api";

export async function calculatePath({
  chainId,
  sellToken,
  buyToken,
  swapValue,
}: {
  chainId: number;
  sellToken: AssetWithPrice;
  buyToken: AssetWithPrice;
  swapValue: number;
}): Promise<Route[]> {
  const amount = swapValue / sellToken.price;

  const stringAmount = amount.toFixed(sellToken.decimals);
  const amountStr = parseUnits(stringAmount, sellToken.decimals).toString();

  console.log({ amountStr });

  const winnerRoute = await simulateAndChooseRoute({
    chainId,
    sellToken,
    buyToken,
    sellAmount: amountStr,
  });
  console.log("winnerRoute", winnerRoute);
  return winnerRoute;
}
