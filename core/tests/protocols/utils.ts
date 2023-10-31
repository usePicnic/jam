import { AssetStore, generateTransaction, loadConfig } from "core";
import { simulateRouterOperation } from "core/src/path/tx-simulator";
import { getProvider } from "core/src/utils/get-provider";

export async function simulateSingleAssetToSingleAsset({
  chainId,
  inputAssetId,
  outputAssetId,
  amountIn,
}: {
  chainId: number;
  inputAssetId: string;
  outputAssetId: string;
  amountIn: string;
}) {
  const assetStore = new AssetStore();
  const config = await loadConfig();
  const provider = await getProvider({ chainId: 137 });

  const routerOperation = await generateTransaction({
    inputAllocation: [{ assetId: inputAssetId, amountStr: amountIn }],
    outputAllocation: [{ assetId: outputAssetId, fraction: 1.0 }],
    assetStore,
    chainId,
    walletAddress: config.networks[chainId].routerSimulatorAddress,
  });

  const result = await simulateRouterOperation({
    chainId,
    routerOperation,
    provider,
    sellAsset: assetStore.getAssetById(inputAssetId),
    amountIn,
    buyAsset: assetStore.getAssetById(outputAssetId),
  });

  console.dir(
    {
      encodedTransactionData: routerOperation.getEncodedTransactionData(),
      result,
    },
    { depth: null, maxStringLength: null }
  );

  return result;
}
