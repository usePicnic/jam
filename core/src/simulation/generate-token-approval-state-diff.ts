import { solidityPackedKeccak256 } from "ethers";
import { Asset } from "../transaction/types";

export function getAllowIndex(allowSlot: number, params: any): string {
  if (params.isVyper) {
    const allowTemp = solidityPackedKeccak256(
      ["uint256", "uint256"],
      [allowSlot, params.from]
    );

    return solidityPackedKeccak256(
      ["uint256", "uint256"],
      [allowTemp, params.to]
    );
  } else {
    const allowTemp = solidityPackedKeccak256(
      ["uint256", "uint256"],
      [params.from, allowSlot]
    );

    return solidityPackedKeccak256(
      ["uint256", "uint256"],
      [params.to, allowTemp]
    );
  }
}

export function getBalanceIndex(balanceSlot: number, params: any): string {
  if (params.isVyper) {
    return solidityPackedKeccak256(
      ["uint256", "uint256"],
      [balanceSlot, params.from]
    );
  } else {
    return solidityPackedKeccak256(
      ["uint256", "uint256"],
      [params.from, balanceSlot]
    );
  }
}

export function getAddressOrProxy(asset: Asset) {
  if (asset?.callParams?.proxy !== undefined) {
    return asset.callParams.proxy;
  } else {
    return asset.address;
  }
}

function repeatString(str: string, times: number) {
  return new Array(times + 1).join(str);
}

export function generateFHexString(size: number, stringLen: number = 64) {
  return "0x" + repeatString("f", size).padStart(stringLen, "0");
}

export function isVyper(asset: Asset) {
  const vyperTypes = ["IGauge", "ICurveLiquidity"];
  return vyperTypes.includes(asset.type);
}

export function generateTokenApprovalStateDiff(
  asset: Asset,
  from: string,
  to: string
) {
  if (asset.allowSlot === undefined || asset.balanceSlot === undefined) {
    throw new Error(
      `Asset allowSlot or balanceSlot are undefined: ${asset.name} ${asset.type} ${asset.address}`
    );
  }
  const allowIndex = getAllowIndex(asset.allowSlot, {
    from,
    to,
    isVyper: isVyper(asset),
  });

  const balanceIndex = getBalanceIndex(asset.balanceSlot, {
    from,
    isVyper: isVyper(asset),
  });

  const address = getAddressOrProxy(asset);
  const size = asset.maxSize || 64;

  const stateDiff = {
    [address]: {
      stateDiff: {
        [allowIndex]: generateFHexString(size),
        [balanceIndex]: generateFHexString(size),
      },
    },
  };

  return stateDiff;
}
