import { parseUnits } from "ethers";
import { Route, simulateAndChooseRoute } from "./tx-simulator";
import { Asset } from "../transaction/types";

export async function calculatePath({
  chainId,
  sellToken,
  buyToken,
  swapValue,
}: {
  chainId: number;
  sellToken: Asset;
  buyToken: Asset;
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
