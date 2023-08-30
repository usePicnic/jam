import { ethers } from "hardhat";
import { expect } from "chai";
import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { BigNumberish } from "ethers";

describe("Orchestrator", function () {
  async function deployTestWallet() {
    const [owner] = await ethers.getSigners();

    const TestWallet = await ethers.getContractFactory("TestWallet");
    const testWallet = await TestWallet.deploy({
      value: ethers.parseEther("1000.0"),
    });

    return { testWallet, owner };
  }

  async function deployOrchestrator() {
    const [owner] = await ethers.getSigners();

    const Orchestrator = await ethers.getContractFactory("Orchestrator");
    const orchestrator = await Orchestrator.deploy();

    return { orchestrator, owner };
  }

  async function getWMatic() {
    const wmatic = await ethers.getContractAt(
      "IWMATIC",
      "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"
    );

    return { wmatic };
  }

  async function getERC20({ address }: { address: string }) {
    const token = await ethers.getContractAt("IERC20", address);

    return { token };
  }

  async function getQuickswap() {
    const quickswap = await ethers.getContractAt(
      "IUniswapV2Router02",
      "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff"
    );

    return { quickswap };
  }

  async function getComet({ address }: { address: string }) {
    const comet = await ethers.getContractAt("IComet", address);

    return { comet };
  }

  it("wMATIC deposit", async function () {
    const { orchestrator } = await loadFixture(deployOrchestrator);

    const { testWallet } = await loadFixture(deployTestWallet);

    const { wmatic } = await loadFixture(getWMatic);

    const value = ethers.parseEther("50.0");

    var stores: string[] = [value.toString()];

    var steps = [
      {
        stepAddress: await wmatic.getAddress(),
        stepEncodedCall: wmatic.interface.encodeFunctionData("deposit"),
        storeOperations: [
          { storeOpType: 1, storeNumber: 0, offset: 0, fraction: 0 },
        ],
      },
    ];

    var encodedCall = orchestrator.interface.encodeFunctionData("runSteps", [
      steps,
      stores,
    ]);

    await testWallet.runSteps(await orchestrator.getAddress(), encodedCall);

    const wmaticBalance = await wmatic.balanceOf(await testWallet.getAddress());

    expect(wmaticBalance).to.equal(ethers.parseEther("50.0"));
    // testWallet.expect(await testWallet.balanceOf(owner.address)).to.equal(1000);
  });

  it("wMATIC deposit, swap WMATIC to USDC on Quickswap", async function () {
    const { orchestrator } = await loadFixture(deployOrchestrator);

    const { testWallet } = await loadFixture(deployTestWallet);

    const { wmatic } = await loadFixture(getWMatic);
    const { quickswap } = await loadFixture(getQuickswap);

    const value = ethers.parseEther("50.0");

    var stores: BigNumberish[] = [value.toString()];

    var steps = [
      {
        stepAddress: await wmatic.getAddress(),
        stepEncodedCall: wmatic.interface.encodeFunctionData("deposit"),
        storeOperations: [
          { storeOpType: 1, storeNumber: 0, offset: 0, fraction: 0 },
        ],
      },
      {
        stepAddress: await wmatic.getAddress(),
        stepEncodedCall: wmatic.interface.encodeFunctionData("approve", [
          "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
          value,
        ]),
        storeOperations: [],
      },
      {
        stepAddress: await quickswap.getAddress(),
        stepEncodedCall: quickswap.interface.encodeFunctionData(
          "swapExactTokensForTokens",
          [
            value,
            0,
            [
              "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
              "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
            ],
            await testWallet.getAddress(),
            (await time.latest()) + 10000,
          ]
        ),
        storeOperations: [],
      },
    ];

    var encodedCall = orchestrator.interface.encodeFunctionData("runSteps", [
      steps,
      stores,
    ]);

    await testWallet.runSteps(await orchestrator.getAddress(), encodedCall);

    const { token: usdc } = await getERC20({
      address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    });

    const usdcBalance = await usdc.balanceOf(await testWallet.getAddress());

    console.log({ usdcBalance });

    expect(usdcBalance).to.greaterThan(0);
  });

  it("wMATIC deposit, swap WMATIC to USDC on Quickswap, supply liquidity on Compound", async function () {
    const { orchestrator } = await loadFixture(deployOrchestrator);

    const { testWallet } = await loadFixture(deployTestWallet);

    const { wmatic } = await loadFixture(getWMatic);
    const { quickswap } = await loadFixture(getQuickswap);
    const { comet } = await getComet({
      address: "0xF25212E676D1F7F89Cd72fFEe66158f541246445", // Compound USDC (cUSDCv3)
    });
    const { token: usdc } = await getERC20({
      address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    });

    const value = ethers.parseEther("50.0");

    var stores: BigNumberish[] = [value.toString(), 0];

    var steps = [
      {
        stepAddress: await wmatic.getAddress(),
        stepEncodedCall: wmatic.interface.encodeFunctionData("deposit"),
        storeOperations: [
          { storeOpType: 1, storeNumber: 0, offset: 0, fraction: 0 },
        ],
      },
      {
        stepAddress: await wmatic.getAddress(),
        stepEncodedCall: wmatic.interface.encodeFunctionData("approve", [
          "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
          value,
        ]),
        storeOperations: [],
      },
      {
        stepAddress: await quickswap.getAddress(),
        stepEncodedCall: quickswap.interface.encodeFunctionData(
          "swapExactTokensForTokens",
          [
            value,
            0,
            [
              "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
              "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
            ],
            await testWallet.getAddress(),
            (await time.latest()) + 10000,
          ]
        ),
        storeOperations: [
          {
            storeOpType: 3,
            storeNumber: 1,
            offset: 32 + 32 + 32 * (2 - 1),
            fraction: 0,
          },
        ],
      },
      {
        stepAddress: await usdc.getAddress(),
        stepEncodedCall: usdc.interface.encodeFunctionData("approve", [
          await comet.getAddress(),
          0,
        ]),
        storeOperations: [
          {
            storeOpType: 2,
            storeNumber: 1,
            offset: 4 + 32,
            fraction: 1,
          },
        ],
      },

      {
        stepAddress: await comet.getAddress(),
        stepEncodedCall: comet.interface.encodeFunctionData("supply", [
          "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
          0,
        ]),
        storeOperations: [
          {
            storeOpType: 2,
            storeNumber: 1,
            offset: 4 + 32,
            fraction: 1,
          },
        ],
      },
    ];

    var encodedCall = orchestrator.interface.encodeFunctionData("runSteps", [
      steps,
      stores,
    ]);

    await testWallet.runSteps(await orchestrator.getAddress(), encodedCall);

    const usdcBalance = await usdc.balanceOf(await testWallet.getAddress());
    const cometBalance = await comet.balanceOf(await testWallet.getAddress());

    console.log({ usdcBalance, cometBalance });

    expect(cometBalance).to.greaterThan(0);
  });
});
