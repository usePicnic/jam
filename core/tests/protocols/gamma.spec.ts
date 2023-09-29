import { test } from "vitest";
import { generateTransaction } from "src/transaction/generate-transaction";
import { AssetStore } from "src/transaction/types";
import { loadConfig } from "src/config/load-config";
import { simulateRouterOperation } from "src/path/tx-simulator";
import { getProvider } from "src/utils/get-provider";

test("generateTransaction: USDC to DAI/GNS (gammaDeposit)", async () => {
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
        assetId: "2c49e240-99fd-4117-b803-5fa8ad5d1397",
        fraction: 1.0,
      },
    ],
    assetStore,
    chainId: 137,
    walletAddress: config.networks[137].routerSimulatorAddress,
  });

  await simulateRouterOperation({
    chainId: 137,
    routerOperation,
    provider,
    sellAsset: assetStore.getAssetById("e251ecf6-48c2-4538-afcd-fbb92424054d"),
    amountIn: "1000000000",
    buyAsset: assetStore.getAssetById("2c49e240-99fd-4117-b803-5fa8ad5d1397"),
  });

  console.dir(
    { encodedTransactionData: routerOperation.getEncodedTransactionData() },
    { depth: null, maxStringLength: null }
  );
});
