import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import * as tdly from "@tenderly/hardhat-tenderly";
tdly.setup();

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      forking: {
        url: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
      },
    },
    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : undefined,
    },
  },
  etherscan: {
    apiKey: {
      polygon: process.env.ETHERSCAN_KEY as string,
    },
  },
  tenderly: {
    username: "<insert username>",
    project: "<insert project name>",
    privateVerification: false,
  },
};

export default config;
