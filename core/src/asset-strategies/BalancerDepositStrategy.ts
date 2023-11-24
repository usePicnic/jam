import { RequestTree } from "../transaction/get-prices-and-linked-assets";
import {
  Asset,
  AssetStore,
  StoreOpType,
  StoreOperations,
} from "../transaction/types";
import {
  fetchPriceData,
  getPrice,
} from "../transaction/asset-type-strategies-helpers";
import {
  MAGIC_REPLACERS,
  getMagicOffsets,
} from "core/src/utils/get-magic-offset";
import { IComposableStablePool, IERC20, IVault } from "core/src/abis";
import {
  FRACTION_MULTIPLIER,
  MAGIC_REPLACER_0,
} from "core/src/utils/get-magic-offset";
import {
  FetchPriceDataParams,
  GetPriceParams,
  GenerateStepParams,
} from "./InterfaceStrategy";
import { InterfaceStrategy } from "./InterfaceStrategy";
import { AbiCoder, Contract, formatUnits } from "ethers";

const vaultAddress = "0xBA12222222228d8Ba445958a75a0704d566BF2C8";

export class BalancerDepositStrategy extends InterfaceStrategy {
  async getBalancerSupply({
    balancer,
    asset,
    selfIndex,
    bpt,
  }: {
    balancer: Contract;
    asset: Asset;
    selfIndex: number;
    bpt: Contract;
  }) {
    const totalSupply = await bpt.totalSupply();

    const poolTokens = await balancer.getPoolTokens(asset.callParams.poolId);
    const balSupply = poolTokens[1][selfIndex];

    const balancerSupply = totalSupply - balSupply;

    return balancerSupply;
  }

  async getBalancerPoolTokens({
    balancer,
    asset,
    selfIndex,
  }: {
    balancer: Contract;
    asset: Asset;
    selfIndex: number;
  }) {
    const poolTokens = await balancer.getPoolTokens(asset.callParams.poolId);
    console.log({
      poolTokens,
      ret: [
        poolTokens[0]
          .slice(0, selfIndex)
          .concat(poolTokens[0].slice(selfIndex + 1)),
        poolTokens[1]
          .slice(0, selfIndex)
          .concat(poolTokens[1].slice(selfIndex + 1)),
      ],
    });

    // TODO Refactor
    return [
      poolTokens[0]
        .slice(0, selfIndex)
        .concat(poolTokens[0].slice(selfIndex + 1)),
      poolTokens[1]
        .slice(0, selfIndex)
        .concat(poolTokens[1].slice(selfIndex + 1)),
    ];
  }

  getSelfIndex({
    asset,
    assetStore,
  }: {
    asset: Asset;
    assetStore: AssetStore;
  }): { selfIndex: number; orderedAddresses: string[] } {
    let addresses = [];
    addresses.push(asset.address);
    asset.linkedAssets.map((linkedAsset) => {
      const asset = assetStore.getAssetById(linkedAsset.assetId);
      addresses.push(asset.address);
    });
    addresses = addresses.sort();
    return {
      selfIndex: addresses.indexOf(asset.address),
      orderedAddresses: addresses,
    };
  }

  fetchPriceData({ provider, assetStore, asset }: FetchPriceDataParams) {
    const linkedAssets = asset.linkedAssets.map((linkedAsset) =>
      assetStore.getAssetById(linkedAsset.assetId)
    );

    const balancer = new Contract(vaultAddress, IVault, provider);
    const bpt = new Contract(asset.address, IComposableStablePool, provider);

    let requestTree: RequestTree = {};
    requestTree[asset.address] = {};

    const { selfIndex } = this.getSelfIndex({ asset, assetStore });

    requestTree[asset.address].poolTokens = () =>
      this.getBalancerPoolTokens({ balancer, asset, selfIndex });

    requestTree[asset.address].supply = () =>
      this.getBalancerSupply({ balancer, asset, bpt, selfIndex });

    // Underlying Prices
    linkedAssets
      .filter((linkedAsset) => linkedAsset.address != asset.address)
      .map((linkedAsset) => {
        console.log(linkedAsset.address, asset.address);
        const fetchedData = fetchPriceData({
          provider,
          assetStore,
          asset: linkedAsset,
        });
        requestTree = {
          ...requestTree,
          ...fetchedData,
        };
      });

    return requestTree;
  }

