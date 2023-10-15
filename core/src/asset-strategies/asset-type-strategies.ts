import { AssetType } from "../transaction/types";
import { NetworkTokenStrategy } from "./NetworkTokenStrategy";
import { TokenStrategy } from "./TokenStrategy";
import { GammaDepositStrategy } from "./GammaDepositStrategy";
import { BeefyDepositStrategy } from "./BeefyDepositStrategy";
import { InterfaceStrategy } from "./InterfaceStrategy";

export const assetTypeStrategies: {
  [chainId: number]: {
    [interfaceName in AssetType]: InterfaceStrategy;
  };
} = {
  137: {
    token: new TokenStrategy(),
    networkToken: new NetworkTokenStrategy(),
    beefyDeposit: new BeefyDepositStrategy(),
    gammaDeposit: new GammaDepositStrategy(),
  },
};
