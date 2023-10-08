import { Interface } from "ethers";

import IERC20ABI from "./abi/IERC20.json";
import IBeefyVaultV6ABI from "./abi/Beefy/IBeefyVaultV6.json";
import IHypervisorABI from "./abi/Gamma/IHypervisor.json";
import IHypervisorRouterABI from "./abi/Gamma/IHypervisorRouter.json";
import GammaRatiosCalculatorABI from "./abi/Gamma/GammaRatiosCalculator.json";
import IParaswapABI from "./abi/Paraswap/IParaswap.json";
import ZeroXERC20ABI from "./abi/ZeroX/ZeroXERC20.json";
import RouterABI from "./abi/Router.json";
import RouterSimulatorABI from "./abi/RouterSimulator.json";

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
