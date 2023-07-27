import { expect } from "chai";
import { ethers } from "hardhat";
import constants from "../constants";


const PARASWAP_ABI = [
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_partnerSharePercent",
          type: "uint256",
        },
        { internalType: "uint256", name: "_maxFeePercent", type: "uint256" },
        {
          internalType: "contract IFeeClaimer",
          name: "_feeClaimer",
          type: "address",
        },
        { internalType: "address", name: "_augustusRFQ", type: "address" },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "bytes16",
          name: "uuid",
          type: "bytes16",
        },
        {
          indexed: false,
          internalType: "address",
          name: "partner",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "feePercent",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "address",
          name: "initiator",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "beneficiary",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "srcToken",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "destToken",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "srcAmount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "receivedAmount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "expectedAmount",
          type: "uint256",
        },
      ],
      name: "BoughtV3",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "bytes16",
          name: "uuid",
          type: "bytes16",
        },
        {
          indexed: false,
          internalType: "address",
          name: "partner",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "feePercent",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "address",
          name: "initiator",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "beneficiary",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "srcToken",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "destToken",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "srcAmount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "receivedAmount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "expectedAmount",
          type: "uint256",
        },
      ],
      name: "SwappedV3",
      type: "event",
    },
    {
      inputs: [],
      name: "ROUTER_ROLE",
      outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "WHITELISTED_ROLE",
      outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "augustusRFQ",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "feeClaimer",
      outputs: [
        { internalType: "contract IFeeClaimer", name: "", type: "address" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getKey",
      outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
      stateMutability: "pure",
      type: "function",
    },
    {
      inputs: [{ internalType: "bytes", name: "", type: "bytes" }],
      name: "initialize",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "maxFeePercent",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "partnerSharePercent",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          components: [
            { internalType: "address", name: "fromToken", type: "address" },
            { internalType: "address", name: "toToken", type: "address" },
            { internalType: "uint256", name: "fromAmount", type: "uint256" },
            { internalType: "uint256", name: "toAmount", type: "uint256" },
            { internalType: "uint256", name: "expectedAmount", type: "uint256" },
            { internalType: "address[]", name: "callees", type: "address[]" },
            { internalType: "bytes", name: "exchangeData", type: "bytes" },
            {
              internalType: "uint256[]",
              name: "startIndexes",
              type: "uint256[]",
            },
            { internalType: "uint256[]", name: "values", type: "uint256[]" },
            {
              internalType: "address payable",
              name: "beneficiary",
              type: "address",
            },
            { internalType: "address payable", name: "partner", type: "address" },
            { internalType: "uint256", name: "feePercent", type: "uint256" },
            { internalType: "bytes", name: "permit", type: "bytes" },
            { internalType: "uint256", name: "deadline", type: "uint256" },
            { internalType: "bytes16", name: "uuid", type: "bytes16" },
          ],
          internalType: "struct Utils.SimpleData",
          name: "data",
          type: "tuple",
        },
      ],
      name: "simpleBuy",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [
        {
          components: [
            { internalType: "address", name: "fromToken", type: "address" },
            { internalType: "address", name: "toToken", type: "address" },
            { internalType: "uint256", name: "fromAmount", type: "uint256" },
            { internalType: "uint256", name: "toAmount", type: "uint256" },
            { internalType: "uint256", name: "expectedAmount", type: "uint256" },
            { internalType: "address[]", name: "callees", type: "address[]" },
            { internalType: "bytes", name: "exchangeData", type: "bytes" },
            {
              internalType: "uint256[]",
              name: "startIndexes",
              type: "uint256[]",
            },
            { internalType: "uint256[]", name: "values", type: "uint256[]" },
            {
              internalType: "address payable",
              name: "beneficiary",
              type: "address",
            },
            { internalType: "address payable", name: "partner", type: "address" },
            { internalType: "uint256", name: "feePercent", type: "uint256" },
            { internalType: "bytes", name: "permit", type: "bytes" },
            { internalType: "uint256", name: "deadline", type: "uint256" },
            { internalType: "bytes16", name: "uuid", type: "bytes16" },
          ],
          internalType: "struct Utils.SimpleData",
          name: "data",
          type: "tuple",
        },
      ],
      name: "simpleSwap",
      outputs: [
        { internalType: "uint256", name: "receivedAmount", type: "uint256" },
      ],
      stateMutability: "payable",
      type: "function",
    },
  ];
