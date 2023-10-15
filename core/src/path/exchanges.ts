import { RouterOperation, StoreOpType } from "../transaction/types";
import { Route } from "./apis/api";
import { IERC20, IParaswap, ZeroXERC20 } from "../abis";
import { Provider } from "ethers";
import {
  FRACTION_MULTIPLIER,
  MAGIC_REPLACER_0,
  getMagicOffsets,
} from "../utils/get-magic-offset";

interface BuildSwapOutputParams {
  chainId: number;
  walletAddress: string;
  provider: Provider;
  path: Route;
  routerOperation: RouterOperation;
}

export abstract class Exchange {
  buildSwapOutput({
    chainId,
    walletAddress,
    provider,
    path,
    routerOperation,
  }: BuildSwapOutputParams): Promise<RouterOperation> {
    throw new Error(`buildSwapOutput not implemented for ${this}`);
  }
}
// export class OneInch extends Exchange {
// }

export class Paraswap extends Exchange {
  async buildSwapOutput({
    chainId,
    walletAddress,
    provider,
    path,
    routerOperation,
  }: BuildSwapOutputParams) {
    // {
    //   fraction: 1,
    //   exchange: {
    //     name: "Paraswap",
    //     name0x: "",
    //     nameParaswap: "",
    //     nameKyber: "",
    //   },
    //   fromToken: "0x553d3D295e0f695B9228246232eDF400ed3560B5",
    //   toToken: "0xa3Fa99A148fA48D14Ed51d610c367C61876997F1",
    //   params: {
    //     paraswapAddress: "0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57",
    //     approveAddress: "0x216b4b4ba9f3e719726886d34a177484278bfcae",
    //     data: "0xa94e78ef0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000553d3d295e0f695b9228246232edf400ed3560b50000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000073a16aa46d6d203461000000000000000000000000000000000000000000000073a16aa46d6d20346100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000b40000000000000000000000000000000000000000000000000000000006513856698402793e9c2460dafebf2cbfd0a94e9000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000003200000000000000000000000002791bca1f2de4661ed88a30c99a7a9449aa841740000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000e44769f42e1e9592f86b82f206407a8f7c84b4ed00000000000000000000000000000000000000000000000000000000000027100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000d000000000000000000000000e592427a0aece92de3edee1f18e0157c05861564000000000000000000000000000000000000000000000000000000000000271000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000651c6b86000000000000000000000000000000000000000000000000000000000000002b553d3d295e0f695b9228246232edf400ed3560b5000bb82791bca1f2de4661ed88a30c99a7a9449aa84174000000000000000000000000000000000000000000000000000000000000000000a3fa99a148fa48d14ed51d610c367c61876997f10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000e44769f42e1e9592f86b82f206407a8f7c84b4ed0000000000000000000000000000000000000000000000000000000000002710000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000001c0000000000000000000000000000000000000000000000000000000000000000d000000000000000000000000e592427a0aece92de3edee1f18e0157c0586156400000000000000000000000000000000000000000000000000000000000024b800000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000651c6b86000000000000000000000000000000000000000000000000000000000000002b2791bca1f2de4661ed88a30c99a7a9449aa841740001f4a3fa99a148fa48d14ed51d610c367c61876997f10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009000000000000000000000000ba12222222228d8ba445958a75a0704d566bf2c8000000000000000000000000000000000000000000000000000000000000025800000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002e0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000def171fe48cf0115b1d80b88dc8eab59176fee570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000def171fe48cf0115b1d80b88dc8eab59176fee5700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000260ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002006df3b2bbb68adc8b0e302443692037ed9f91b42000000000000000000000012000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000006cb96b300000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000002791bca1f2de4661ed88a30c99a7a9449aa84174000000000000000000000000a3fa99a148fa48d14ed51d610c367c61876997f100000000000000000000000000000000000000000000000000000000000000027fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000000000000",
    //   },
    // }
    const output = routerOperation;

    const storeNumberFrom = routerOperation.stores.findOrInitializeStoreIdx({
      address: path.fromToken,
    });
    const storeNumberTo = routerOperation.stores.findOrInitializeStoreIdx({
      address: path.toToken,
    });

    const { data: approveEncodedCall, offsets: approveFromOffsets } =
      getMagicOffsets({
        data: IERC20.encodeFunctionData("approve", [
          path.params.approveAddress,
          MAGIC_REPLACER_0,
        ]),
        magicReplacers: [MAGIC_REPLACER_0],
      });

    output.steps.push({
      stepAddress: path.fromToken,
      stepEncodedCall: approveEncodedCall,
      storeOperations: [
        {
          storeOpType: StoreOpType.RetrieveStoreAssignCall,
          storeNumber: storeNumberFrom,
          offset: approveFromOffsets[0],
          fraction: Math.round(path.fraction * FRACTION_MULTIPLIER),
        },
      ],
    });

    const decodedData = IParaswap.parseTransaction({
      data: path.params.data as string,
    });

    let swapEncodedCall: string;
    let swapFromOffset: number;
    let swapToOffset: number;

    const block = await provider.getBlock("latest");

    if (block === null) {
      throw new Error("Failed to fetch the latest block");
    }

    if (decodedData?.name === "megaSwap") {
      const { data, offsets: fromOffsets } = getMagicOffsets({
        data: IParaswap.encodeFunctionData("megaSwap", [
          [
            path.fromToken, // fromToken
            MAGIC_REPLACER_0, // fromAmount
            1, // toAmount (originally decodedData.args[0].toAmount) (minAmountOut)
            BigInt(
              "115792089237316195423570985008687907853269984665640564039457584007913129639935"
            ), // expectedAmount (originally decodedData.args[0].expectedAmount))
            walletAddress, // beneficiary
            decodedData.args[0].path, // path
            decodedData.args[0].partner, // partner
            decodedData.args[0].feePercent, // feePercent
            decodedData.args[0].permit, // permit
            block.timestamp + 1000, // deadline
            decodedData.args[0].uuid, // uuid
          ],
        ]),
        magicReplacers: [MAGIC_REPLACER_0],
      });

      swapEncodedCall = data;
      swapFromOffset = fromOffsets[0];

      const { offsets: toOffsets } = getMagicOffsets({
        data: IParaswap.encodeFunctionResult("megaSwap", [MAGIC_REPLACER_0]),
        magicReplacers: [MAGIC_REPLACER_0],
      });

      swapToOffset = toOffsets[0];
    } else if (decodedData?.name === "multiSwap") {
      const { data, offsets: fromOffsets } = getMagicOffsets({
        data: IParaswap.encodeFunctionData("multiSwap", [
          [
            path.fromToken, // fromToken
            MAGIC_REPLACER_0, // fromAmount
            1, // toAmount (originally decodedData.args[0].toAmount) (minAmountOut)
            BigInt(
              "115792089237316195423570985008687907853269984665640564039457584007913129639935"
            ), // expectedAmount (originally decodedData.args[0].expectedAmount))
            walletAddress, // beneficiary
            decodedData.args[0].path, // path
            decodedData.args[0].partner, // partner
            decodedData.args[0].feePercent, // feePercent
            decodedData.args[0].permit, // permit
            block.timestamp + 1000, // deadline
            decodedData.args[0].uuid, // uuid
          ],
        ]),
        magicReplacers: [MAGIC_REPLACER_0],
      });

      swapEncodedCall = data;
      swapFromOffset = fromOffsets[0];

      const { offsets: toOffsets } = getMagicOffsets({
        data: IParaswap.encodeFunctionResult("multiSwap", [MAGIC_REPLACER_0]),
        magicReplacers: [MAGIC_REPLACER_0],
      });

      swapToOffset = toOffsets[0];
    } else {
      throw new Error(`Paraswap: unimplemented function ${decodedData?.name}`);
    }

    output.steps.push({
      stepAddress: path.params.paraswapAddress as string,
      stepEncodedCall: swapEncodedCall,
      storeOperations: [
        {
          storeOpType: StoreOpType.RetrieveStoreAssignCallSubtract,
          storeNumber: storeNumberFrom,
          offset: swapFromOffset,
          fraction: Math.round(path.fraction * FRACTION_MULTIPLIER),
        },
        {
          storeOpType: StoreOpType.RetrieveResultAssignStore,
          storeNumber: storeNumberTo,
          offset: swapToOffset,
          fraction: 0,
        },
      ],
    });

    console.dir(
      {
        paraswapPath: path,
        paraswapOutput: output,
      },
      { depth: null }
    );

    return output;
  }
}

