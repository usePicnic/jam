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

export function getGammaPair({
  provider,
  address,
}: {
  provider: Provider;
  address: string;
}): Contract {
  const abi = [
    // Read-Only Functions
    "function totalSupply() view returns (uint256)",
    "function getBasePosition() view returns (uint128, uint256, uint256)",
    "function getLimitPosition() view returns (uint128, uint256, uint256)",
    "function getTotalAmounts() view returns (uint128, uint256)",
  ];

  return new Contract(address, abi, provider);
}

export function getGammaTVLs({
  asset,
  assetStore,
  requestTree,
}: {
  asset: Asset;
  assetStore: AssetStore;
  requestTree: RequestTree;
}) {
  const linkedAssets = asset.linkedAssets.map(
    (linkedAsset) => assetStore.byId[linkedAsset.assetId]
  );

  return linkedAssets.map((linkedAsset, i) => {
    const amount = requestTree[asset.address].totalAmount[i];
    console.log({ amount123: amount });
    console.log({
      price123: getPrice({ assetStore, asset: linkedAsset, requestTree }),
    });
    return (
      getPrice({ assetStore, asset: linkedAsset, requestTree }) *
      getAmount({ amount, decimals: linkedAsset.decimals })
    );
  });
}
