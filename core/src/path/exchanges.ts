import {
  DetailedStep,
  RouterOperation,
  StoreOpType,
} from "../transaction/types";
import { Route } from "./apis/api";
import {
  IERC20,
  ISwapRouter,
  IUniswapV2Router02,
  IParaswap,
  UniV3Pool,
  ZeroXERC20,
} from "../interfaces";
import { Contract, Provider } from "ethers";

const paramDict = {
  IUniswapV2: getUniswapV2Params,
  IBalancerSwap: getBalancerParams,
  IKyberSwap: getKyberDMMParams,
  ICurveSwap: getCurveParams,
  ICurveV2Swap: getCurveV2Params,
  IUniswapV3Swap: getUniswapV3Params,
  IDodoV2Swap: getDodoV2Params,
};

const MAGIC_REPLACER =
  "0x22e876a8f23cf658879db6745b42ab3e944e526ad8e0eb1cad27a4cac1d0621f";
const FRACTION_MULTIPLIER = 1000000;

function getMagicOffset({
  data,
  magicReplacer,
}: {
  data: string;
  magicReplacer: string;
}): { data: string; offset: number } {
  // Locate the magic replacer within the encoded function data
  const magicReplacerWithout0x = magicReplacer.substring(2);
  const indexOf = data.indexOf(magicReplacerWithout0x);

  if (indexOf === -1) {
    throw new Error("Magic replacer not found");
  }

  const before = data.substring(0, indexOf);
  const after = data.substring(indexOf + 64);
  const zeroReplacer = "0".repeat(64);
  const updatedData = before + zeroReplacer + after;

  return {
    data: updatedData,
    offset: indexOf / 2 - 1,
  };
}

interface BuildSwapOutputParams {
  chainId: number;
  walletAddress: string;
  provider: Provider;
  path: Route;
  routerOperation: RouterOperation;
}

export abstract class Exchange {
  abstract name: string;
  abstract name0x: string;
  abstract nameParaswap: string;
  abstract nameKyber: string;
  abstract contractName: string;
  abstract dexInterface: DEXInterface;

  getParams(aggregator: Aggregator, data: any): ExchangeParams {
    return paramDict[this.dexInterface](aggregator, data);
  }

  buildSwapOutput({
    chainId,
    walletAddress,
    provider,
    path,
    routerOperation,
  }: BuildSwapOutputParams): Promise<RouterOperation> {
    throw new Error(`buildSwapOutput not implemented for ${this.name}`);
  }
}
export class OneInch extends Exchange {
  name = "OneInch";
  name0x = "";
  nameParaswap = "";
  nameKyber = "";
  contractName = "OneInchBridge";
  dexInterface = "IOneInchBridge" as DEXInterface;
}

export class Paraswap extends Exchange {
  name = "Paraswap";
  name0x = "";
  nameParaswap = "";
  nameKyber = "";
  contractName = "ParaswapBridge";
  dexInterface = "IParaswapBridge" as DEXInterface;

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
    //     contractName: "ParaswapBridge",
    //     dexInterface: "IParaswapBridge",
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

    const { data: approveEncodedCall, offset: approveFromOffset } =
      getMagicOffset({
        data: IERC20.encodeFunctionData("approve", [
          path.params.approveAddress,
          MAGIC_REPLACER,
        ]),
        magicReplacer: MAGIC_REPLACER,
      });

