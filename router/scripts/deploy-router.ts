import { ethers } from "hardhat";

async function main() {
  const router = await ethers.deployContract("Router", []);

  await router.waitForDeployment();

  console.log(`Router deployed to ${router.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
