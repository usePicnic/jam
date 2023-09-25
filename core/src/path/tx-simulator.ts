import { BigNumberish, Contract, JsonRpcProvider, Provider } from "ethers";
import { Exchange, exchanges } from "./exchanges";
import { Asset, RouterOperation } from "../transaction/types";
import { Route, RouteAggregator, getAggregatorResults } from "./apis/api";
import { RouterSimulator } from "../interfaces";
import { loadConfig } from "../config/load-config";
import { generateTokenApprovalStateDiff } from "../simulation/generate-token-approval-state-diff";

async function processTx({
  chainId,
  routes,
  sellAsset,
  amountIn,
  buyToken,
}: {
  chainId: number;
  routes: Route[];
  sellAsset: Asset;
  amountIn: string;
  buyToken: string;
}): Promise<string> {
  const provider = new JsonRpcProvider(
    `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`
  );

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
  const routerTransactionData = routerOperation.getTransactionData();

  const populatedTx = await routerSimulator.simulateJamTx.populateTransaction(
    config.networks[chainId].routerAddress,
    sellAsset.address,
    amountIn,
    buyToken,
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

  let ret;

  try {
    ret = await provider.send("eth_call", [callData, "latest", stateOverrides]);
  } catch (e) {
    console.error("Failed to simulate transaction", {
      callData,
      stateOverrides: JSON.stringify(stateOverrides),
    });
    return "0x";
  }

  return ret;

  // try {
  // } catch (e) {
  //   const provider = new ethers.providers.JsonRpcProvider(
  //     `https://matic.getblock.io/${process.env.GETBLOCK_KEY}/mainnet/`
  //   );
  //   return await simulateTransaction(provider, callData, stateOverrides);
  // }
}

export async function simulateTxFromAggResults({
  chainId,
  aggResults,
  sellAsset,
  buyToken,
  sellAmount,
}: {
  chainId: number;
  aggResults: RouteAggregator;
  sellAsset: Asset;
  buyToken: string;
  sellAmount: string;
}): Promise<(BigNumberish | null)[]> {
  const txPromises = Object.keys(aggResults).map(async (key) => {
    try {
      const result = await processTx({
        chainId,
        routes: aggResults[key],
        sellAsset,
        amountIn: sellAmount,
        buyToken,
      });
      if (result === "0x") {
        return null;
      }
      return result;
    } catch (e) {
      if (e.message.includes("Asset allowSlot or balanceSlot are undefined")) {
        throw Error(e.message);
      }

      console.error("Error during transaction simulation", { error: e });
      return null;
    }
  });

  return await Promise.all(txPromises);
}

export function pickWinnerRoute(
  aggResults: RouteAggregator,
  simulatedTxs: string[]
) {
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
  console.log("pickWinnerRoute: winnerAgg", winnerAgg);
  return aggResults[winnerAgg];
}

export async function simulateAndChooseRoute({
  chainId,
  sellToken,
  buyToken,
  sellAmount,
  exchangeList = exchanges,
  aggregators = [
    "zeroXFull",
    "paraswapFull",
    "kyber",
    // "oneinch",
  ],
}: {
  chainId: number;
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

  console.log({ aggResults: JSON.stringify(aggResults) });

  if (Object.keys(aggResults).length == 0) {
    throw Error("simulateAndChooseRoute: aggResults is empty");
  }

  const simulatedTxs = await simulateTxFromAggResults({
    chainId,
    aggResults,
    sellAsset: sellToken,
    buyToken: buyToken.address,
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
