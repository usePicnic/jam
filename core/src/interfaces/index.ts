import { Interface } from "ethers";
import IERC20ABI from "./abi/IERC20.json";

export const IERC20 = new Interface(IERC20ABI.abi);
