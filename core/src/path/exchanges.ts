const paramDict = {
  IUniswapV2: getUniswapV2Params,
  IBalancerSwap: getBalancerParams,
  IKyberSwap: getKyberDMMParams,
  ICurveSwap: getCurveParams,
  ICurveV2Swap: getCurveV2Params,
  IUniswapV3Swap: getUniswapV3Params,
  IDodoV2Swap: getDodoV2Params,
};

export abstract class Exchange {
  abstract name: string;
  abstract name0x: string;
  abstract nameParaswap: string;
  abstract nameKyber: string;
  abstract contractName: string;
  abstract dexInterface: DEXInterface;

  getParams(aggregator: Aggregator, data: any): ExchangeParams {
    return paramDict[this.dexInterface](aggregator, data);
  }
}
export class OneInch extends Exchange {
  name = "OneInch";
  name0x = "";
  nameParaswap = "";
  nameKyber = "";
  contractName = "OneInchBridge";
  dexInterface = "IOneInchBridge" as DEXInterface;
}

export class Paraswap extends Exchange {
  name = "Paraswap";
  name0x = "";
  nameParaswap = "";
  nameKyber = "";
  contractName = "ParaswapBridge";
  dexInterface = "IParaswapBridge" as DEXInterface;
}

export class ZeroX extends Exchange {
  name = "ZeroX";
  name0x = "";
  nameParaswap = "";
  nameKyber = "";
  contractName = "ZeroXBridge";
  dexInterface = "IZeroXBridge" as DEXInterface;
}

class QuickSwap extends Exchange {
  name = "QuickSwap";
  name0x = "QuickSwap";
  nameParaswap = "QuickSwap";
  nameKyber = "quickswap";
  contractName = "QuickswapSwapBridge";
  dexInterface = "IUniswapV2" as DEXInterface;
}

class SushiSwap extends Exchange {
  name = "SushiSwap";
  name0x = "SushiSwap";
  nameParaswap = "SushiSwap";
  nameKyber = "sushiswap";
  contractName = "SushiSwapBridge";
  dexInterface = "IUniswapV2" as DEXInterface;
}

class ApeSwap extends Exchange {
  name = "ApeSwap";
  name0x = "ApeSwap";
  nameParaswap = "ApeSwap";
  nameKyber = "apeswap";
  contractName = "ApeSwapBridge";
  dexInterface = "IUniswapV2" as DEXInterface;
}

class Dfyn extends Exchange {
  name = "Dfyn";
  name0x = "Dfyn";
  nameParaswap = "Dfyn";
  nameKyber = "dfyn";
  contractName = "DfynSwapBridge";
  dexInterface = "IUniswapV2" as DEXInterface;
}

class MMFSwap extends Exchange {
  name = "MMFSwap";
  name0x = "";
  nameParaswap = "";
  nameKyber = "mmf";
  contractName = "MMFSwapBridge";
  dexInterface = "IUniswapV2" as DEXInterface;
}

class MeshSwap extends Exchange {
  name = "MeshSwap";
  name0x = "MeshSwap";
  nameParaswap = "";
  nameKyber = "";
  contractName = "MeshSwapBridge";
  dexInterface = "IUniswapV2" as DEXInterface;
}

class DodoV2 extends Exchange {
  name = "DODO_V2";
  name0x = "DODO_V2";
  nameParaswap = "DODOV2";
  nameKyber = "";
  contractName = "DodoV2SwapBridge";
  dexInterface = "IDodoV2Swap" as DEXInterface;
}

export class BalancerV2 extends Exchange {
  name = "Balancer_V2";
  name0x = "Balancer_V2";
  nameParaswap = "BalancerV2";
  nameKyber = "";
  contractName = "BalancerSwapBridge";
  dexInterface = "IBalancerSwap" as DEXInterface;
}

class KyberDMM extends Exchange {
  name = "KyberDMM";
  name0x = "KyberDMM";
  nameParaswap = "KyberDmm";
  nameKyber = "";
  contractName = "KyberSwapBridge";
  dexInterface = "IKyberSwap" as DEXInterface;
}

