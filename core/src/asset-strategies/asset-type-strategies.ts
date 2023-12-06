import { AssetType } from "../transaction/types";
import { NetworkTokenStrategy } from "./NetworkTokenStrategy";
import { TokenStrategy } from "./TokenStrategy";
import { GammaDepositStrategy } from "./GammaDepositStrategy";
import { BeefyDepositStrategy } from "./BeefyDepositStrategy";
import { UniswapV2LiquidityStrategy } from "./UniswapV2LiquidityStrategy";
import { AaveV2DepositStrategy } from "./AaveV2DepositStrategy";
import { AaveV3DepositStrategy } from "./AaveV3DepositStrategy";
import { InterfaceStrategy } from "./InterfaceStrategy";
import { BalancerDepositStrategy } from "./BalancerDepositStrategy";

export const assetTypeStrategies: {
  [chainId: number]: {
    [interfaceName in AssetType]: InterfaceStrategy;
  };
} = {
  137: {
    token: new TokenStrategy(),
    networkToken: new NetworkTokenStrategy(),
    balancerDeposit: new BalancerDepositStrategy(),
    beefyDeposit: new BeefyDepositStrategy(),
    uniswapV2Liquidity: new UniswapV2LiquidityStrategy(),
    gammaDeposit: new GammaDepositStrategy(),
    aaveV2Deposit: new AaveV2DepositStrategy(),
    aaveV3Deposit: new AaveV3DepositStrategy(),
  },
};