const PARASWAP_ADDRESS = "0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57"

describe("ParaswapBridge", function(){
  let owner;
  let other;
  let UniswapV2SwapBridge;
  let uniswapV2SwapBridge;
  let wallet;
  let ParaswapBridge;
  let wmaticBridge;

  // const ADDRESSES = constants["POLYGON"];
  const TOKENS = constants["POLYGON"]["TOKENS"];
  
  this.beforeEach(async function() {
        // Get 2 signers to enable to test for permission rights
        [owner, other] = await ethers.getSigners();

        // Instantiate Paraswap bridge
        ParaswapBridge = await ethers.getContractFactory("ParaswapBridge");
        ParaswapBridge = await ParaswapBridge.deploy();

        // Instantiate WMatic bridge
        let WMaticBridge = await ethers.getContractFactory("WMaticWrapBridge");
        wmaticBridge = await WMaticBridge.deploy();

        // Instantiate Wallet
        let Wallet = await ethers.getContractFactory("Wallet");
        wallet = await Wallet.deploy();
  });

  describe("Actions", function() {
    it("Trade WMATIC for USDC", async function () {

        // WMATIC token
        const sellToken = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"
        // USDC token
        const buyToken = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174";
        const sellAmount = ethers.utils.parseEther("1").toString();
        const priceUrl = `https://apiv5.paraswap.io/prices/?srcToken=${sellToken}&destToken=${buyToken}&amount=${sellAmount}&side=SELL&network=137`;

        const req = await fetch(priceUrl);
        const rawBody = await req.json();
        const body = rawBody.priceRoute;
      
        const finalBody = {
          network: body.network,
          srcToken: body.srcToken,
          srcDecimals: body.srcDecimals,
          srcAmount: body.srcAmount,
          destToken: body.destToken,
          destDecimals: body.destDecimals,
          destAmount: body.destAmount, 
          side: body.side,
          priceRoute: body,
          userAddress: "0x6D763ee17cEA70cB1026Fa0F272dd620546A9B9F",
        };

        const transactionsUrl =
        "https://apiv5.paraswap.io/transactions/137?ignoreChecks=true";
    
        const req2 = await fetch(transactionsUrl, {
            method: "POST",
            body: JSON.stringify(finalBody),
            headers: { "Content-Type": "application/json" },
        });
    
        const transactionAPIOutput = await req2.json();

        const paraswap = new ethers.Contract(PARASWAP_ADDRESS ,PARASWAP_ABI);
        
        const functionCallBytes = transactionAPIOutput.data;
        console.log("functionCallBytes", functionCallBytes);
        const decodedFunctionCall = paraswap.interface.parseTransaction({
            data: functionCallBytes,
        });

        const decodedFunctionCallList = decodedFunctionCall.args.slice(0, 15)[0].map((x)=>x);
        
        console.log(decodedFunctionCallList);

        // Set bridges addresses
        var _bridgeAddresses = [wmaticBridge.address, ParaswapBridge.address];

        // Set encoded calls
        var _bridgeEncodedCalls = [
            wmaticBridge.interface.encodeFunctionData("wrap", [100000]),
            ParaswapBridge.interface.encodeFunctionData("swap", [
                PARASWAP_ADDRESS,
                body.tokenTransferProxy,
                decodedFunctionCallList,
                100000,
            ])
        ];
        console.log("_bridgeEncodedCalls", _bridgeEncodedCalls);
        
        // Transfer money to wallet (similar as DeFi Basket contract would have done)
        const transactionHash = await owner.sendTransaction({
          to: wallet.address,
          value: ethers.utils.parseEther("1"), // Sends exactly 1.0 ether
        });
        await transactionHash.wait();

        // Execute bridge calls
        await wallet.useBridges(_bridgeAddresses, _bridgeEncodedCalls);

        // Wallet DAI amount should be 0
        let lpToken = await ethers.getContractAt(
            "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
            TOKENS["USDC"]
        );
        let lpTokenBalance = await lpToken.balanceOf(wallet.address);
        expect(lpTokenBalance).to.be.above(0);
    });
  });
});