import { BigNumberish, Contract, JsonRpcProvider, Provider } from "ethers";
import { Exchange, exchanges } from "./exchanges";
import { Asset, RouterOperation } from "../transaction/types";
import { Route, RouteAggregator, getAggregatorResults } from "./apis/api";
import { RouterSimulator } from "../interfaces";
import { loadConfig } from "../config/load-config";
import { generateTokenApprovalStateDiff } from "../simulation/generate-token-approval-state-diff";

export async function simulateAssetSwapTransaction({
  chainId,
  routes,
  provider,
  sellAsset,
  amountIn,
  buyAsset,
}: {
  chainId: number;
  routes: Route[];
  provider: Provider;
  sellAsset: Asset;
  amountIn: string;
  buyAsset: Asset;
}): Promise<BigNumberish | null> {
  const config = await loadConfig();
  const routerOperation = await getParams({
    chainId,
    walletAddress: config.networks[chainId].routerSimulatorAddress,
    sellAsset,
    amountIn,
    provider,
    routes,
  });

  // const txSimulator = getTxSimulatorContract(provider) as Contract;
  // const txSimulatorData =
  //   await txSimulator.populateTransaction.simulatePicnicTx(
  //     [[sellAsset.address], [amountIn]],
  //     bridgeAddresses,
  //     encodedCalls,
  //     buyToken
  //   );

  const routerSimulator = new Contract(
    config.networks[chainId].routerSimulatorAddress,
    RouterSimulator,
    provider
  );
  const routerTransactionData = routerOperation.getTransactionDetails();

  const populatedTx = await routerSimulator.simulateJamTx.populateTransaction(
    config.networks[chainId].routerAddress,
    sellAsset.address,
    amountIn,
    buyAsset.address,
    routerTransactionData.steps,
    routerTransactionData.stores
  );

  const from = "0x6D763ee17cEA70cB1026Fa0F272dd620546A9B9F";

  const stateOverrides = generateTokenApprovalStateDiff(
    sellAsset,
    from,
    config.networks[chainId].routerSimulatorAddress
  );

  const callData = {
    from: from,
    to: config.networks[chainId].routerSimulatorAddress,
    data: populatedTx.data,
  };

  try {
    const ret = await (provider as any).send("eth_call", [
      callData,
      "latest",
      stateOverrides,
    ]);
    return BigInt(ret);
  } catch (e) {
    console.error("Failed to simulate transaction");
    console.dir(
      {
        callData,
        stateOverrides,
      },
      { depth: null, maxStringLength: null }
    );
    return null;
  }

  // try {
  // } catch (e) {
  //   const provider = new ethers.providers.JsonRpcProvider(
  //     `https://matic.getblock.io/${process.env.GETBLOCK_KEY}/mainnet/`
  //   );
  //   return await simulateTransaction(provider, callData, stateOverrides);
  // }
}

export async function simulateRouterOperation({
  chainId,
  routerOperation,
  provider,
  sellAsset,
  amountIn,
  buyAsset,
}: {
  chainId: number;
  routerOperation: RouterOperation;
  provider: Provider;
  sellAsset: Asset;
  amountIn: string;
  buyAsset: Asset;
}): Promise<BigNumberish | null> {
  const config = await loadConfig();

  // const txSimulator = getTxSimulatorContract(provider) as Contract;
  // const txSimulatorData =
  //   await txSimulator.populateTransaction.simulatePicnicTx(
  //     [[sellAsset.address], [amountIn]],
  //     bridgeAddresses,
  //     encodedCalls,
  //     buyToken
  //   );

  const routerSimulator = new Contract(
    config.networks[chainId].routerSimulatorAddress,
    RouterSimulator,
    provider
  );
  const routerTransactionData = routerOperation.getTransactionDetails();

  const populatedTx = await routerSimulator.simulateJamTx.populateTransaction(
    config.networks[chainId].routerAddress,
    sellAsset.address,
    amountIn,
    buyAsset.address,
    routerTransactionData.steps,
    routerTransactionData.stores
  );

  const from = "0x6D763ee17cEA70cB1026Fa0F272dd620546A9B9F";

  const stateOverrides = generateTokenApprovalStateDiff(
    sellAsset,
    from,
    config.networks[chainId].routerSimulatorAddress
  );

  const callData = {
    from: from,
    to: config.networks[chainId].routerSimulatorAddress,
    data: populatedTx.data,
  };

  console.dir(
    {
      callData,
      stateOverrides,
    },
    { depth: null, maxStringLength: null }
  );

  try {
    const ret = await (provider as any).send("eth_call", [
      callData,
      "latest",
      stateOverrides,
    ]);
    return BigInt(ret);
  } catch (e) {
    console.error("Failed to simulate transaction");
    throw e;
  }

  // try {
  // } catch (e) {
  //   const provider = new ethers.providers.JsonRpcProvider(
  //     `https://matic.getblock.io/${process.env.GETBLOCK_KEY}/mainnet/`
  //   );
  //   return await simulateTransaction(provider, callData, stateOverrides);
  // }
}

