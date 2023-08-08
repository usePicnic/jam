import { getAssets } from "../db/asset";
import express from "express";

export const listAssets = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const assets = await getAssets();
    return res.status(200).json({ assets }).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
};
