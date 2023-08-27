// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./IOrchestrator.sol";

// Uncomment this line to use console.log
import "hardhat/console.sol";

contract Orchestrator is IOrchestrator {
    function runSteps(
        address[] calldata stepAddresses,
        bytes[] calldata stepEncodedCalls,
        uint256[] calldata stepValues,
        uint256[] memory stores
    ) external override {
        require(
            stepAddresses.length > 0 &&
                stepAddresses.length == stepEncodedCalls.length &&
                stepEncodedCalls.length == stepValues.length,
            "ORCHESTRATOR: INVALID LENGTHS"
        );

        bool isSuccess;
        bytes memory result;

        for (uint16 i = 0; i < stepAddresses.length; i++) {
            if (stepValues[i] > 0) {
                (isSuccess, result) = stepAddresses[i].call{
                    value: stepValues[i]
                }(stepEncodedCalls[i]);
            } else {
                (isSuccess, result) = stepAddresses[i].call(
                    stepEncodedCalls[i]
                );
            }

            if (!isSuccess) {
                assembly {
                    let ptr := mload(0x40)
                    let size := returndatasize()
                    returndatacopy(ptr, 0, size)
                    revert(ptr, size)
                }
            }

            console.logBytes(result);
        }
    }
}