    output.steps.push({
      stepAddress: path.fromToken,
      stepEncodedCall: approveEncodedCall,
      storeOperations: [
        {
          storeOpType: StoreOpType.RetrieveStoreAssignCall,
          storeNumber: storeNumberFrom,
          offset: approveFromOffset,
          fraction: path.fraction * FRACTION_MULTIPLIER,
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
      const { data, offset: fromOffset } = getMagicOffset({
        data: IParaswap.encodeFunctionData("megaSwap", [
          [
            path.fromToken, // fromToken
            MAGIC_REPLACER, // fromAmount
            decodedData.args[0].toAmount, // toAmount
            decodedData.args[0].expectedAmount, // expectedAmount
            walletAddress, // beneficiary
            decodedData.args[0].path, // path
            decodedData.args[0].partner, // partner
            decodedData.args[0].feePercent, // feePercent
            decodedData.args[0].permit, // permit
            block.timestamp + 1000, // deadline
            decodedData.args[0].uuid, // uuid
          ],
        ]),
        magicReplacer: MAGIC_REPLACER,
      });

      console.log({
        fromToken: path.fromToken, // fromToken
        fromAmount: MAGIC_REPLACER, // fromAmount
        toAmount: decodedData.args[0].toAmount, // toAmount
        expectedAmount: decodedData.args[0].expectedAmount, // expectedAmount
        beneficiary: walletAddress, // beneficiary
        path: decodedData.args[0].path, // path
        partner: decodedData.args[0].partner, // partner
        feePercent: decodedData.args[0].feePercent, // feePercent
        permit: decodedData.args[0].permit, // permit
        deadline: block.timestamp + 1000, // deadline
        uuid: decodedData.args[0].uuid, // uuid
      });

      swapEncodedCall = data;
      swapFromOffset = fromOffset;

      const { offset: toOffset } = getMagicOffset({
        data: IParaswap.encodeFunctionResult("megaSwap", [MAGIC_REPLACER]),
        magicReplacer: MAGIC_REPLACER,
      });

      swapToOffset = toOffset;
    } else if (decodedData?.name === "multiSwap") {
      console.log({
        decodedDataArgs: decodedData.args,
        decodedDataArgs0: decodedData.args[0],
        decodedDataArgs00: decodedData.args[0][0],
        decodedDataArgs0FromToken: decodedData.args[0].fromToken,
        decodedDataArgs0ToAmount: decodedData.args[0].toAmount,
      });
      const { data, offset: fromOffset } = getMagicOffset({
        data: IParaswap.encodeFunctionData("multiSwap", [
          [
            path.fromToken, // fromToken
            MAGIC_REPLACER, // fromAmount
            decodedData.args[0].toAmount, // toAmount --> o quanto vai reverter se ficar abaixo do toAmount (setar pra 1) (minAmountOut)
            decodedData.args[0].expectedAmount, // expectedAmount --> (setar pra infinito)
            walletAddress, // beneficiary
            decodedData.args[0].path, // path
            decodedData.args[0].partner, // partner
            decodedData.args[0].feePercent, // feePercent
            decodedData.args[0].permit, // permit
            block.timestamp + 1000, // deadline
            decodedData.args[0].uuid, // uuid
          ],
        ]),
        magicReplacer: MAGIC_REPLACER,
      });

      console.log({
        fromToken: path.fromToken, // fromToken
        fromAmount: MAGIC_REPLACER, // fromAmount
        toAmount: decodedData.args[0].toAmount, // toAmount
        expectedAmount: decodedData.args[0].expectedAmount, // expectedAmount
        beneficiary: walletAddress, // beneficiary
        path: decodedData.args[0].path, // path
        partner: decodedData.args[0].partner, // partner
        feePercent: decodedData.args[0].feePercent, // feePercent
        permit: decodedData.args[0].permit, // permit
        deadline: block.timestamp + 1000, // deadline
        uuid: decodedData.args[0].uuid, // uuid
      });

      swapEncodedCall = data;
      swapFromOffset = fromOffset;

      const { offset: toOffset } = getMagicOffset({
        data: IParaswap.encodeFunctionResult("multiSwap", [MAGIC_REPLACER]),
        magicReplacer: MAGIC_REPLACER,
      });

      swapToOffset = toOffset;
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
          fraction: path.fraction * FRACTION_MULTIPLIER,
        },
        {
          storeOpType: StoreOpType.RetrieveResultAssignStore,
          storeNumber: storeNumberTo,
          offset: swapToOffset,
          fraction: 0,
        },
      ],
    });

    console.log("Paraswap buildSwapOutput", {
      path,
      output,
      outputJ: JSON.stringify(output),
    });

    return output;
  }
}

export class ZeroX extends Exchange {
  name = "ZeroX";
  name0x = "";
  nameParaswap = "";
  nameKyber = "";
  contractName = "ZeroXBridge";
  dexInterface = "IZeroXBridge" as DEXInterface;

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
    //     contractName: "ZeroXBridge",
    //     dexInterface: "IZeroXBridge",
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

    const { data: approveEncodedCall, offset: approveFromOffset } =
      getMagicOffset({
        data: IERC20.encodeFunctionData("approve", [
          path.params.approveAddress,
          MAGIC_REPLACER,
        ]),
        magicReplacer: MAGIC_REPLACER,
      });