export class Curve extends Exchange {
  name = "Curve";
  name0x = "Curve";
  nameParaswap = "Curve";
  nameKyber = "curve";
  contractName = "CurveSwapBridge";
  dexInterface = "ICurveSwap" as DEXInterface;
}

class CurveV2 extends Exchange {
  name = "Curve_V2";
  name0x = "Curve_V2";
  nameParaswap = "CurveV2";
  nameKyber = "";
  contractName = "CurveSwapBridge";
  dexInterface = "ICurveV2Swap" as DEXInterface;
}

class UniswapV3 extends Exchange {
  name = "Uniswap_V3";
  name0x = "Uniswap_V3";
  nameParaswap = "UniswapV3";
  nameKyber = "uniswapv3";
  contractName = "UniswapV3SwapBridge";
  dexInterface = "IUniswapV3Swap" as DEXInterface;
}

export class Jarvis extends Exchange {
  name = "Jarvis";
  name0x = "";
  nameParaswap = "";
  nameKyber = "";
  contractName = "JarvisV6MintBridge";
  dexInterface = "IJarvisV6Mint" as DEXInterface;
}

export type Aggregator = "0x" | "paraswap" | "kyber";

export type DEXInterface =
  | "IUniswapV2"
  | "ICurveSwap"
  | "IBalancerSwap"
  | "IKyberSwap"
  | "IUniswapV3"
  | "IOneInchBridge";

export interface OneInchParams {
  oneInchAddress: string;
  executor: string;
  desc: any;
  permit: string;
  data: string;
}

export interface ParaswapFullParams {
  paraswapAddress: string;
  approveAddress: string;
  data: string;
}

export interface ZeroXFullParams {
  zeroXAddress: string;
  approveAddress: string;
  data: string;
}

interface UniswapV2Params {
  path: string[];
}

interface BalancerV2Params {
  poolId: string;
  tokenIn: string;
  tokenOut: string;
}

interface JarvisParams {
  poolAddress: string;
  isRedeem: boolean;
}

interface KyberDMMParams {
  poolsPath: string[];
  tokensPath: string[];
}

interface CurveParams {
  poolAddress: string;
  exchangeFunctionSelector: string;
  fromTokenIdx: number;
  toTokenIdx: number;
}

interface UniswapV3Params {
  tokenAddressPath: string[];
  uniswapPath?: string;
  pool?: string;
}

interface DodoV2Params {
  poolAddress: string[];
  directions: number;
}

export interface ExchangeParams {
  path?: string[];
  poolId?: string;
  tokenIn?: string;
  tokenOut?: string;
  poolAddress?: string | string[];
  isRedeem?: boolean;
  poolsPath?: string[];
  tokensPath?: string[];
  exchangeFunctionSelector?: string;
  fromTokenIdx?: number;
  toTokenIdx?: number;
  tokenAddressPath?: string[];
  uniswapPath?: string;
  oneInchAddress?: string;
  executor?: string;
  desc?: any;
  permit?: string;
  data?: string;
  directions?: number;
  pool?: string;
  paraswapAddress?: string;
  approveAddress?: string;
  zeroXAddress?: string;
}

function getUniswapV2Params(
  aggregator: Aggregator,
  data: any
): UniswapV2Params[] {
  if (aggregator == "0x") {
    return [
      {
        path: data.fillData.tokenAddressPath,
      },
    ];
  } else if (aggregator == "paraswap") {
    return [
      {
        path: data.data.path,
      },
    ];
  } else if (aggregator == "kyber") {
    return [
      {
        path: [data.tokenIn, data.tokenOut],
      },
    ];
  } else {
    // raise error if no aggregator found
    throw new Error("No aggregator found");
  }
}

