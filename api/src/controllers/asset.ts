import { AssetStore } from "core";
import express from "express";

export const listAssetsController = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const assetStore = new AssetStore();
    const assets = await assetStore.getAssets();
    return res.status(200).json({ assets }).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
};
