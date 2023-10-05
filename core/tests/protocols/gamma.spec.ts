import { test } from "vitest";
import { generateTransaction } from "core/src/transaction/generate-transaction";
import { AssetStore } from "core/src/transaction/types";
import { loadConfig } from "core/src/config/load-config";
import { simulateRouterOperation } from "core/src/path/tx-simulator";
import { getProvider } from "core/src/utils/get-provider";

test("generateTransaction: USDC to USDC/WETH (gammaDeposit)", async () => {
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
        assetId: "8da84d12-9e9d-4c04-831d-7b93f1cd822f",
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
    buyAsset: assetStore.getAssetById("8da84d12-9e9d-4c04-831d-7b93f1cd822f"),
  });

  console.dir(
    {
      encodedTransactionData: routerOperation.getEncodedTransactionData(),
      result,
    },
    { depth: null, maxStringLength: null }
  );
});

test("generateTransaction: USDC to WMATIC/WETH (gammaDeposit)", async () => {
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
        assetId: "3c42b7d3-555b-41a4-96b6-ce4fadd62f83",
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
    buyAsset: assetStore.getAssetById("3c42b7d3-555b-41a4-96b6-ce4fadd62f83"),
  });

  console.dir(
    {
      encodedTransactionData: routerOperation.getEncodedTransactionData(),
      result,
    },
    { depth: null, maxStringLength: null }
  );
});

test("generateTransaction: USDC to WMATIC/MaticX (gammaDeposit)", async () => {
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
        assetId: "5a5cd640-b972-43b6-9bb2-24e6711ab1db",
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
    buyAsset: assetStore.getAssetById("5a5cd640-b972-43b6-9bb2-24e6711ab1db"),
  });

  console.dir(
    {
      encodedTransactionData: routerOperation.getEncodedTransactionData(),
      result,
    },
    { depth: null, maxStringLength: null }
  );
});

test("generateTransaction: WMATIC/MaticX (gammaDeposit) to USDC", async () => {
  const assetStore = new AssetStore();
  const config = await loadConfig();
  const provider = await getProvider({ chainId: 137 });

  const routerOperation = await generateTransaction({
    inputAllocation: [
      {
        assetId: "5a5cd640-b972-43b6-9bb2-24e6711ab1db",
        amountStr: "1000000000000000000000",
      },
    ],
    outputAllocation: [
      {
        assetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
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
    sellAsset: assetStore.getAssetById("5a5cd640-b972-43b6-9bb2-24e6711ab1db"),
    amountIn: "1000000000000000000000",
    buyAsset: assetStore.getAssetById("e251ecf6-48c2-4538-afcd-fbb92424054d"),
  });

  console.dir(
    {
      encodedTransactionData: routerOperation.getEncodedTransactionData(),
      result,
    },
    { depth: null, maxStringLength: null }
  );
});

test("generateTransaction: WMATIC/WETH (gammaDeposit) to USDC", async () => {
  const assetStore = new AssetStore();
  const config = await loadConfig();
  const provider = await getProvider({ chainId: 137 });

  const routerOperation = await generateTransaction({
    inputAllocation: [
      {
        assetId: "3c42b7d3-555b-41a4-96b6-ce4fadd62f83",
        amountStr: "1000000000000000000",
      },
    ],
    outputAllocation: [
      {
        assetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
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
    sellAsset: assetStore.getAssetById("3c42b7d3-555b-41a4-96b6-ce4fadd62f83"),
    amountIn: "1000000000000000000",
    buyAsset: assetStore.getAssetById("e251ecf6-48c2-4538-afcd-fbb92424054d"),
  });

  console.dir(
    {
      encodedTransactionData: routerOperation.getEncodedTransactionData(),
      result,
    },
    { depth: null, maxStringLength: null }
  );
});

test("generateTransaction: USDC/WETH (gammaDeposit) to USDC", async () => {
  const assetStore = new AssetStore();
  const config = await loadConfig();
  const provider = await getProvider({ chainId: 137 });

  const routerOperation = await generateTransaction({
    inputAllocation: [
      {
        assetId: "8da84d12-9e9d-4c04-831d-7b93f1cd822f",
        amountStr: "1000000000000000000",
      },
    ],
    outputAllocation: [
      {
        assetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
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
    sellAsset: assetStore.getAssetById("8da84d12-9e9d-4c04-831d-7b93f1cd822f"),
    amountIn: "1000000000000000000",
    buyAsset: assetStore.getAssetById("e251ecf6-48c2-4538-afcd-fbb92424054d"),
  });

  console.dir(
    {
      encodedTransactionData: routerOperation.getEncodedTransactionData(),
      result,
    },
    { depth: null, maxStringLength: null }
  );
});
