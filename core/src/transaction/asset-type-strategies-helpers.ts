import { BigNumberish, Contract, Provider, formatUnits } from "ethers";
import { Asset, AssetStore } from "./types";
import { RequestTree } from "./get-prices";
import { getPrice } from "./asset-type-strategies";

export function getAmount({
  amount,
  decimals,
}: {
  amount: BigNumberish;
  decimals: number;
}): number {
  console.log({ amount, decimals });
  return Number(formatUnits(amount, decimals));
}