    output.steps.push({
      stepAddress: path.fromToken,
      stepEncodedCall: approveEncodedCall,
      storeOperations: [
        {
          storeOpType: StoreOpType.RetrieveStoreAssignCall,
          storeNumber: storeNumberFrom,
          offset: approveFromOffset,
          fraction: path.fraction * FRACTION_MULTIPLIER,
        },
      ],
    });

    const decodedTransformERC20 = ZeroXERC20.decodeFunctionData(
      "transformERC20",
      path.params.data
    );

    const { data: swapEncodedCall, offset: swapFromOffset } = getMagicOffset({
      data: ZeroXERC20.encodeFunctionData("transformERC20", [
        path.fromToken, // inputToken
        path.toToken, // outputToken
        MAGIC_REPLACER, // inputTokenAmount
        1, // minOutputTokenAmount
        decodedTransformERC20[4], // transformations
      ]),
      magicReplacer: MAGIC_REPLACER,
    });

    const { offset: swapToOffset } = getMagicOffset({
      data: ZeroXERC20.encodeFunctionResult("transformERC20", [MAGIC_REPLACER]),
      magicReplacer: MAGIC_REPLACER,
    });

    output.steps.push({
      stepAddress: path.params.zeroXAddress as string,
      stepEncodedCall: swapEncodedCall,
      storeOperations: [
        {
          storeOpType: StoreOpType.RetrieveStoreAssignCallSubtract,
          storeNumber: storeNumberFrom,
          offset: swapFromOffset,
          fraction: path.fraction * FRACTION_MULTIPLIER,
        },
        {
          storeOpType: StoreOpType.RetrieveResultAssignStore,
          storeNumber: storeNumberTo,
          offset: swapToOffset,
          fraction: 0,
        },
      ],
    });

    console.log("ZeroX buildSwapOutput", {
      path,
      output,
      outputJ: JSON.stringify(output),
    });

    return output;
  }
}

export abstract class UniswapV2BasedExchange extends Exchange {
  // Common properties and methods here
  protected async buildUniswapV2SwapOutput({
    chainId,
    walletAddress,
    provider,
    path,
    routerOperation,
    routerAddress,
  }: BuildSwapOutputParams & { routerAddress: string }) {
    // {
    //   exchange: {
    //     name: "QuickSwap",
    //     name0x: "QuickSwap",
    //     nameParaswap: "QuickSwap",
    //     nameKyber: "quickswap",
    //     contractName: "QuickswapSwapBridge",
    //     dexInterface: "IUniswapV2",
    //   },
    //   fraction: 0.05,
    //   params: {
    //     path: [
    //       "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    //       "0xa3fa99a148fa48d14ed51d610c367c61876997f1",
    //     ],
    //   },
    //   fromToken: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    //   toToken: "0xa3fa99a148fa48d14ed51d610c367c61876997f1",
    // }
    const output = routerOperation;

    const storeNumberFrom = routerOperation.stores.findOrInitializeStoreIdx({
      address: path.fromToken,
    });
    const storeNumberTo = routerOperation.stores.findOrInitializeStoreIdx({
      address: path.toToken,
    });

    const { data: approveEncodedCall, offset: approveFromOffset } =
      getMagicOffset({
        data: IERC20.encodeFunctionData("approve", [
          routerAddress,
          MAGIC_REPLACER,
        ]),
        magicReplacer: MAGIC_REPLACER,
      });

    output.steps.push({
      stepAddress: path.fromToken,
      stepEncodedCall: approveEncodedCall,
      storeOperations: [
        {
          storeOpType: StoreOpType.RetrieveStoreAssignCall,
          storeNumber: storeNumberFrom,
          offset: approveFromOffset,
          fraction: path.fraction * FRACTION_MULTIPLIER,
        },
      ],
    });

    const block = await provider.getBlock("latest");

    if (block === null) {
      throw new Error("Failed to fetch the latest block");
    }

    const { data: swapEncodedCall, offset: swapFromOffset } = getMagicOffset({
      data: IUniswapV2Router02.encodeFunctionData("swapExactTokensForTokens", [
        MAGIC_REPLACER, // amountIn
        1, // amountOutMin
        path.params.path, // path
        walletAddress, // to
        block.timestamp + 1000, // deadline
      ]),
      magicReplacer: MAGIC_REPLACER,
    });

    const { offset: swapToOffset } = getMagicOffset({
      data: IUniswapV2Router02.encodeFunctionResult(
        "swapExactTokensForTokens",
        [
          path.params.path.map((_, index) =>
            index === path.params.path.length - 1 ? MAGIC_REPLACER : 0
          ),
        ]
      ),
      magicReplacer: MAGIC_REPLACER,
    });

    output.steps.push({
      stepAddress: routerAddress,
      stepEncodedCall: swapEncodedCall,
      storeOperations: [
        {
          storeOpType: StoreOpType.RetrieveStoreAssignCallSubtract,
          storeNumber: storeNumberFrom,
          offset: swapFromOffset,
          fraction: path.fraction * FRACTION_MULTIPLIER,
        },
        {
          storeOpType: StoreOpType.RetrieveResultAssignStore,
          storeNumber: storeNumberTo,
          offset: swapToOffset,
          fraction: 0,
        },
      ],
    });

    console.log("ZeroX buildSwapOutput", {
      path,
      output,
      outputJ: JSON.stringify(output),
    });

    return output;
  }
}

