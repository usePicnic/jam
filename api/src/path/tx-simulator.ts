import {
  Contract,
  JsonRpcProvider,
  Provider,
  ethers,
  parseUnits,
} from "ethers";
import { Exchange, ExchangeParams, exchanges } from "./exchanges";
import { Asset } from "../transaction/types";
import { Route, getAggregatorResults } from "./apis/api";

async function simulateTransaction(
  provider: JsonRpcProvider,
  callData: any,
  stateOverrides: any
): Promise<string> {
  return await provider.send("eth_call", [callData, "latest", stateOverrides]);
}

async function processTx(
  chainId: number,
  route: Route[],
  sellAsset: Asset,
  amountIn: string,
  buyToken: string
): Promise<string> {
  const provider = new JsonRpcProvider(
    `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`
  );

  const [bridgeAddresses, encodedCalls] = getParams(chainId, route);

  const txSimulator = getTxSimulatorContract(provider) as Contract;
  const txSimulatorData =
    await txSimulator.populateTransaction.simulatePicnicTx(
      [[sellAsset.address], [amountIn]],
      bridgeAddresses,
      encodedCalls,
      buyToken
    );

  const from = "0x6D763ee17cEA70cB1026Fa0F272dd620546A9B9F";

  const stateOverrides = generateTokenApprovalStateDiff(
    sellAsset,
    from,
    txSimulator.address
  );

  const callData = {
    from: from,
    to: txSimulator.address,
    data: txSimulatorData.data,
  };

  try {
    return await simulateTransaction(provider, callData, stateOverrides);
  } catch (e) {
    const provider = new ethers.providers.JsonRpcProvider(
      `https://matic.getblock.io/${process.env.GETBLOCK_KEY}/mainnet/`
    );
    return await simulateTransaction(provider, callData, stateOverrides);
  }
}

export async function simulateTxFromAggResults({
  chainId,
  aggResults,
  sellAsset,
  buyToken,
  sellAmount,
}: {
  chainId: number;
  aggResults: any;
  sellAsset: Asset;
  buyToken: string;
  sellAmount: string;
}): Promise<string[]> {
  const txPromises = Object.keys(aggResults).map(async (key) => {
    try {
      const result = await processTx(
        chainId,
        aggResults[key],
        sellAsset,
        sellAmount,
        buyToken
      );
      if (result === "0x") {
        return "-0x1";
      }
      return result;
    } catch (e) {
      if (e.message.includes("Asset allowSlot or balanceSlot are undefined")) {
        throw Error(e.message);
      }

      console.error("Error during transaction simulation", { error: e });
      return "-0x1";
    }
  });

  return await Promise.all(txPromises);
}

export function pickWinnerRoute(aggResults: any, simulatedTxs: string[]) {
  let maxIndex = -1;
  let maxValue = BigInt(0);

  const aggKeys = Object.keys(aggResults);
  simulatedTxs.map((x, i) => {
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

  // TODO: enable simulation
  // const simulatedTxs = await simulateTxFromAggResults({
  //   chainId,
  //   aggResults,
  //   sellAsset: sellToken,
  //   buyToken: buyToken.address,
  //   sellAmount,
  // });

  // const winnerRoute = pickWinnerRoute(aggResults, simulatedTxs);

  // TODO: Remove this check; pickWinnerRoute does it
  if (Object.keys(aggResults).length == 0) {
    throw Error("simulateAndChooseRoute: winnerRoute is empty");
  }

  const winnerRoute = aggResults[Object.keys(aggResults)[0]];

  console.log({ winnerRoute });

  return winnerRoute;
}

function getParams(
  network: Network,
  sampleRoute: Route[],
  bridgeAddresses: string[] = [],
  encodedCalls: string[] = []
): any[] {
  sampleRoute.map((route) => {
    const contract = network.contracts[route.exchange.contractName];
    const address = contract.address;
    const encodedCall = getEncodedCall(contract, route);

    encodedCalls.push(encodedCall);
    bridgeAddresses.push(address);
  });
  return [bridgeAddresses, encodedCalls];
}

function getEncodedCall(contract: PicnicContract, route: Route): string {
  return generateBridgeEncodedCall(contract, route);
}

export function getTxSimulatorContract(provider: Provider): Contract | null {
  const abi = [
    // Write Functions
    "function simulatePicnicTx(tuple(address[],uint256[]),address[],bytes[],address) payable external returns (uint256)",
  ];

  const address = "0x677FadB67fa8ECd7536886e119447bC36BA94481";

  // eslint-disable-next-line react-hooks/rules-of-hooks

  const c = new Contract(address, abi, provider);
  return c;
}
