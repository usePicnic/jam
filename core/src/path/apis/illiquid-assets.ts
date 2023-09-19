import { simulateAndChooseRoute } from "../tx-simulator";
import { BalancerV2, Curve, Exchange, Jarvis, exchanges } from "../exchanges";
import { Route } from "./api";

const illiquidTokens = {
  "0x6AE7Dfc73E0dDE2aa99ac063DcF7e8A63265108c": "JPYC",
  "0xE2Aa7db6dA1dAE97C5f5C6914d285fBfCC32A128": "PAR",
  "0x7BDF330f423Ea880FF95fC41A280fD5eCFD3D09f": "EURT",
  "0xE0B52e49357Fd4DAf2c15e02058DCE6BC0057db4": "agEUR",
  "0x769434dcA303597C8fc4997Bf3DAB233e961Eda2": "XSGD",
  "0x5d146d8B1dACb1EBBA5cb005ae1059DA8a1FbF57": "CADC",
  "0xeaFE31Cd9e8E01C8f0073A2C974f728Fb80e9DcE": "NZDS",
  "0x491a4eB4f1FC3BfF8E1d2FC856a6A46663aD556f": "BRZ",
};

const curvePoolAddresses = {
  JPYC: "0xE8dCeA7Fb2Baf7a9F4d9af608F06d78a687F8d9A",
  PAR: "0x0f110c55EfE62c16D553A3d3464B77e1853d0e97",
  EURT: "0x2C3cc8e698890271c8141be9F6fD6243d56B39f1",
  agEUR: "0x2fFbCE9099cBed86984286A54e5932414aF4B717",
  XSGD: "0xeF75E9C7097842AcC5D0869E1dB4e5fDdf4BFDDA",
  CADC: "0xA69b0D5c0C401BBA2d5162138613B5E38584F63F",
  NZDS: "0x976A750168801F58E8AEdbCfF9328138D544cc09",
};

const balancerPoolIds = {
  BRZ: "0xe22483774bd8611be2ad2f4194078dac9159f4ba0000000000000000000008f0",
};

const selectors = {
  JPYC: "0x3df02124",
  PAR: "0x3df02124",
  EURT: "0x3df02124",
  agEUR: "0x3df02124",
  XSGD: "0x3df02124",
  CADC: "0x3df02124",
  NZDS: "0x3df02124",
};
const synthereums = {
  // jEUR
  "0x4e3Decbb3645551B8A19f0eA1678079FCB33fB4c":
    "0x65a7b4Ff684C2d08c115D55a4B089bf4E92F5003",
  // jJPY
  "0x8343091F2499FD4b6174A46D067A920a3b851FF9":
    "0xAEc757BF73cc1f4609a1459205835Dd40b4e3F29",
  // jSGD
  "0xa926db7a4CC0cb1736D5ac60495ca8Eb7214B503":
    "0xBE813590e1B191120f5df3343368f8a2F579514C",
  // jCAD
  "0x8ca194A3b22077359b5732DE53373D4afC11DeE3":
    "0x06440a2DA257233790B5355322dAD82C10F0389A",
  // jNZD
  "0x6b526Daf03B4C47AF2bcc5860B12151823Ff70E0":
    "0x4FDA1B4b16f5F2535482b91314018aE5A2fda602",
  // jBRL
  "0xf2f77FE7b8e66571E0fca7104c4d670BF1C8d722":
    "0x30E97dc680Ee97Ff65B5188d34Fb4EA20B38D710",
  // jCHF
  "0xbD1463F02f61676d53fd183C2B19282BFF93D099":
    "0x8734CF40A402D4191BD4D7a64bEeF12E4c452DeF",
  // jCOP
  "0xE6d222caAed5F5DD73A9713AC91C95782e80ACBf":
    "0x1493607042C5725cEf277A83CFC94caA4fc6278F",
};
const tokens = {
  JPYC: [
    "0x8343091F2499FD4b6174A46D067A920a3b851FF9",
    "0x6AE7Dfc73E0dDE2aa99ac063DcF7e8A63265108c",
  ],
  PAR: [
    "0xE2Aa7db6dA1dAE97C5f5C6914d285fBfCC32A128",
    "0x4e3Decbb3645551B8A19f0eA1678079FCB33fB4c",
  ],
  EURT: [
    "0x7BDF330f423Ea880FF95fC41A280fD5eCFD3D09f",
    "0x4e3Decbb3645551B8A19f0eA1678079FCB33fB4c",
  ],
  agEUR: [
    "0xE0B52e49357Fd4DAf2c15e02058DCE6BC0057db4",
    "0x4e3Decbb3645551B8A19f0eA1678079FCB33fB4c",
  ],
  XSGD: [
    "0xa926db7a4CC0cb1736D5ac60495ca8Eb7214B503",
    "0x769434dcA303597C8fc4997Bf3DAB233e961Eda2",
  ],
  CADC: [
    "0x8ca194A3b22077359b5732DE53373D4afC11DeE3",
    "0x5d146d8B1dACb1EBBA5cb005ae1059DA8a1FbF57",
  ],
  NZDS: [
    "0x6b526Daf03B4C47AF2bcc5860B12151823Ff70E0",
    "0xeaFE31Cd9e8E01C8f0073A2C974f728Fb80e9DcE",
  ],
  BRZ: [
    "0xf2f77FE7b8e66571E0fca7104c4d670BF1C8d722",
    "0x491a4eB4f1FC3BfF8E1d2FC856a6A46663aD556f",
  ],
};

const USDC = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";