export class QuickSwap extends UniswapV2BasedExchange {
  name = "QuickSwap";
  name0x = "QuickSwap";
  nameParaswap = "QuickSwap";
  nameKyber = "quickswap";
  contractName = "QuickswapSwapBridge";
  dexInterface = "IUniswapV2" as DEXInterface;

  async buildSwapOutput({
    chainId,
    walletAddress,
    provider,
    path,
    routerOperation,
  }: BuildSwapOutputParams) {
    return this.buildUniswapV2SwapOutput({
      routerAddress: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
      chainId,
      walletAddress,
      provider,
      path,
      routerOperation,
    });
  }
}

export class SushiSwap extends UniswapV2BasedExchange {
  name = "SushiSwap";
  name0x = "SushiSwap";
  nameParaswap = "SushiSwap";
  nameKyber = "sushiswap";
  contractName = "SushiSwapBridge";
  dexInterface = "IUniswapV2" as DEXInterface;

  async buildSwapOutput({
    chainId,
    walletAddress,
    provider,
    path,
    routerOperation,
  }: BuildSwapOutputParams) {
    return this.buildUniswapV2SwapOutput({
      routerAddress: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
      chainId,
      walletAddress,
      provider,
      path,
      routerOperation,
    });
  }
}

export class ApeSwap extends UniswapV2BasedExchange {
  name = "ApeSwap";
  name0x = "ApeSwap";
  nameParaswap = "ApeSwap";
  nameKyber = "apeswap";
  contractName = "ApeSwapBridge";
  dexInterface = "IUniswapV2" as DEXInterface;

  async buildSwapOutput({
    chainId,
    walletAddress,
    provider,
    path,
    routerOperation,
  }: BuildSwapOutputParams) {
    return this.buildUniswapV2SwapOutput({
      routerAddress: "0xC0788A3aD43d79aa53B09c2EaCc313A787d1d607",
      chainId,
      walletAddress,
      provider,
      path,
      routerOperation,
    });
  }
}

export class Dfyn extends UniswapV2BasedExchange {
  name = "Dfyn";
  name0x = "Dfyn";
  nameParaswap = "Dfyn";
  nameKyber = "dfyn";
  contractName = "DfynSwapBridge";
  dexInterface = "IUniswapV2" as DEXInterface;

  async buildSwapOutput({
    chainId,
    walletAddress,
    provider,
    path,
    routerOperation,
  }: BuildSwapOutputParams) {
    return this.buildUniswapV2SwapOutput({
      routerAddress: "0xA102072A4C07F06EC3B4900FDC4C7B80b6c57429",
      chainId,
      walletAddress,
      provider,
      path,
      routerOperation,
    });
  }
}

export class MMFSwap extends UniswapV2BasedExchange {
  name = "MMFSwap";
  name0x = "";
  nameParaswap = "";
  nameKyber = "mmf";
  contractName = "MMFSwapBridge";
  dexInterface = "IUniswapV2" as DEXInterface;

  async buildSwapOutput({
    chainId,
    walletAddress,
    provider,
    path,
    routerOperation,
  }: BuildSwapOutputParams) {
    return this.buildUniswapV2SwapOutput({
      routerAddress: "0x51aBA405De2b25E5506DeA32A6697F450cEB1a17",
      chainId,
      walletAddress,
      provider,
      path,
      routerOperation,
    });
  }
}