function getBalancerParams(
  aggregator: Aggregator,
  data: any
): BalancerV2Params[] {
  if (aggregator == "0x") {
    // is it possible to actually have more than 1 swap step here? :x
    return data.fillData.swapSteps.map((swapStep) => {
      return {
        poolId: swapStep.poolId,
        tokenIn: data.fillData.assets[swapStep.assetInIndex],
        tokenOut: data.fillData.assets[swapStep.assetOutIndex],
      };
    });
  } else if (aggregator == "paraswap") {
    return [
      {
        poolId: data.data.swaps[0].poolId,
        tokenIn: data.srcToken,
        tokenOut: data.destToken,
      },
    ];
  } else if (aggregator == "kyber") {
    return [
      {
        poolId: data.poolExtra.poolId,
        tokenIn: data.tokenIn,
        tokenOut: data.tokenOut,
      },
    ];
  } else {
    // raise error if no aggregator found
    throw new Error("No aggregator found");
  }
}

function getKyberDMMParams(
  aggregator: Aggregator,
  data: any
): KyberDMMParams[] {
  if (aggregator == "0x") {
    // is it possible to actually have more than 1 swap step here? :x
    return [
      {
        poolsPath: data.fillData.poolsPath,
        tokensPath: data.fillData.tokenAddressPath,
      },
    ];
  } else if (aggregator == "paraswap") {
    return [
      {
        poolsPath: data.poolAddresses,
        tokensPath: data.data.path,
      },
    ];
  } else if (aggregator == "kyber") {
    return [
      {
        poolsPath: [data.pool],
        tokensPath: [data.tokenIn, data.tokenOut],
      },
    ];
  } else {
    // raise error if no aggregator found
    throw new Error("No aggregator found");
  }
}

function getCurveSelector(
  isUnderlyingSwap: boolean,
  isCurveV2: boolean
): string {
  if (isCurveV2) {
    if (isUnderlyingSwap) {
      return "0x65b2489b";
    } else {
      return "0xa6417ed6";
    }
  } else {
    if (isUnderlyingSwap) {
      return "0xa6417ed6";
    } else {
      return "0x65b2489b";
    }
  }
}

function getCurveParams(aggregator: Aggregator, data: any): CurveParams[] {
  if (aggregator == "0x") {
    return [
      {
        poolAddress: data.fillData.pool.poolAddress,
        exchangeFunctionSelector: data.fillData.pool.exchangeFunctionSelector,
        fromTokenIdx: data.fillData.fromTokenIdx,
        toTokenIdx: data.fillData.toTokenIdx,
      },
    ];
  } else if (aggregator == "paraswap") {
    return [
      {
        poolAddress: data.poolAddresses[0],
        exchangeFunctionSelector: getCurveSelector(
          data.data.underlyingSwap,
          false
        ),
        fromTokenIdx: data.data.i,
        toTokenIdx: data.data.j,
      },
    ];
  } else if (aggregator == "kyber") {
    const extra = data.extra ? data.extra : data.poolExtra;
    return [
      {
        poolAddress: data.pool,
        exchangeFunctionSelector: getCurveSelector(extra.underlying, false),
        fromTokenIdx: extra.tokenInIndex,
        toTokenIdx: extra.tokenOutIndex,
      },
    ];
  } else {
    // raise error if no aggregator found
    throw new Error("No aggregator found");
  }
}

function getCurveV2Params(aggregator: Aggregator, data: any): CurveParams[] {
  if (aggregator == "0x") {
    // is it possible to actually have more than 1 swap step here? :x
    return [
      {
        poolAddress: data.fillData.pool.poolAddress,
        exchangeFunctionSelector: data.fillData.pool.exchangeFunctionSelector,
        fromTokenIdx: data.fillData.fromTokenIdx,
        toTokenIdx: data.fillData.toTokenIdx,
      },
    ];
  } else if (aggregator == "paraswap") {
    return [
      {
        poolAddress: data.poolAddresses[0],
        exchangeFunctionSelector: getCurveSelector(
          data.data.underlyingSwap,
          true
        ), // TODO this work?
        fromTokenIdx: data.data.i,
        toTokenIdx: data.data.j,
      },
    ];
  } else if (aggregator == "kyber") {
    return [
      {
        poolAddress: data.pool,
        exchangeFunctionSelector: getCurveSelector(
          data.poolExtra.underlying,
          true
        ),
        fromTokenIdx: data.poolExtra.tokenInIndex,
        toTokenIdx: data.poolExtra.tokenOutIndex,
      },
    ];
  } else {
    // raise error if no aggregator found
    throw new Error("No aggregator found");
  }
}