  getPrice({ assetStore, asset, requestTree }: GetPriceParams) {
    // const linkedAsset = assetStore.getAssetById(asset.linkedAssets[0].assetId);
    // return getPrice({ assetStore, asset: linkedAsset, requestTree });

    const [addresses, amounts] = requestTree[asset.address].poolTokens;
    let tvl = 0;

    console.log({ addresses, amounts });

    addresses
      .filter((address) => address != asset.address)
      .map((address, i) => {
        const linkedAsset = assetStore.getAssetByAddress(address);
        tvl +=
          getPrice({ assetStore, asset: linkedAsset, requestTree }) *
          Number(formatUnits(amounts[i], linkedAsset.decimals));
      });

    console.log({ tvl, supply: requestTree[asset.address].supply });

    const supply = Number(
      formatUnits(requestTree[asset.address].supply, asset.decimals)
    );

    const price = tvl / supply;
    console.log({ tvl, supply, price });

    return price;
  }

  async generateStep({
    assetAllocation,
    assetStore,
    walletAddress,
    value,
    currentAllocation,
    routerOperation,
  }: GenerateStepParams) {
    const asset = assetStore.getAssetById(assetAllocation.assetId);
    if (asset.linkedAssets.length < 2) {
      throw new Error(
        `BalancerDepositStrategy: asset ${asset.id} should have at least two linked assets`
      );
    }

    const linkedAssets = asset.linkedAssets.map((la) =>
      assetStore.getAssetById(la.assetId)
    );

    const storeNumberPool = routerOperation.stores.findOrInitializeStoreIdx({
      assetId: asset.id,
    });
    const storeNumbersLinkedAssets = linkedAssets.map((linkedAsset) =>
      routerOperation.stores.findOrInitializeStoreIdx({
        assetId: linkedAsset.id,
      })
    );

    if (assetAllocation.fraction > 0) {
      const storeNumberTmp = routerOperation.stores.findOrInitializeStoreIdx({
        tmpStoreName: `${asset.id} tmp store 0`,
      });

      const linkedAssetFractions = asset.linkedAssets.map((la, i) => {
        const currentFraction = currentAllocation.getAssetById({
          assetId: la.assetId,
        }).fraction;
        const newFraction =
          la.fraction !== 0 ? la.fraction / currentFraction : 0;
        const variation = currentFraction * newFraction;

        console.log({
          currentFraction,
          laFraction: la.fraction,
          newFraction,
          variation,
        });

        currentAllocation.updateFraction({
          assetId: la.assetId,
          delta: -variation,
        });
        currentAllocation.updateFraction({
          assetId: asset.id,
          delta: variation,
        });

        return newFraction;
      });

      const linkedAssetAddresses = asset.linkedAssets.map(
        (la) => assetStore.getAssetById(la.assetId).address
      );

      console.log({
        storeNumberPool,
        storeNumbersLinkedAssets,
        linkedAssetFractions,
        linkedAssetAddresses,
      });
      // const storeNumberFrom = routerOperation.stores.findOrInitializeStoreIdx({
      //   assetId: linkedAsset.id,
      // });
      // const storeNumberTo = routerOperation.stores.findOrInitializeStoreIdx({
      //   assetId: asset.id,
      // });
      // const storeNumberTmp = routerOperation.stores.findOrInitializeStoreIdx({
      //   tmpStoreName: `${asset.id} tmp store 0`,
      // });
      // const currentFraction = currentAllocation.getAssetById({
      //   assetId: linkedAsset.id,
      // }).fraction;
      // const newFraction = asset.linkedAssets[0].fraction / currentFraction;
      // const variation = currentFraction * newFraction;
      // currentAllocation.updateFraction({
      //   assetId: linkedAsset.id,
      //   delta: -variation,
      // });
      // currentAllocation.updateFraction({
      //   assetId: asset.id,
      //   delta: variation,
      // });

      for (const [i, linkedAsset] of linkedAssets.entries()) {
        if (linkedAssetFractions[i] === 0) {
          continue;
        }

        const { data: approveEncodedCall, offsets: approveFromOffsets } =
          getMagicOffsets({
            data: IERC20.encodeFunctionData("approve", [
              vaultAddress,
              MAGIC_REPLACER_0,
            ]),
            magicReplacers: [MAGIC_REPLACER_0],
          });
        routerOperation.steps.push({
          stepAddress: linkedAsset.address,
          stepEncodedCall: approveEncodedCall,
          storeOperations: [
            {
              storeOpType: StoreOpType.RetrieveStoreAssignCall,
              storeNumber: storeNumbersLinkedAssets[i],
              offset: approveFromOffsets[0],
              fraction: Math.round(
                FRACTION_MULTIPLIER * linkedAssetFractions[i]
              ),
            },
          ],
        });
      }

      const { offsets: balanceOfToOffsets } = getMagicOffsets({
        data: IERC20.encodeFunctionResult("balanceOf", [MAGIC_REPLACER_0]),
        magicReplacers: [MAGIC_REPLACER_0],
      });
      routerOperation.steps.push({
        stepAddress: asset.address,
        stepEncodedCall: IERC20.encodeFunctionData("balanceOf", [
          walletAddress,
        ]),
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveResultAddStore,
            storeNumber: storeNumberTmp,
            offset: balanceOfToOffsets[0],
            fraction: FRACTION_MULTIPLIER,
          },
        ],
      });

