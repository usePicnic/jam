import { Interface } from "ethers";

import IERC20ABI from "./IERC20.json";
import IBeefyVaultV6ABI from "./Beefy/IBeefyVaultV6.json";
import IHypervisorABI from "./Gamma/IHypervisor.json";
import IHypervisorRouterABI from "./Gamma/IHypervisorRouter.json";
import GammaRatiosCalculatorABI from "./Gamma/GammaRatiosCalculator.json";
import IParaswapABI from "./Paraswap/IParaswap.json";
import ZeroXERC20ABI from "./ZeroX/ZeroXERC20.json";
import RouterABI from "./Router.json";
import RouterSimulatorABI from "./RouterSimulator.json";

export const IERC20 = new Interface(IERC20ABI.abi);
export const IBeefyVaultV6 = new Interface(IBeefyVaultV6ABI);
export const IHypervisor = new Interface(IHypervisorABI);
export const IHypervisorRouter = new Interface(IHypervisorRouterABI.abi);
export const GammaRatiosCalculator = new Interface(
  GammaRatiosCalculatorABI.abi
);
export const ZeroXERC20 = new Interface(ZeroXERC20ABI.abi);
export const IParaswap = new Interface(IParaswapABI);
export const Router = new Interface(RouterABI.abi);
export const RouterSimulator = new Interface(RouterSimulatorABI.abi);
