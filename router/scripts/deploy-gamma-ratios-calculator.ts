import { ethers } from "hardhat";

async function main() {
  const gammaRatiosCalculator = await ethers.deployContract(
    "GammaRatiosCalculator",
    []
  );

  await gammaRatiosCalculator.waitForDeployment();
  console.log(
    `GammaRatiosCalculator deployed to ${gammaRatiosCalculator.target}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
