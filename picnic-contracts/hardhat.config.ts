import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
// import "solidity-coverage";
// import "hardhat-gas-reporter";
// import "@tenderly/hardhat-tenderly";
import "@nomiclabs/hardhat-etherscan";

require('dotenv').config()
// require('hardhat-contract-sizer');

const gwei = 1000000000;

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.18",
        settings: {
          optimizer: { enabled: true, runs: 200 },
        },
      },
    ],
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      forking: {
        url: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_KEY}`, 
      }
    },
    polygon: {
      url: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
      accounts: {
        mnemonic: process.env.PRIVATE_KEY || ""
      },
      gasPrice: 250*gwei
    }
  },
  mocha: { timeout: '1800000'},
  etherscan: {
    apiKey: process.env.POLYGON_SCAN
  },
};
