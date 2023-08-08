const { ethers } = require("hardhat");

describe("signature validation", function () {
  let picnicAccountContract: any,
    signerAddress: any,
    signer,
    picnicAccountSafeFactory: any,
    picnicSafeProxyFactory: any;
  before("deploy contracts instances first", async function () {
    const PicnicAccountContract = await ethers.getContractFactory(
      "PicnicAccountSafe"
    );
    picnicAccountContract = await PicnicAccountContract.deploy();
    await picnicAccountContract.deployed();

    const PicnicSafeProxyFactory = await ethers.getContractFactory(
      "PicnicProxyFactory"
    );
    picnicSafeProxyFactory = await PicnicSafeProxyFactory.deploy();
    await picnicSafeProxyFactory.deployed();

    const PicnicAccountSafeFactory = await ethers.getContractFactory(
      "PicnicAccountSafeFactory"
    );
    picnicAccountSafeFactory = await PicnicAccountSafeFactory.deploy(
      picnicSafeProxyFactory.address,
      picnicAccountContract.address
    );

    // await picnicAccountSafeFactory.deployed();

    // get default signer, in Signer abstraction form
    signer = ethers.getSigner();

    // get default signer, but just the address!
    [signerAddress] = await ethers.provider.listAccounts();
  });
  it("should validate signature", async function () {
    // const init = await picnicAccountSafeFactory.createAccount(
    //   ["0x635cd7e327F90245A1697346b0570465cF1dE1E1"],
    //   "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    //   ethers.BigNumber.from(42)
    // );
    // console.log(init);
    const userOpHash =
      "0xce0093b1232dcee824ee7785e3d86c5054c8ba3eb5dd5d143e4312cd56bd229e";
    const userOperation = {
      sender: "0xa5ef1f1F807F7Ec8345C6c9289e3Adb76eeeB237",
      nonce: "0x00",
      initCode:
        "0xd80f5da99136aa5f3d78b6dc3194ec2df7a1692d28ebedc400000000000000000000000000000000000000000000000000000000000000600000000000000000000000005ff137d4b0fdcd49dca30c7cf57e578a026d2789000000000000000000000000000000000000000000000000000000000000002a0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000635cd7e327f90245a1697346b0570465cf1de1e1",
      callData:
        "0xf34308ef000000000000000000000000c358f635fdf0c42f4bca7b088a5952d27ed5da10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e4124719c60000000000000000000000003fa147d6309abeb5c1316f7d8a7d8bd023e0cd80000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000186a0000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000020000000000000000000000002791bca1f2de4661ed88a30c99a7a9449aa84174000000000000000000000000e0b52e49357fd4daf2c15e02058dce6bc0057db400000000000000000000000000000000000000000000000000000000",
      callGasLimit: "0x16e360",
      verificationGasLimit: "0x155cc0",
      preVerificationGas: "0xfde8",
      maxFeePerGas: "0x2a5f6976b2",
      maxPriorityFeePerGas: "0x07e498f300",
      paymasterAndData: "0x",
      signature:
        "0x43d3ff5f82146474a8e1662eb9049aa328d0d6facd35c7f350458f2cbbbc1acf262a0b1c96e29f5939ab21f3e794195be2b0ecee0807ccea38dac6f5b9408f9e1b",
    };
    const validation = await picnicAccountContract._validateSignature(
      userOperation,
      userOpHash
    );
    console.log("validation", validation);
  });
});
