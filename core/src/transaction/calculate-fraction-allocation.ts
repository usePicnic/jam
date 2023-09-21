import { formatUnits } from "ethers";
import {
  AbsoluteAllocation,
  AssetStore,
  FractionAllocation,
} from "transaction/types";

export function calculateFractionAllocation({
  absoluteAllocation,
  assetStore,
}: {
  absoluteAllocation: AbsoluteAllocation;
  assetStore: AssetStore;
}): { totalValue: number; fractionAllocation: FractionAllocation } {
  const totalValue = absoluteAllocation.reduce((acc, allocation) => {
    const asset = assetStore.getFullAssetById(allocation.assetId);
    const value =
      Number(formatUnits(allocation.amountStr, asset.decimals)) * asset.price;
    return acc + value;
  }, 0);

  const fractionAllocation: FractionAllocation = absoluteAllocation.map(
    (allocation) => {
      const asset = assetStore.getFullAssetById(allocation.assetId);
      const value =
        Number(formatUnits(allocation.amountStr, asset.decimals)) * asset.price;

      return {
        assetId: allocation.assetId,
        fraction: value / totalValue,
      };
    }
  );

  return { totalValue, fractionAllocation };
}