export class MeshSwap extends UniswapV2BasedExchange {
  name = "MeshSwap";
  name0x = "MeshSwap";
  nameParaswap = "";
  nameKyber = "";
  contractName = "MeshSwapBridge";
  dexInterface = "IUniswapV2" as DEXInterface;

  async buildSwapOutput({
    chainId,
    walletAddress,
    provider,
    path,
    routerOperation,
  }: BuildSwapOutputParams) {
    return this.buildUniswapV2SwapOutput({
      routerAddress: "0x10f4A785F458Bc144e3706575924889954946639",
      chainId,
      walletAddress,
      provider,
      path,
      routerOperation,
    });
  }
}

export class DodoV2 extends Exchange {
  name = "DODO_V2";
  name0x = "DODO_V2";
  nameParaswap = "DODOV2";
  nameKyber = "";
  contractName = "DodoV2SwapBridge";
  dexInterface = "IDodoV2Swap" as DEXInterface;
}

export class BalancerV2 extends Exchange {
  name = "Balancer_V2";
  name0x = "Balancer_V2";
  nameParaswap = "BalancerV2";
  nameKyber = "";
  contractName = "BalancerSwapBridge";
  dexInterface = "IBalancerSwap" as DEXInterface;
}

export class KyberDMM extends Exchange {
  name = "KyberDMM";
  name0x = "KyberDMM";
  nameParaswap = "KyberDmm";
  nameKyber = "";
  contractName = "KyberSwapBridge";
  dexInterface = "IKyberSwap" as DEXInterface;
}

export class Curve extends Exchange {
  name = "Curve";
  name0x = "Curve";
  nameParaswap = "Curve";
  nameKyber = "curve";
  contractName = "CurveSwapBridge";
  dexInterface = "ICurveSwap" as DEXInterface;
}

export class CurveV2 extends Exchange {
  name = "Curve_V2";
  name0x = "Curve_V2";
  nameParaswap = "CurveV2";
  nameKyber = "";
  contractName = "CurveSwapBridge";
  dexInterface = "ICurveV2Swap" as DEXInterface;
}

export class UniswapV3 extends Exchange {
  name = "Uniswap_V3";
  name0x = "Uniswap_V3";
  nameParaswap = "UniswapV3";
  nameKyber = "uniswapv3";
  contractName = "UniswapV3SwapBridge";
  dexInterface = "IUniswapV3Swap" as DEXInterface;

