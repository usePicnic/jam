import express from "express";
import assets from "./asset";
import transaction from "./transaction";

const router = express.Router();

export default (): express.Router => {
  assets(router);
  transaction(router);
  return router;
};