async function simulateTxFromAggResults({
  chainId,
  provider,
  aggResults,
  sellAsset,
  buyAsset,
  sellAmount,
}: {
  chainId: number;
  provider: Provider;
  aggResults: RouteAggregator;
  sellAsset: Asset;
  buyAsset: Asset;
  sellAmount: string;
}): Promise<(BigNumberish | null)[]> {
  const txPromises = Object.keys(aggResults).map(async (key) => {
    const result = await simulateAssetSwapTransaction({
      chainId,
      provider,
      routes: aggResults[key],
      sellAsset,
      amountIn: sellAmount,
      buyAsset,
    });
    return result;
  });

  return await Promise.all(txPromises);
}

function pickWinnerRoute(
  aggResults: RouteAggregator,
  simulatedTxs: (BigNumberish | null)[]
): Route[] {
  let maxIndex = -1;
  let maxValue = BigInt(0);

  const aggKeys = Object.keys(aggResults);
  simulatedTxs.map((x, i) => {
    if (x === null) {
      return;
    }

    const bn = BigInt(x);
    console.log("pickWinnerRoute: Simulated amount for", {
      key: aggKeys[i],
      amount: bn.toString(),
    });
    if (bn > maxValue) {
      maxIndex = i;
      maxValue = bn;
    }
  });

  if (maxIndex == -1) {
    throw Error(
      "pickWinnerRoute: None of the generated routes were valid, please check individual errors."
    );
  }

  const winnerAgg = aggKeys[maxIndex];
  console.log("pickWinnerRoute", { winnerAgg });
  return aggResults[winnerAgg];
}

export async function simulateAndChooseRoute({
  chainId,
  provider,
  sellToken,
  buyToken,
  sellAmount,
  exchangeList = exchanges,
  aggregators = [
    "zeroXFull",
    "paraswapFull",
    // "kyber",
    // "oneinch",
  ],
}: {
  chainId: number;
  provider: Provider;
  sellToken: Asset;
  buyToken: Asset;
  sellAmount: string;
  exchangeList?: Exchange[];
  aggregators?: string[];
}): Promise<Route[]> {
  if (sellAmount == "0") {
    throw Error("simulateAndChooseRoute: sellAmount is 0");
  }

  const aggResults = await getAggregatorResults({
    sellToken,
    buyToken,
    sellAmount,
    exchangeList,
    aggregators,
  });

  console.log(`aggResults: ${JSON.stringify(aggResults)}`);

  if (Object.keys(aggResults).length == 0) {
    throw Error("simulateAndChooseRoute: aggResults is empty");
  }

  const simulatedTxs = await simulateTxFromAggResults({
    chainId,
    provider,
    aggResults,
    sellAsset: sellToken,
    buyAsset: buyToken,
    sellAmount,
  });

  const winnerRoute = pickWinnerRoute(aggResults, simulatedTxs);

  // TODO: Remove this check; pickWinnerRoute does it
  if (Object.keys(aggResults).length == 0) {
    throw Error("simulateAndChooseRoute: winnerRoute is empty");
  }

  console.log({ winnerRoute });

  return winnerRoute;
}

async function getParams({
  chainId,
  provider,
  sellAsset,
  amountIn,
  walletAddress,
  routes,
}: {
  chainId: number;
  provider: Provider;
  sellAsset: Asset;
  amountIn: string;
  walletAddress: string;
  routes: Route[];
}): Promise<RouterOperation> {
  let routerOperation = new RouterOperation();
  routerOperation.stores.findOrInitializeStoreIdx({
    assetId: sellAsset.id,
    address: sellAsset.address,
    value: amountIn,
  });

  for (const route of routes) {
    routerOperation = await route.exchange.buildSwapOutput({
      chainId,
      walletAddress,
      provider,
      path: route,
      routerOperation,
    });
  }

  return routerOperation;
}