  async buildSwapOutput({
    chainId,
    walletAddress,
    provider,
    path,
    routerOperation,
  }: BuildSwapOutputParams) {
    // {
    //   exchange: {
    //     name: "Uniswap_V3",
    //     name0x: "Uniswap_V3",
    //     nameParaswap: "UniswapV3",
    //     nameKyber: "uniswapv3",
    //     contractName: "UniswapV3SwapBridge",
    //     dexInterface: "IUniswapV3Swap",
    //   },
    //   fraction: 1,
    //   params: {
    //     tokenAddressPath: [
    //       "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
    //       "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
    //     ],
    //     pool: "0x9b08288c3be4f62bbf8d1c20ac9c5e6f9467d8b7",
    //   },
    //   fromToken: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
    //   toToken: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
    // }
    const output = routerOperation;

    const swapRouterAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
    const storeNumberFrom = routerOperation.stores.findOrInitializeStoreIdx({
      address: path.fromToken,
    });
    const storeNumberTo = routerOperation.stores.findOrInitializeStoreIdx({
      address: path.toToken,
    });

    // let approveEncodedCall = ;

    const { data: approveEncodedCall, offset: approveFromOffset } =
      getMagicOffset({
        data: IERC20.encodeFunctionData("approve", [
          swapRouterAddress,
          MAGIC_REPLACER,
        ]),
        magicReplacer: MAGIC_REPLACER,
      });

    output.steps.push({
      stepAddress: path.fromToken,
      stepEncodedCall: approveEncodedCall,
      storeOperations: [
        {
          storeOpType: StoreOpType.RetrieveStoreAssignCall,
          storeNumber: storeNumberFrom,
          offset: approveFromOffset,
          fraction: path.fraction * FRACTION_MULTIPLIER,
        },
      ],
    });

    const block = await provider.getBlock("latest");

    if (block === null) {
      throw new Error("Failed to fetch the latest block");
    }

    if (!path.params.pool) {
      const { data: swapEncodedCall, offset: swapFromOffset } = getMagicOffset({
        data: ISwapRouter.encodeFunctionData("exactInput", [
          path.params.tokenAddressPath, // path
          walletAddress, // recipient
          block.timestamp + 1000, // deadline
          MAGIC_REPLACER, // amountIn
          1, // amountOutMinimum
        ]),
        magicReplacer: MAGIC_REPLACER,
      });

      const { offset: swapToOffset } = getMagicOffset({
        data: ISwapRouter.encodeFunctionResult("exactInput", [MAGIC_REPLACER]),
        magicReplacer: MAGIC_REPLACER,
      });

      output.steps.push({
        stepAddress: swapRouterAddress,
        stepEncodedCall: swapEncodedCall,
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveStoreAssignCallSubtract,
            storeNumber: storeNumberFrom,
            offset: swapFromOffset,
            fraction: path.fraction * FRACTION_MULTIPLIER,
          },
          {
            storeOpType: StoreOpType.RetrieveResultAssignStore,
            storeNumber: storeNumberTo,
            offset: swapToOffset,
            fraction: 0,
          },
        ],
      });
    } else {
      const uniV3Pool = new Contract(path.params.pool, UniV3Pool, provider);

      if (path.params.tokenAddressPath?.length !== 2) {
        throw new Error("Uniswap_V3: tokenAddressPath must have length of 2");
      }

      const { data: swapEncodedCall, offset: swapFromOffset } = getMagicOffset({
        data: ISwapRouter.encodeFunctionData("exactInputSingle", [
          {
            tokenIn: path.params.tokenAddressPath[0], // tokenIn
            tokenOut: path.params.tokenAddressPath[1], // tokenOut
            fee: await uniV3Pool.fee(), // fee
            recipient: walletAddress, // recipient
            deadline: block.timestamp + 100000, // deadline
            amountIn: MAGIC_REPLACER, // amountIn
            amountOutMinimum: 1, // amountOutMinimum
            sqrtPriceLimitX96: 0, // sqrtPriceLimitX96 , max uint160
          },
        ]),
        magicReplacer: MAGIC_REPLACER,
      });

      const { offset: swapToOffset } = getMagicOffset({
        data: ISwapRouter.encodeFunctionResult("exactInputSingle", [
          MAGIC_REPLACER,
        ]),
        magicReplacer: MAGIC_REPLACER,
      });

      output.steps.push({
        stepAddress: swapRouterAddress,
        stepEncodedCall: swapEncodedCall,
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveStoreAssignCallSubtract,
            storeNumber: storeNumberFrom,
            offset: swapFromOffset,
            fraction: path.fraction * FRACTION_MULTIPLIER,
          },
          {
            storeOpType: StoreOpType.RetrieveResultAssignStore,
            storeNumber: storeNumberTo,
            offset: swapToOffset,
            fraction: 0,
          },
        ],
      });
    }

    console.log("Uniswap_V3 buildSwapOutput", {
      path,
      output,
      outputJ: JSON.stringify(output),
    });

    return output;
  }
}

export class Jarvis extends Exchange {
  name = "Jarvis";
  name0x = "";
  nameParaswap = "";
  nameKyber = "";
  contractName = "JarvisV6MintBridge";
  dexInterface = "IJarvisV6Mint" as DEXInterface;
}

export type Aggregator = "0x" | "paraswap" | "kyber";

export type DEXInterface =
  | "IUniswapV2"
  | "ICurveSwap"
  | "IBalancerSwap"
  | "IKyberSwap"
  | "IUniswapV3"
  | "IOneInchBridge";

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

interface UniswapV2Params {
  path: string[];
}

interface BalancerV2Params {
  poolId: string;
  tokenIn: string;
  tokenOut: string;
}

interface JarvisParams {
  poolAddress: string;
  isRedeem: boolean;
}

interface KyberDMMParams {
  poolsPath: string[];
  tokensPath: string[];
}

interface CurveParams {
  poolAddress: string;
  exchangeFunctionSelector: string;
  fromTokenIdx: number;
  toTokenIdx: number;
}

interface UniswapV3Params {
  tokenAddressPath: string[];
  uniswapPath?: string;
  pool?: string;
}