      // ordered assets
      // amounts (following same order)
      // selfIndex

      const { selfIndex, orderedAddresses } = this.getSelfIndex({
        asset,
        assetStore,
      });
      console.log({ selfIndex, orderedAddresses });

      const replacers = linkedAssetAddresses.map(() => null);
      console.log({ replacers });
      const amounts = orderedAddresses.map((address) => {
        const linkedAssetIdx = linkedAssets.findIndex(
          (linkedAsset) => linkedAsset.address === address
        );

        console.log({ address, linkedAssetIdx });

        if (linkedAssetIdx === -1) {
          return 0;
        }

        return MAGIC_REPLACERS[linkedAssetIdx];
      });

      console.log({ amounts });

      const amountsMinusSelf = amounts
        .slice(0, selfIndex)
        .concat(amounts.slice(selfIndex + 1));

      const abiCoder = new AbiCoder();
      const userData = abiCoder.encode(
        ["uint256", "uint256[]", "uint256"],
        [
          1, // EXACT_TOKENS_IN_FOR_BPT_OUT
          amountsMinusSelf, // amounts in
          1, // minimumBPT
        ]
      );

      console.log({ selfIndex, amountsMinusSelf, userData });

      const usedReplacers = MAGIC_REPLACERS.slice(0, amountsMinusSelf.length);
      const { data: joinPoolEncodedCall, offsets: joinPoolFromOffsets } =
        getMagicOffsets({
          data: IVault.encodeFunctionData("joinPool", [
            asset.callParams.poolId, // poolId
            walletAddress, // sender
            walletAddress, // recipient
            [
              orderedAddresses, // assets
              amounts, // maxAmountsIn
              userData, // userData
              false, // fromInternalBalance
            ],
          ]),
          magicReplacers: [...usedReplacers, ...usedReplacers], // Each replacer appear once in amounts and once in userData.
        });

      const storeOperations: StoreOperations[] = [];
      console.log({
        storeNumbersLinkedAssets,
        joinPoolEncodedCall,
        joinPoolFromOffsets,
        linkedAssetFractions,
        mreplacers: MAGIC_REPLACERS.slice(0, amountsMinusSelf.length),
      });
      for (const [i] of linkedAssets.entries()) {
        console.log({ i1: i, i2: i + usedReplacers.length });
        storeOperations.push({
          storeOpType: StoreOpType.RetrieveStoreAssignCall,
          storeNumber: storeNumbersLinkedAssets[i],
          offset: joinPoolFromOffsets[i],
          fraction: linkedAssetFractions[i] * FRACTION_MULTIPLIER,
        });
        storeOperations.push({
          storeOpType: StoreOpType.RetrieveStoreAssignCallSubtract,
          storeNumber: storeNumbersLinkedAssets[i],
          offset: joinPoolFromOffsets[i + usedReplacers.length],
          fraction: linkedAssetFractions[i] * FRACTION_MULTIPLIER,
        });
      }

      routerOperation.steps.push({
        stepAddress: vaultAddress,
        stepEncodedCall: joinPoolEncodedCall,
        storeOperations,
      });

