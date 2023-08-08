import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import mongoose from "mongoose";
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
if (!process.env.MONGODB_URI) {
  throw new Error("Missing MONGODB_URI env var");
}

const MONGODB_URI = process.env.MONGODB_URI;

const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}.`);
});
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);
mongoose.connection.on("error", (err: Error) => {
  console.log(err);
});

app.use("/", router());
