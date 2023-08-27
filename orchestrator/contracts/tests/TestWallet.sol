// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
import "hardhat/console.sol";

contract TestWallet {
    constructor() payable {}

    function runSteps(address runAddress, bytes calldata encodedCall) external {
        bool isSuccess;
        bytes memory result;

        (isSuccess, result) = runAddress.delegatecall(encodedCall);

        // Assembly code was the only way we found to display clean revert error messages from delegate calls
        if (!isSuccess) {
            assembly {
                let ptr := mload(0x40)
                let size := returndatasize()
                returndatacopy(ptr, 0, size)
                revert(ptr, size)
            }
        }

        // console.logBytes(result);
    }
}
