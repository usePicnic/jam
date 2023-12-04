import { AssetStore, generateTransaction, loadConfig } from "core";
import { simulateRouterOperation } from "core/src/path/tx-simulator";
import {
  AbsoluteAllocation,
  FractionAllocation,
} from "core/src/transaction/types";
import { getProvider } from "core/src/utils/get-provider";

export async function simulateRouterOperationHelper({
  chainId,
  inputAllocation,
  outputAllocation,
}: {
  chainId: number;
  inputAllocation: AbsoluteAllocation;
  outputAllocation: FractionAllocation;
}) {
  const assetStore = new AssetStore();
  const config = await loadConfig();
  const provider = await getProvider({ chainId: 137 });

  const routerOperation = await generateTransaction({
    inputAllocation,
    outputAllocation,
    assetStore,
    chainId,
    walletAddress: config.networks[chainId].routerSimulatorAddress,
  });

  console.dir({ routerOperation }, { depth: null, maxStringLength: null });

  const result = await simulateRouterOperation({
    chainId,
    routerOperation,
    provider,
    sellAssets: inputAllocation.map((i) => assetStore.getAssetById(i.assetId)),
    amountsIn: inputAllocation.map((i) => i.amountStr),
    buyAssets: outputAllocation.map((a) => assetStore.getAssetById(a.assetId)),
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
