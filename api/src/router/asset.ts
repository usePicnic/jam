import express from "express";

import { listAssets } from "../controllers/asset";

export default (router: express.Router) => {
  router.get("/assets/list", listAssets);
};