function getFirstLeg(sellToken: string, buyToken: string): any {
  let token: string;
  let fromTokenIdx: number;
  let toTokenIdx: number;
  let isSellIlliquid;

  if (Object.keys(illiquidTokens).includes(sellToken)) {
    token = illiquidTokens[sellToken];
    fromTokenIdx = tokens[token].indexOf(sellToken);
    toTokenIdx = tokens[token].indexOf(sellToken) == 1 ? 0 : 1;
    isSellIlliquid = true;
  } else if (Object.keys(illiquidTokens).includes(buyToken)) {
    token = illiquidTokens[buyToken];
    fromTokenIdx = tokens[token].indexOf(buyToken) == 1 ? 0 : 1;
    toTokenIdx = tokens[token].indexOf(buyToken);
    isSellIlliquid = false;
  } else {
    return { isLiquid: true, isSellIlliquid: undefined, firstLeg: [] };
  }

  if (curvePoolAddresses[token] !== undefined) {
    const params = {
      poolAddress: curvePoolAddresses[token],
      exchangeFunctionSelector: selectors[token],
      fromTokenIdx,
      toTokenIdx,
    };
    const exchange = new Curve();
    const route = {
      exchange,
      fraction: 1,
      params,
      fromToken: tokens[token][fromTokenIdx],
      toToken: tokens[token][toTokenIdx],
    };
    return {
      isLiquid: false,
      isSellIlliquid,
      firstLeg: [route as Route],
    };
  } else if (balancerPoolIds[token] !== undefined) {
    const params = {
      poolId: balancerPoolIds[token],
      tokenIn: tokens[token][fromTokenIdx],
      tokenOut: tokens[token][toTokenIdx],
    };
    const exchange = new BalancerV2();
    const route = {
      exchange,
      fraction: 1,
      params,
      fromToken: tokens[token][fromTokenIdx],
      toToken: tokens[token][toTokenIdx],
    };
    return {
      isLiquid: false,
      isSellIlliquid,
      firstLeg: [route as Route],
    };
  } else {
    return [];
  }
}

function getJarvisRoute(isRedeem: boolean, firstLeg: Route[]): Route[] {
  const exchange = new Jarvis();
  if (isRedeem) {
    return [
      {
        exchange,
        fraction: 1,
        params: { poolAddress: synthereums[firstLeg[0].toToken], isRedeem },
        fromToken: firstLeg[0].toToken,
        toToken: USDC,
      } as Route,
    ];
  } else {
    return [
      {
        exchange,
        fraction: 1,
        params: { poolAddress: synthereums[firstLeg[0].fromToken], isRedeem },
        fromToken: USDC,
        toToken: firstLeg[0].fromToken,
      } as Route,
    ];
  }
}

function jarvisRoutine(sellToken: string, buyToken: string) {
  const isJarvis =
    Object.keys(synthereums).includes(sellToken) ||
    Object.keys(synthereums).includes(buyToken);
  if (isJarvis) {
    const routes = [];
    const exchange = new Jarvis();

    if (Object.keys(synthereums).includes(sellToken)) {
      const route = {
        exchange,
        fraction: 1,
        params: { poolAddress: synthereums[sellToken], isRedeem: true },
        fromToken: sellToken,
        toToken: USDC,
      };
      routes.push(route);
    }

    if (Object.keys(synthereums).includes(buyToken)) {
      const route = {
        exchange,
        fraction: 1,
        params: { poolAddress: synthereums[buyToken], isRedeem: false },
        fromToken: USDC,
        toToken: buyToken,
      };
      routes.push(route);
    }

    return { isJarvis, route: routes };
  } else {
    return { isJarvis, route: [] };
  }
}

export async function getIlliquidAssetsData(
  network: Network,
  sellToken: Asset,
  buyToken: Asset,
  sellAmount: string,
  exchangeList: Exchange[] = exchanges
): Promise<Route[]> {
  const { isJarvis, route } = jarvisRoutine(
    sellToken.address,
    buyToken.address
  );
  if (isJarvis) {
    return route;
  }

  const { isLiquid, isSellIlliquid, firstLeg } = getFirstLeg(
    sellToken.address,
    buyToken.address
  );

  console.log("getIlliquidAssetsData", {
    sellToken,
    buyToken,
    isLiquid,
    isSellIlliquid,
    firstLeg,
  });
  if (isLiquid) {
    return [];
  }

  const jarvisLeg = getJarvisRoute(isSellIlliquid, firstLeg);

  // Jarvis Redeem 100% of jToken (TODO in rare cases we might convert unwanted jToken to USDC, but should be too rare)
  // Very hard to solve otherwise

  const USDCAsset = { address: USDC, decimals: 6 } as unknown as Asset;
  if (buyToken.address != USDC && isSellIlliquid) {
    const sellAmountUSD =
      parseFloat(formatUnits(sellAmount, sellToken.decimals)) *
      sellToken.latestPrice;
    const usdcAmount = (sellAmountUSD * 10 ** 6).toFixed(0);
    const usdcRoutes = await simulateAndChooseRoute(
      network,
      USDCAsset,
      { address: buyToken } as unknown as Asset,
      usdcAmount
    );
    return [...firstLeg, ...jarvisLeg, ...usdcRoutes];
  } else if (sellToken.address != USDC && !isSellIlliquid) {
    const usdcRoutes = await simulateAndChooseRoute(
      network,
      { address: sellToken } as unknown as Asset,
      USDCAsset,
      sellAmount
    );
    return [...usdcRoutes, ...jarvisLeg, ...firstLeg];
  } else if (isSellIlliquid) {
    return [...firstLeg, ...jarvisLeg];
  } else {
    return [...jarvisLeg, ...firstLeg];
  }
}
