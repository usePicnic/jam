import express from "express";
import { listAssetsController } from "./controllers/asset";
import { generateTransactionController } from "./controllers/transaction";

const router = express.Router();

export default (): express.Router => {
  router.get("/assets/list", listAssetsController);
  router.post("/transaction/generate", generateTransactionController);
  return router;
};
