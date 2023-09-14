# Jam 🍯: Picnic's DeFi Transaction Batcher

An open-source API for enabling multi-step DeFi transactions using ERC4337 wallets.

## Overview

Picnic's DeFi Transaction Batcher is an API designed to simplify complex multi-step DeFi operations into single transactions using the ERC4337 standard. By batching transactions, we aim to enhance user experience and enable developers to integrate more efficient and diverse DeFi functionalities into their projects.

This project is supported by an [Ethereum Foundation grant](https://erc4337.mirror.xyz/hRn_41cef8oKn44ZncN9pXvY3VID6LZOtpLlktXYtmA).

## Key Features

- Batching DeFi transactions in a single step.
- Supporting a wide range of assets.
- Basic and Advanced strategies for DeFi transactions.
  - Basic strategies specify input and output assets - that's it 🪄 - Jam takes care of breaking it down into steps
  - Advanced strategies allow fine-tuned control of how to execute batched transactions, as well as allowing stratagies otherwise not possible.
- Seamless integration with numerous DeFi protocols.
- Works with smart wallets supporting `delegatecall`.

## Strategies Overview

The Jam API offers two core strategies: Basic and Advanced. These strategies are designed to allow developers flexibility and depth in how they intend to execute DeFi operations.

### Basic Strategies

Basic strategies are the most straightforward way to interact with the Jam API. By specifying an initial asset and a desired end asset, you can easily map out a DeFi operation.

**Example: one-to-one swap**

Start with a specific amount of one asset and convert it entirely to another.

Sample input:

```json
{
  "inputAllocation": [
    {
      "assetId": "(asset ID for USDC)",
      "amount": "1000000"
    }
  ],
  "outputAllocation": [
    {
      "assetId": "(asset ID for WETH)",
      "fraction": "1"
    }
  ]
}
```

In this example, you convert `1000000` units of USDC into WETH.

**Example: 1-to-1 stake into pool**

This involves converting an asset into another and staking it into a liquidity pool.

Sample input:

```json
{
  "inputAllocation": [
    { "assetId": "(asset ID for USDC)", "amount": "1000000" }
  ],
  "outputAllocation": [
    { "assetId": "(asset ID for staked WETH-BAL pool)", "fraction": "1" }
  ]
}
```

Without transaction batching, the above example would have necessitated multiple separate transactions.

### Advanced strategies

For DeFi operations that cannot be represented simply by specifying input and output allocations, the Advanced strategies come into play. Here, developers can provide the necessary steps as input.

**Example with flash loan operations:**

This illustrates a scenario where assets are borrowed, lent, and then repaid in quick succession.

Sample input:

```json
{
  "steps": [
    {
      "action": "flashBorrow",
      "assetId": "...",
      "amount": "123424"
    },
    {
      "action": "swap",
      "assetInId": "...",
      "assetOutId": "...",
      "amount": "123424",
      "amountOutStore": "0"
    },
    {
      "action": "swap",
      "assetInId": "...",
      "assetOutId": "...",
      "amountInStore": "0"
    },
    {
      "action": "flashRepay",
      "assetId": "...",
      "amount": "123424"
    }
  ]
}
```

The beauty in offering explicit steps allows for flexibility and granularity for a wide variety of DeFi integrations.

## Understanding Outputs

When you interact with the Jam API, regardless of whether you employ a Basic or Advanced strategy, it provides structured output data. This output delivers the necessary `calldata` to execute the transactions and also elaborates on the sequence of actions to be undertaken.

### General Output Structure

Each output from the Jam API is organized into two primary parts:

1. `calldata`: This is the encoded data required to call a function within a smart contract. It facilitates the transaction execution based on the defined strategy.
2. `steps`: This is an array that details every action within the strategy, in the sequence they need to occur.

For example:

```json
{
  "calldata": "bytes",
  "steps": [
    {
      "action": "swap",
      "assetInId": "asset ID",
      "assetOutId": "asset ID",
      "amount": "amount in wei"
      // ... other relevant parameters
    }
    // ...
  ]
}
```

Each step in the output will specify the action type (e.g., `swap`, `borrow`, `lend`, `addLiquidity`, `stake`, etc.), as well as any associated assets, amounts, or other parameters required for that particular action. These steps serve as a roadmap, guiding developers and users through the entire DeFi operation, from beginning to end.

It's crucial to note that some `steps` might contain specific, pre-defined amounts, especially when the initial action's amount is already known. However, in situations where the precise amount for a step is dependent on the outcome of a previous step (and can't be determined off-chain), Jam employs "stores." These "stores" act as placeholders, starting their count from 0, and are utilized to handle intermediate transaction amounts. Such amounts are then replaced in the `calldata` of subsequent steps that necessitate the specification of exact amounts.

### Some notes about executing `calldata`

It’s important to note that transaction batching requires being executed in a smart wallet with `delegatecall` support.

### Stores

Some `steps` specify absolute amounts, such as when making the initial swap and the exact amount is known. However, more often than not, the input amount of one transaction depends on the exact output amount of the previous transaction, which is impossible to ascertain off-chain. For this reason, the API batcher's `calldata` will invoke a smart contract capable of replacing amounts in such transactions using what we call stores.

"Stores", which start numbering from 0, act as placeholders for intermediate transaction amounts. These amounts are subsequently replaced in the `calldata` of steps that require inputting the exact amount.

## Project Status

Jam is in its developmental phase. By October 2023, we anticipate having a fully functional API in production, supporting the most important DeFi types of actions and integrating with 10+ protocols to support 100+ assets.

## Supported blockchains and protocols

Initially Jam will be integrated with protocols on [Polygon PoS](https://polygon.technology/polygon-pos).

## Contributing

Jam is in its infancy, and we're eagerly looking forward to community contributions. Although we're in the process of structuring our contribution guidelines, we warmly welcome collaborators. Do reach out!

## Roadmap

**August 2023**

- Define architecture - reflect on our experience and learn from other interesting solutions
- Have a proof of concept running
- Integrate with one DEX aggregator
- Integrate one DeFi protocol

**September 2023**

- Refine architecture
- Add more protocols

**October 2023**

- Have a working version - we will be using this API in production on our product
- Cover main DeFi types of actions
- Integrate with 10+ protocols and support 100+ assets

## License

To be defined.

## Contact

For any queries, please contact us at hi@usepicnic.com.

## Disclaimer

This software is still in development, so we strongly recommend not using it for production transactions until it has been more thoroughly tested.

Please stay tuned for more updates as the project evolves.
