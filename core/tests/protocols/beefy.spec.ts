import { test } from "vitest";
import { generateTransaction } from "core/src/transaction/generate-transaction";
import { AssetStore } from "core/src/transaction/types";
import { loadConfig } from "core/src/config/load-config";
import { simulateRouterOperation } from "core/src/path/tx-simulator";
import { getProvider } from "core/src/utils/get-provider";

test("generateTransaction: USDC to QUICK (beefyDeposit)", async () => {
  const assetStore = new AssetStore();
  const config = await loadConfig();
  const provider = await getProvider({ chainId: 137 });

  const routerOperation = await generateTransaction({
    inputAllocation: [
      {
        assetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
        amountStr: "1000000000",
      },
    ],
    outputAllocation: [
      {
        assetId: "37819023-9c6a-4848-8cf5-24a95350f001",
        fraction: 1.0,
      },
    ],
    assetStore,
    chainId: 137,
    walletAddress: config.networks[137].routerSimulatorAddress,
  });

  const result = await simulateRouterOperation({
    chainId: 137,
    routerOperation,
    provider,
    sellAsset: assetStore.getAssetById("e251ecf6-48c2-4538-afcd-fbb92424054d"),
    amountIn: "1000000000",
    buyAsset: assetStore.getAssetById("37819023-9c6a-4848-8cf5-24a95350f001"),
  });

  console.dir(
    {
      encodedTransactionData: routerOperation.getEncodedTransactionData(),
      result,
    },
    { depth: null, maxStringLength: null }
  );
});
