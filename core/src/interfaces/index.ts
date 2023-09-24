import { Interface } from "ethers";

import IERC20ABI from "./abi/IERC20.json";
import ISwapRouterABI from "./abi/UniswapV3/ISwapRouter.json";
import UniV3PoolABI from "./abi/UniswapV3/UniV3Pool.json";
import RouterABI from "./abi/Router.json";
import RouterSimulatorABI from "./abi/RouterSimulator.json";

export const IERC20 = new Interface(IERC20ABI.abi);
export const ISwapRouter = new Interface(ISwapRouterABI.abi);
export const UniV3Pool = new Interface(UniV3PoolABI.abi);
export const Router = new Interface(RouterABI.abi);
export const RouterSimulator = new Interface(RouterSimulatorABI.abi);
