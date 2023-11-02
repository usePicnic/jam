import { Contract, Provider, ethers } from "ethers";
import {
  generateFHexString,
  getAddressOrProxy,
  getAllowIndex,
  getBalanceIndex,
  isVyper,
} from "core/src/simulation/generate-token-approval-state-diff";
import { Asset } from "../transaction/types";

const MAX_ITER = 1000;
const PICNIC = "0xee13C86EE4eb1EC3a05E2cc3AB70576F31666b3b";
const METHODS = [
  {
    name: "allow",
    index: getAllowIndex,
    contractFunction: "allowance",
    params: ["from", "to"],
  },
  {
    name: "balance",
    index: getBalanceIndex,
    contractFunction: "balanceOf",
    params: ["from"],
  },
];

function generateStateOverrides(
  asset: Asset,
  overridePosition: string,
  value: number
) {
  const address = getAddressOrProxy(asset);

  return {
    [address]: {
      stateDiff: {
        [overridePosition]: generateFHexString(value),
      },
    },
  };
}

async function ethCallWithFallback(
  asset,
  from,
  provider,
  overridePosition,
  data,
  value = 64
) {
  const stateOverrides = generateStateOverrides(asset, overridePosition, value);
  try {
    return {
      call: await provider.send("eth_call", [
        {
          data,
          from,
          to: asset.address,
        },
        "latest",
        stateOverrides,
      ]),
      maxSize: value,
    };
  } catch (error) {
    if (value === 0) {
      throw error;
    }
    return ethCallWithFallback(
      asset,
      from,
      provider,
      overridePosition,
      data,
      value - 4
    );
  }
}

async function findSlot(asset, provider, data, calcSlotFunction, params) {
  for (let slot = 0; slot < MAX_ITER; slot++) {
    const overridePosition = calcSlotFunction(slot, params);

    const { call, maxSize } = await ethCallWithFallback(
      asset,
      params.from,
      provider,
      overridePosition,
      data
    );

    if (BigInt(call) > 0n) {
      return { slot, maxSize };
    }
  }
  return { slot: -1, maxSize: 64 };
}

type SlotOutput = {
  maxSize: number;
  slot: number;
};

type AssetParams = {
  from: string;
  to: string;
};

type Method = {
  name: string;
  index: (slot: number, params: AssetParams) => string;
  contractFunction: string;
  params: string[];
};

async function simulateSlot(
  provider: Provider,
  asset: Asset,
  contract: any,
  params: AssetParams,
  method: Method
): Promise<SlotOutput> {
  const data = contract.interface.encodeFunctionData(
    method.contractFunction,
    method.params.map((param) => params[param])
  );

  return findSlot(asset, provider, data, method.index, {
    ...params,
    isVyper: isVyper(asset),
  });
}

export async function findSlots({
  asset,
  provider,
}: {
  asset: Asset;
  provider: Provider;
}): Promise<{
  allowSlot: number;
  balanceSlot: number;
  maxSize: number;
}> {
  console.log("finding slots for", {
    symbol: asset.symbol,
    type: asset.type,
    address: asset.address,
  });
  // if (
  //   !asset.active ||
  //   EXCLUDE_TYPES.includes(asset.type) ||
  //   (asset.allowSlot !== undefined && asset.allowSlot >= 0)
  // )
  //   return asset;

  const from = "0x942A7Ca3e11D58566a010FB07018032aFADd50B3";
  const to = PICNIC;

  const abi = [
    "function allowance(address,address) returns (uint256)",
    "function balanceOf(address) returns (uint256)",
  ];

  const contract = new Contract(asset.address, abi, provider);

  const params = {
    from,
    to,
  };

  const { slot: allowSlot, maxSize: allowSize } = await simulateSlot(
    provider,
    asset,
    contract,
    params,
    METHODS[0]
  );

  const { slot: balanceSlot, maxSize: balanceSize } = await simulateSlot(
    provider,
    asset,
    contract,
    params,
    METHODS[1]
  );

  let maxSize;
  if (asset.type === "aaveV3Deposit") {
    maxSize = 40;
  } else {
    maxSize = Math.min(allowSize, balanceSize);
  }

  return { allowSlot, balanceSlot, maxSize };
}