      routerOperation.steps.push({
        stepAddress: asset.address,
        stepEncodedCall: IERC20.encodeFunctionData("balanceOf", [
          walletAddress,
        ]),
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveResultAddStore,
            storeNumber: storeNumberPool,
            offset: balanceOfToOffsets[0],
            fraction: FRACTION_MULTIPLIER,
          },
          {
            storeOpType: StoreOpType.SubtractStoreFromStore,
            storeNumber: storeNumberTmp,
            offset: storeNumberPool,
            fraction: FRACTION_MULTIPLIER,
          },
        ],
      });
    } else if (assetAllocation.fraction < 0) {
      const storeNumbersTmp = asset.linkedAssets.map((la, i) => {
        return routerOperation.stores.findOrInitializeStoreIdx({
          tmpStoreName: `${asset.id} tmp store ${i} for ${la.assetId}`,
        });
      });

      const currentFraction = currentAllocation.getAssetById({
        assetId: asset.id,
      }).fraction;
      const newFraction = -assetAllocation.fraction / currentFraction;
      const variation = newFraction * currentFraction;
      asset.linkedAssets.map((la, i) => {
        currentAllocation.updateFraction({
          assetId: la.assetId,
          delta: variation * la.fraction,
        });
        currentAllocation.updateFraction({
          assetId: asset.id,
          delta: -variation * la.fraction,
        });
      });

      const { offsets: balanceOfToOffsets } = getMagicOffsets({
        data: IERC20.encodeFunctionResult("balanceOf", [MAGIC_REPLACER_0]),
        magicReplacers: [MAGIC_REPLACER_0],
      });

      asset.linkedAssets.map((la, i) => {
        const linkedAsset = assetStore.getAssetById(la.assetId);
        routerOperation.steps.push({
          stepAddress: linkedAsset.address,
          stepEncodedCall: IERC20.encodeFunctionData("balanceOf", [
            walletAddress,
          ]),
          storeOperations: [
            {
              storeOpType: StoreOpType.RetrieveResultAddStore,
              storeNumber: storeNumbersTmp[i],
              offset: balanceOfToOffsets[0],
              fraction: FRACTION_MULTIPLIER,
            },
          ],
        });
      });

      const { selfIndex, orderedAddresses } = this.getSelfIndex({
        asset,
        assetStore,
      });
      console.log({ selfIndex, orderedAddresses });

      const linkedAssetAddresses = asset.linkedAssets.map(
        (la) => assetStore.getAssetById(la.assetId).address
      );

      const replacers = linkedAssetAddresses.map(() => null);
      console.log({ replacers });
      const amounts = orderedAddresses.map((address) => {
        // if (address === asset.address) {
        //   return MAGIC_REPLACERS[0]; // TODO: min amount in
        // }

        return 0;
      });

      const abiCoder = new AbiCoder();
      const userData = abiCoder.encode(
        ["uint256", "uint256"],
        [
          2, // EXACT_BPT_IN_FOR_ALL_TOKENS_OUT
          MAGIC_REPLACERS[0], // amounts in
        ]
      );

      const { data: exitPoolEncodedCall, offsets: exitPoolFromOffsets } =
        getMagicOffsets({
          data: IVault.encodeFunctionData("exitPool", [
            asset.callParams.poolId, // poolId
            walletAddress, // sender
            walletAddress, // recipient
            [
              orderedAddresses, // assets
              amounts, // maxAmountsIn
              userData, // userData
              false, // fromInternalBalance
            ],
          ]),
          magicReplacers: [MAGIC_REPLACERS[0]], // Each replacer appear once in amounts and once in userData.
        });

      routerOperation.steps.push({
        stepAddress: vaultAddress,
        stepEncodedCall: exitPoolEncodedCall,
        storeOperations: [
          {
            storeOpType: StoreOpType.RetrieveStoreAssignCallSubtract,
            storeNumber: storeNumberPool,
            offset: exitPoolFromOffsets[0],
            fraction: newFraction * FRACTION_MULTIPLIER,
          },
        ],
      });

      asset.linkedAssets.map((la, i) => {
        const linkedAsset = assetStore.getAssetById(la.assetId);

        routerOperation.steps.push({
          stepAddress: linkedAsset.address,
          stepEncodedCall: IERC20.encodeFunctionData("balanceOf", [
            walletAddress,
          ]),
          storeOperations: [
            {
              storeOpType: StoreOpType.RetrieveResultAddStore,
              storeNumber: storeNumbersLinkedAssets[i],
              offset: balanceOfToOffsets[0],
              fraction: FRACTION_MULTIPLIER,
            },
            {
              storeOpType: StoreOpType.SubtractStoreFromStore,
              storeNumber: storeNumbersTmp[i],
              offset: storeNumbersLinkedAssets[i],
              fraction: FRACTION_MULTIPLIER,
            },
          ],
        });
      });
    }
    return routerOperation;
  }
}
