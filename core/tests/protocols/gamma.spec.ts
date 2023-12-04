import { test } from "vitest";
import { simulateRouterOperationHelper } from "./utils";

test("generateTransaction: USDC to USDC/WETH (gammaDeposit)", async () => {
  await simulateRouterOperationHelper({
    chainId: 137,
    inputAllocation: [
      {
        assetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
        amountStr: "1000000000",
      },
    ],
    outputAllocation: [
      {
        assetId: "8da84d12-9e9d-4c04-831d-7b93f1cd822f",
        fraction: 1.0,
      },
    ],
  });
});

test("generateTransaction: USDC to WMATIC/WETH (gammaDeposit)", async () => {
  await simulateRouterOperationHelper({
    chainId: 137,
    inputAllocation: [
      {
        assetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
        amountStr: "1000000000",
      },
    ],
    outputAllocation: [
      {
        assetId: "3c42b7d3-555b-41a4-96b6-ce4fadd62f83",
        fraction: 1.0,
      },
    ],
  });
});

test("generateTransaction: USDC to WMATIC/MaticX (gammaDeposit)", async () => {
  await simulateRouterOperationHelper({
    chainId: 137,
    inputAllocation: [
      {
        assetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
        amountStr: "1000000000",
      },
    ],
    outputAllocation: [
      {
        assetId: "5a5cd640-b972-43b6-9bb2-24e6711ab1db",
        fraction: 1.0,
      },
    ],
  });
});

test("generateTransaction: WMATIC/MaticX (gammaDeposit) to USDC", async () => {
  await simulateRouterOperationHelper({
    chainId: 137,
    inputAllocation: [
      {
        assetId: "5a5cd640-b972-43b6-9bb2-24e6711ab1db",
        amountStr: "1000000000000000000000",
      },
    ],
    outputAllocation: [
      {
        assetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
        fraction: 1.0,
      },
    ],
  });
});

test("generateTransaction: WMATIC/WETH (gammaDeposit) to USDC", async () => {
  await simulateRouterOperationHelper({
    chainId: 137,
    inputAllocation: [
      {
        assetId: "3c42b7d3-555b-41a4-96b6-ce4fadd62f83",
        amountStr: "1000000000000000000",
      },
    ],
    outputAllocation: [
      {
        assetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
        fraction: 1.0,
      },
    ],
  });
});

test("generateTransaction: USDC/WETH (gammaDeposit) to USDC", async () => {
  await simulateRouterOperationHelper({
    chainId: 137,
    inputAllocation: [
      {
        assetId: "8da84d12-9e9d-4c04-831d-7b93f1cd822f",
        amountStr: "1000000000000000000",
      },
    ],
    outputAllocation: [
      {
        assetId: "e251ecf6-48c2-4538-afcd-fbb92424054d",
        fraction: 1.0,
      },
    ],
  });
});

test("generateTransaction: USDC/WETH (gammaDeposit) to WMATIC/MaticX (gammaDeposit)", async () => {
  await simulateRouterOperationHelper({
    chainId: 137,
    inputAllocation: [
      {
        assetId: "8da84d12-9e9d-4c04-831d-7b93f1cd822f",
        amountStr: "1000000000000000000",
      },
    ],
    outputAllocation: [
      {
        assetId: "5a5cd640-b972-43b6-9bb2-24e6711ab1db",
        fraction: 1.0,
      },
    ],
  });
});