function getV3FeeString(fee: number): string {
  const feeString = fee.toString(16);
  return "0".repeat(6 - feeString.length) + feeString;
}

function getUniswapPathFromParaswap(data: any): string {
  let uniswapPath = data.data.path[0].tokenIn;

  for (let i = 0; i < data.data.path.length; i++) {
    uniswapPath += getV3FeeString(data.data.path[i].fee);
    uniswapPath += data.data.path[i].tokenOut.slice(2); // remove 0x
  }

  return uniswapPath;
}

function getTokenAddressPathFromParaswap(data: any): string[] {
  const path = data.data.path;
  const tokenPath = [path[0].tokenIn];

  for (let i = 0; i < data.data.path.length; i++) {
    tokenPath.push(path[i].tokenOut);
  }

  return tokenPath;
}

function getUniswapV3Params(
  aggregator: Aggregator,
  data: any
): UniswapV3Params[] {
  if (aggregator == "0x") {
    if (data.fillData.tokenAddressPath !== undefined) {
      return [
        {
          tokenAddressPath: data.fillData.tokenAddressPath,
          uniswapPath: data.fillData.uniswapPath,
        },
      ];
    } else {
      return [
        {
          tokenAddressPath: [data.takerToken, data.makerToken],
          uniswapPath: data.fillData.path,
        },
      ];
    }
  } else if (aggregator == "paraswap") {
    return [
      {
        tokenAddressPath: getTokenAddressPathFromParaswap(data),
        uniswapPath: getUniswapPathFromParaswap(data),
      },
    ];
  } else if (aggregator == "kyber") {
    return [
      {
        tokenAddressPath: [data.tokenIn, data.tokenOut],
        pool: data.pool,
      },
    ];
  } else {
    // raise error if no aggregator found
    throw new Error("No aggregator found");
  }
}

function getDodoV2Params(aggregator: Aggregator, data: any): DodoV2Params[] {
  if (aggregator == "0x") {
    // is it possible to actually have more than 1 swap step here? :x
    return [
      {
        poolAddress: [data.fillData.poolAddress as string],
        directions: data.fillData.isSellBase ? 0 : 1,
      },
    ];
  } else if (aggregator == "paraswap") {
    return [
      {
        poolAddress: data.data.dodoPairs,
        directions: data.data.directions,
      },
    ];
  } else {
    // raise error if no aggregator found
    throw new Error("No aggregator found");
  }
}

export const exchanges = [
  new OneInch(),
  new QuickSwap(),
  new SushiSwap(),
  new ApeSwap(),
  new Dfyn(),
  new BalancerV2(),
  new KyberDMM(),
  new Curve(),
  new CurveV2(),
  new UniswapV3(),
  new MMFSwap(),
  new MeshSwap(),
  new DodoV2(),
  new Paraswap(),
  new ZeroX(),
];

function filterExchangesByName(exchanges: Exchange[], name: string) {
  return exchanges.filter((exchange) => exchange[name] != null);
}

function getExchangesByName(exchanges: Exchange[], name: string) {
  const result = {};
  filterExchangesByName(exchanges, name).map((exchange) => {
    if (exchange[name] != "") {
      result[exchange[name]] = exchange;
    }
  });
  return result;
}

export const zeroxExchanges = getExchangesByName(exchanges, "name0x");
export const paraswapExchanges = getExchangesByName(exchanges, "nameParaswap");
export const kyberExchanges = getExchangesByName(exchanges, "nameKyber");

export const zeroxNames = Object.keys(zeroxExchanges).join(",");
export const paraswapNames = Object.keys(paraswapExchanges).join(",");
export const kyberNames = Object.keys(kyberExchanges).join(",");