interface DodoV2Params {
  poolAddress: string[];
  directions: number;
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

function getUniswapV2Params(
  aggregator: Aggregator,
  data: any
): UniswapV2Params[] {
  if (aggregator == "0x") {
    return [
      {
        path: data.fillData.tokenAddressPath,
      },
    ];
  } else if (aggregator == "paraswap") {
    return [
      {
        path: data.data.path,
      },
    ];
  } else if (aggregator == "kyber") {
    return [
      {
        path: [data.tokenIn, data.tokenOut],
      },
    ];
  } else {
    // raise error if no aggregator found
    throw new Error("No aggregator found");
  }
}

function getBalancerParams(
  aggregator: Aggregator,
  data: any
): BalancerV2Params[] {
  if (aggregator == "0x") {
    // is it possible to actually have more than 1 swap step here? :x
    return data.fillData.swapSteps.map((swapStep) => {
      return {
        poolId: swapStep.poolId,
        tokenIn: data.fillData.assets[swapStep.assetInIndex],
        tokenOut: data.fillData.assets[swapStep.assetOutIndex],
      };
    });
  } else if (aggregator == "paraswap") {
    return [
      {
        poolId: data.data.swaps[0].poolId,
        tokenIn: data.srcToken,
        tokenOut: data.destToken,
      },
    ];
  } else if (aggregator == "kyber") {
    return [
      {
        poolId: data.poolExtra.poolId,
        tokenIn: data.tokenIn,
        tokenOut: data.tokenOut,
      },
    ];
  } else {
    // raise error if no aggregator found
    throw new Error("No aggregator found");
  }
}

function getKyberDMMParams(
  aggregator: Aggregator,
  data: any
): KyberDMMParams[] {
  if (aggregator == "0x") {
    // is it possible to actually have more than 1 swap step here? :x
    return [
      {
        poolsPath: data.fillData.poolsPath,
        tokensPath: data.fillData.tokenAddressPath,
      },
    ];
  } else if (aggregator == "paraswap") {
    return [
      {
        poolsPath: data.poolAddresses,
        tokensPath: data.data.path,
      },
    ];
  } else if (aggregator == "kyber") {
    return [
      {
        poolsPath: [data.pool],
        tokensPath: [data.tokenIn, data.tokenOut],
      },
    ];
  } else {
    // raise error if no aggregator found
    throw new Error("No aggregator found");
  }
}

function getCurveSelector(
  isUnderlyingSwap: boolean,
  isCurveV2: boolean
): string {
  if (isCurveV2) {
    if (isUnderlyingSwap) {
      return "0x65b2489b";
    } else {
      return "0xa6417ed6";
    }
  } else {
    if (isUnderlyingSwap) {
      return "0xa6417ed6";
    } else {
      return "0x65b2489b";
    }
  }
}

function getCurveParams(aggregator: Aggregator, data: any): CurveParams[] {
  if (aggregator == "0x") {
    return [
      {
        poolAddress: data.fillData.pool.poolAddress,
        exchangeFunctionSelector: data.fillData.pool.exchangeFunctionSelector,
        fromTokenIdx: data.fillData.fromTokenIdx,
        toTokenIdx: data.fillData.toTokenIdx,
      },
    ];
  } else if (aggregator == "paraswap") {
    return [
      {
        poolAddress: data.poolAddresses[0],
        exchangeFunctionSelector: getCurveSelector(
          data.data.underlyingSwap,
          false
        ),
        fromTokenIdx: data.data.i,
        toTokenIdx: data.data.j,
      },
    ];
  } else if (aggregator == "kyber") {
    const extra = data.extra ? data.extra : data.poolExtra;
    return [
      {
        poolAddress: data.pool,
        exchangeFunctionSelector: getCurveSelector(extra.underlying, false),
        fromTokenIdx: extra.tokenInIndex,
        toTokenIdx: extra.tokenOutIndex,
      },
    ];
  } else {
    // raise error if no aggregator found
    throw new Error("No aggregator found");
  }
}

function getCurveV2Params(aggregator: Aggregator, data: any): CurveParams[] {
  if (aggregator == "0x") {
    // is it possible to actually have more than 1 swap step here? :x
    return [
      {
        poolAddress: data.fillData.pool.poolAddress,
        exchangeFunctionSelector: data.fillData.pool.exchangeFunctionSelector,
        fromTokenIdx: data.fillData.fromTokenIdx,
        toTokenIdx: data.fillData.toTokenIdx,
      },
    ];
  } else if (aggregator == "paraswap") {
    return [
      {
        poolAddress: data.poolAddresses[0],
        exchangeFunctionSelector: getCurveSelector(
          data.data.underlyingSwap,
          true
        ), // TODO this work?
        fromTokenIdx: data.data.i,
        toTokenIdx: data.data.j,
      },
    ];
  } else if (aggregator == "kyber") {
    return [
      {
        poolAddress: data.pool,
        exchangeFunctionSelector: getCurveSelector(
          data.poolExtra.underlying,
          true
        ),
        fromTokenIdx: data.poolExtra.tokenInIndex,
        toTokenIdx: data.poolExtra.tokenOutIndex,
      },
    ];
  } else {
    // raise error if no aggregator found
    throw new Error("No aggregator found");
  }
}

function getV3FeeString(fee: number): string {
  const feeString = fee.toString(16);
  return "0".repeat(6 - feeString.length) + feeString;
}

function getUniswapPathFromParaswap(data: any): string {
  let uniswapPath = data.data.path[0].tokenIn;

  for (let i = 0; i < data.data.path.length; i++) {
    uniswapPath += getV3FeeString(data.data.path[i].fee);
    uniswapPath += data.data.path[i].tokenOut.slice(2); // remove 0x
  }

  return uniswapPath;
}

function getTokenAddressPathFromParaswap(data: any): string[] {
  const path = data.data.path;
  const tokenPath = [path[0].tokenIn];

  for (let i = 0; i < data.data.path.length; i++) {
    tokenPath.push(path[i].tokenOut);
  }

  return tokenPath;
}

function getUniswapV3Params(
  aggregator: Aggregator,
  data: any
): UniswapV3Params[] {
  if (aggregator == "0x") {
    if (data.fillData.tokenAddressPath !== undefined) {
      return [
        {
          tokenAddressPath: data.fillData.tokenAddressPath,
          uniswapPath: data.fillData.uniswapPath,
        },
      ];
    } else {
      return [
        {
          tokenAddressPath: [data.takerToken, data.makerToken],
          uniswapPath: data.fillData.path,
        },
      ];
    }
  } else if (aggregator == "paraswap") {
    return [
      {
        tokenAddressPath: getTokenAddressPathFromParaswap(data),
        uniswapPath: getUniswapPathFromParaswap(data),
      },
    ];
  } else if (aggregator == "kyber") {
    return [
      {
        tokenAddressPath: [data.tokenIn, data.tokenOut],
        pool: data.pool,
      },
    ];
  } else {
    // raise error if no aggregator found
    throw new Error("No aggregator found");
  }
}

function getDodoV2Params(aggregator: Aggregator, data: any): DodoV2Params[] {
  if (aggregator == "0x") {
    // is it possible to actually have more than 1 swap step here? :x
    return [
      {
        poolAddress: [data.fillData.poolAddress as string],
        directions: data.fillData.isSellBase ? 0 : 1,
      },
    ];
  } else if (aggregator == "paraswap") {
    return [
      {
        poolAddress: data.data.dodoPairs,
        directions: data.data.directions,
      },
    ];
  } else {
    // raise error if no aggregator found
    throw new Error("No aggregator found");
  }
}

export const exchanges = [
  new OneInch(),
  new QuickSwap(),
  new SushiSwap(),
  new ApeSwap(),
  new Dfyn(),
  new BalancerV2(),
  new KyberDMM(),
  new Curve(),
  new CurveV2(),
  new UniswapV3(),
  new MMFSwap(),
  new MeshSwap(),
  new DodoV2(),
  new Paraswap(),
  new ZeroX(),
];

function filterExchangesByName(exchanges: Exchange[], name: string) {
  return exchanges.filter((exchange) => exchange[name] != null);
}

function getExchangesByName(exchanges: Exchange[], name: string) {
  const result = {};
  filterExchangesByName(exchanges, name).map((exchange) => {
    if (exchange[name] != "") {
      result[exchange[name]] = exchange;
    }
  });
  return result;
}

export const zeroxExchanges = getExchangesByName(exchanges, "name0x");
export const paraswapExchanges = getExchangesByName(exchanges, "nameParaswap");
export const kyberExchanges = getExchangesByName(exchanges, "nameKyber");

export const zeroxNames = Object.keys(zeroxExchanges).join(",");
export const paraswapNames = Object.keys(paraswapExchanges).join(",");
export const kyberNames = Object.keys(kyberExchanges).join(",");
