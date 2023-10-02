import express from "express";
import { generateTransaction } from "core";
import { loadConfig } from "core";
import { AssetStore } from "core";

export const generateTransactionController = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { chainId, walletAddress, inputAllocation, outputAllocation } =
      req.body;
    console.log({ chainId, walletAddress, inputAllocation, outputAllocation });

    const assetStore = new AssetStore();
    const transaction = await generateTransaction({
      chainId,
      walletAddress,
      assetStore,
      inputAllocation,
      outputAllocation,
    });
    const config = await loadConfig();

    return res
      .status(200)
      .json({
        address: config.networks[chainId].routerAddress,
        transactionData: transaction.getEncodedTransactionData(),
        transactionDetails: transaction.getTransactionDetails(),
      })
      .end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
};
