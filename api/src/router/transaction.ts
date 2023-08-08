import express from "express";

import { generateTransaction } from "../controllers/transaction";

export default (router: express.Router) => {
  router.get("/transaction/generate", generateTransaction);
};
