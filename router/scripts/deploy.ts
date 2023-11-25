import { ethers, run } from "hardhat";

async function main() {
  // Fetch current gas price from the network using JSON-RPC
  const currentGasPriceHex = await ethers.provider.send("eth_gasPrice", []);
  // Convert the hexadecimal string to a BigInt
  const currentGasPrice = BigInt(currentGasPriceHex);
  // Add 1 Gwei (which is 1e9 Wei) to the current gas price
  const adjustedGasPrice = currentGasPrice + BigInt(1e9);

  const router = await ethers.deployContract("Router", [], {
    gasPrice: adjustedGasPrice.toString(),
  });
  await router.waitForDeployment();
  console.log(`Router deployed to ${router.target}`);

  const routerSimulator = await ethers.deployContract("RouterSimulator", [], {
    gasPrice: adjustedGasPrice.toString(),
  });
  await routerSimulator.waitForDeployment();
  console.log(`RouterSimulator deployed to ${routerSimulator.target}`);

  console.log(`Waiting to verify...`);
  await setTimeout(() => {}, 15000);

  const verifyContract = async ({
    address,
    constructorArguments,
  }: {
    address: any;
    constructorArguments: any;
  }) => {
    let verificationSuccess = false;
    while (!verificationSuccess) {
      try {
        await run("verify:verify", {
          address,
          constructorArguments,
        });
        verificationSuccess = true; // Breaks the loop if verification succeeds
        console.log(`Successfully verified contract at ${address}`);
      } catch (e) {
        console.error(
          `Verification failed for ${address}. Retrying in 5 seconds.`
        );
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Waits for 5 seconds before retrying
      }
    }
  };

  await verifyContract({
    address: router.target,
    constructorArguments: [],
  });

  await verifyContract({
    address: routerSimulator.target,
    constructorArguments: [],
  });

  console.log(`Successfully verified contracts`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
