import { BigNumberish, formatUnits } from "ethers";

export function getAmount({
  amount,
  decimals,
}: {
  amount: BigNumberish;
  decimals: number;
}): number {
  return Number(formatUnits(amount, decimals));
}
