import { AssetType } from "../transaction/types";
import { NetworkTokenStrategy } from "./NetworkTokenStrategy";
import { TokenStrategy } from "./TokenStrategy";
import { GammaDepositStrategy } from "./GammaDepositStrategy";
import { BeefyDepositStrategy } from "./BeefyDepositStrategy";
import { UniswapV2LiquidityStrategy } from "./UniswapV2LiquidityStrategy";
import { AaveV2DepositStrategy } from "./AaveV2DepositStrategy";
import { AaveV3DepositStrategy } from "./AaveV3DepositStrategy";
import { StargateDepositStrategy } from "./StargateDepositStrategy";
import { InterfaceStrategy } from "./InterfaceStrategy";
import { BalancerDepositStrategy } from "./BalancerDepositStrategy";
import { SavingsDaiDepositStrategy } from "./SavingsDaiDepositStrategy";
import { CompoundDepositStrategy } from "./CompoundV3DepositStrategy";

export const assetTypeStrategies: {
  [interfaceName in AssetType]: InterfaceStrategy;
} = {
  token: new TokenStrategy(),
  networkToken: new NetworkTokenStrategy(),
  balancerDeposit: new BalancerDepositStrategy(),
  beefyDeposit: new BeefyDepositStrategy(),
  uniswapV2Liquidity: new UniswapV2LiquidityStrategy(),
  gammaDeposit: new GammaDepositStrategy(),
  aaveV2Deposit: new AaveV2DepositStrategy(),
  aaveV3Deposit: new AaveV3DepositStrategy(),
  compoundV3Deposit: new CompoundDepositStrategy(),
  stargateDeposit: new StargateDepositStrategy(),
  savingsDaiDeposit: new SavingsDaiDepositStrategy(),
};
