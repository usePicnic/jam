import { Interface } from "ethers";

import IERC20ABI from "./IERC20.json";
import AaveIncentivesControllerABI from "./AaveV2/AaveIncentivesController.json";
import LendingPoolABI from "./AaveV2/LendingPool.json";
import IPoolABI from "./AaveV3/IPool.json";
import IVaultABI from "./Balancer/IVault.json";
import IComposableStablePoolABI from "./Balancer/IComposableStablePool.json";
import IBeefyVaultV6ABI from "./Beefy/IBeefyVaultV6.json";
import IHypervisorABI from "./Gamma/IHypervisor.json";
import IHypervisorRouterABI from "./Gamma/IHypervisorRouter.json";
import GammaRatiosCalculatorABI from "./Gamma/GammaRatiosCalculator.json";
import IParaswapABI from "./Paraswap/IParaswap.json";
import UniswapV2FactoryABI from "./UniswapV2/UniswapV2Factory.json";
import UniswapV2PairABI from "./UniswapV2/UniswapV2Pair.json";
import UniswapV2Router02ABI from "./UniswapV2/UniswapV2Router02.json";
import ZeroXERC20ABI from "./ZeroX/ZeroXERC20.json";
import SavingsDaiABI from "./Maker/SavingsDai.json";
import RouterABI from "./Router.json";
import RouterSimulatorABI from "./RouterSimulator.json";

export const IERC20 = new Interface(IERC20ABI.abi);
export const AaveIncentivesController = new Interface(
  AaveIncentivesControllerABI
);
export const LendingPool = new Interface(LendingPoolABI);
export const IPool = new Interface(IPoolABI);
export const IVault = new Interface(IVaultABI);
export const IBeefyVaultV6 = new Interface(IBeefyVaultV6ABI);
export const IComposableStablePool = new Interface(IComposableStablePoolABI);
export const IHypervisor = new Interface(IHypervisorABI);
export const IHypervisorRouter = new Interface(IHypervisorRouterABI.abi);
export const GammaRatiosCalculator = new Interface(
  GammaRatiosCalculatorABI.abi
);
export const IParaswap = new Interface(IParaswapABI);
export const UniswapV2Factory = new Interface(UniswapV2FactoryABI);
export const UniswapV2Pair = new Interface(UniswapV2PairABI);
export const UniswapV2Router02 = new Interface(UniswapV2Router02ABI);
export const ZeroXERC20 = new Interface(ZeroXERC20ABI.abi);
export const SavingsDai = new Interface(SavingsDaiABI);
export const Router = new Interface(RouterABI.abi);
export const RouterSimulator = new Interface(RouterSimulatorABI.abi);
