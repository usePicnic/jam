import { Asset } from "../transaction/types";

export interface ParamsAPI {
  buyToken: Asset;
  sellToken: Asset;
  sellAmount: string;
}