export class ZeroX extends Exchange {
  name = "ZeroX";
  name0x = "";
  nameParaswap = "";
  nameKyber = "";

  async buildSwapOutput({
    chainId,
    walletAddress,
    provider,
    path,
    routerOperation,
  }: BuildSwapOutputParams) {
    // {
    //   fraction: 1,
    //   exchange: {
    //     name: "ZeroX",
    //     name0x: "",
    //     nameParaswap: "",
    //     nameKyber: "",
    //   },
    //   fromToken: "0x553d3D295e0f695B9228246232eDF400ed3560B5",
    //   toToken: "0xa3Fa99A148fA48D14Ed51d610c367C61876997F1",
    //   params: {
    //     zeroXAddress: "0xdef1c0ded9bec7f1a1670819833240f027b25eff",
    //     approveAddress: "0xdef1c0ded9bec7f1a1670819833240f027b25eff",
    //     data: "0x415565b0000000000000000000000000553d3d295e0f695b9228246232edf400ed3560b5000000000000000000000000a3fa99a148fa48d14ed51d610c367c61876997f10000000000000000000000000000000000000000000000000c7d713b49da00000000000000000000000000000000000000000000000000676c5f8d9cddb9b25800000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000042000000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000038000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000553d3d295e0f695b9228246232edf400ed3560b5000000000000000000000000a3fa99a148fa48d14ed51d610c367c61876997f100000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000034000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000c7d713b49da0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000012556e69737761705633000000000000000000000000000000000000000000000000000000000000000c7d713b49da00000000000000000000000000000000000000000000000000676c5f8d9cddb9b258000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000e592427a0aece92de3edee1f18e0157c05861564000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000042553d3d295e0f695b9228246232edf400ed3560b5000bb82791bca1f2de4661ed88a30c99a7a9449aa841740001f4a3fa99a148fa48d14ed51d610c367c61876997f1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000002000000000000000000000000553d3d295e0f695b9228246232edf400ed3560b5000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee0000000000000000000000000000000000000000000000000000000000000000869584cd000000000000000000000000100000000000000000000000000000000000001100000000000000000000000000000000f0d0d9c4adc22a446c739b50dba221cf",
    //   },
    // }
    const output = routerOperation;

    const storeNumberFrom = routerOperation.stores.findOrInitializeStoreIdx({
      address: path.fromToken,
    });
    const storeNumberTo = routerOperation.stores.findOrInitializeStoreIdx({
      address: path.toToken,
    });

    const { data: approveEncodedCall, offsets: approveFromOffsets } =
      getMagicOffsets({
        data: IERC20.encodeFunctionData("approve", [
          path.params.approveAddress,
          MAGIC_REPLACER_0,
        ]),
        magicReplacers: [MAGIC_REPLACER_0],
      });

    output.steps.push({
      stepAddress: path.fromToken,
      stepEncodedCall: approveEncodedCall,
      storeOperations: [
        {
          storeOpType: StoreOpType.RetrieveStoreAssignCall,
          storeNumber: storeNumberFrom,
          offset: approveFromOffsets[0],
          fraction: Math.round(path.fraction * FRACTION_MULTIPLIER),
        },
      ],
    });

    const decodedTransformERC20 = ZeroXERC20.decodeFunctionData(
      "transformERC20",
      path.params.data
    );

    const { data: swapEncodedCall, offsets: swapFromOffsets } = getMagicOffsets(
      {
        data: ZeroXERC20.encodeFunctionData("transformERC20", [
          path.fromToken, // inputToken
          path.toToken, // outputToken
          MAGIC_REPLACER_0, // inputTokenAmount
          1, // minOutputTokenAmount
          decodedTransformERC20[4], // transformations
        ]),
        magicReplacers: [MAGIC_REPLACER_0],
      }
    );

    const { offsets: swapToOffsets } = getMagicOffsets({
      data: ZeroXERC20.encodeFunctionResult("transformERC20", [
        MAGIC_REPLACER_0,
      ]),
      magicReplacers: [MAGIC_REPLACER_0],
    });

    output.steps.push({
      stepAddress: path.params.zeroXAddress as string,
      stepEncodedCall: swapEncodedCall,
      storeOperations: [
        {
          storeOpType: StoreOpType.RetrieveStoreAssignCallSubtract,
          storeNumber: storeNumberFrom,
          offset: swapFromOffsets[0],
          fraction: Math.round(path.fraction * FRACTION_MULTIPLIER),
        },
        {
          storeOpType: StoreOpType.RetrieveResultAssignStore,
          storeNumber: storeNumberTo,
          offset: swapToOffsets[0],
          fraction: 0,
        },
      ],
    });

    console.dir(
      {
        zeroXPath: path,
        zeroXOutput: output,
      },
      { depth: null }
    );

    return output;
  }
}
export interface OneInchParams {
  oneInchAddress: string;
  executor: string;
  desc: any;
  permit: string;
  data: string;
}

export interface ParaswapFullParams {
  paraswapAddress: string;
  approveAddress: string;
  data: string;
}

export interface ZeroXFullParams {
  zeroXAddress: string;
  approveAddress: string;
  data: string;
}

export interface ExchangeParams {
  path?: string[];
  poolId?: string;
  tokenIn?: string;
  tokenOut?: string;
  poolAddress?: string | string[];
  isRedeem?: boolean;
  poolsPath?: string[];
  tokensPath?: string[];
  exchangeFunctionSelector?: string;
  fromTokenIdx?: number;
  toTokenIdx?: number;
  tokenAddressPath?: string[];
  uniswapPath?: string;
  oneInchAddress?: string;
  executor?: string;
  desc?: any;
  permit?: string;
  data?: string;
  directions?: number;
  pool?: string;
  paraswapAddress?: string;
  approveAddress?: string;
  zeroXAddress?: string;
}

export const exchanges = [new Paraswap(), new ZeroX()];
