import { Interface } from "ethers";

import IERC20ABI from "./abi/IERC20.json";
import IParaswapABI from "./abi/Paraswap/IParaswap.json";
import ZeroXERC20ABI from "./abi/ZeroX/ZeroXERC20.json";
import IHypervisorABI from "./abi/Gamma/IHypervisor.json";
import IHypervisorRouterABI from "./abi/Gamma/IHypervisorRouter.json";
import RouterABI from "./abi/Router.json";
import RouterSimulatorABI from "./abi/RouterSimulator.json";

export const IERC20 = new Interface(IERC20ABI.abi);
export const IParaswap = new Interface(IParaswapABI);
export const ZeroXERC20 = new Interface(ZeroXERC20ABI.abi);
export const IHypervisor = new Interface(IHypervisorABI.abi);
export const IHypervisorRouter = new Interface(IHypervisorRouterABI.abi);
export const Router = new Interface(RouterABI.abi);
export const RouterSimulator = new Interface(RouterSimulatorABI.abi);
