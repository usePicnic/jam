import express from "express";

export const generateTransaction = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    return res.status(200).json({ transaction: true }).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
};
