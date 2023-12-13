import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import router from "./router";

dotenv.config({ path: path.resolve("../.env") });

const app = express();

app.use(cors({ credentials: true }));

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

const PORT = process.env.PORT ?? 8000;

const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}.`);
});

app.use("/", router());
