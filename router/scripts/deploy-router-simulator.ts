import { ethers } from "hardhat";

async function main() {
  const routerSimulator = await ethers.deployContract("RouterSimulator", []);
  await routerSimulator.waitForDeployment();
  console.log(`RouterSimulator deployed to ${routerSimulator.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
