// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// import "./IMaestro.sol";

// Uncomment this line to use console.log
import "hardhat/console.sol";

//  is IMaestro
contract Maestro {
    // This function takes the original ABI-encoded calldata `encodedCall`,
    // the offset at which you want to replace data, and the new data you want to insert.
    function modifyCallData(
        bytes memory encodedCall,
        uint256 offset,
        uint256 newData
    ) public pure returns (bytes memory) {
        require(offset + 32 <= encodedCall.length, "Invalid offset"); // Make sure the offset is within bounds

        bytes32 dataBytes = bytes32(newData); // Convert uint256 to bytes32

        for (uint256 i = 0; i < 32; i++) {
            // Replace 32 bytes starting at the given offset with the new data.
            encodedCall[offset + i] = dataBytes[i];
        }

        return encodedCall;
    }

    // Gets the result of a call at a given offset, returns a uint256
    function getResultOffset(
        bytes memory result,
        uint256 offset
    ) public pure returns (uint256) {
        require(offset + 32 <= result.length, "Invalid offset"); // Make sure the offset is within bounds

        uint256 resultUint256;

        assembly {
            resultUint256 := mload(add(result, add(offset, 0x20)))
        }

        return resultUint256;
    }

    struct StoreOperation {
        uint16 storeOpType;
        // Type 1: Retrieve store and assign to value
        // - retrieve store value at "storeNumber", multiply by "fraction", (((subtract result))) and set "value"
        // Type 2: Retrieve store and assign to encodedCall
        // - retrieve store value at "storeNumber", multiply by "fraction", (((subtract result))) and set "offset" at "stepEncodedCall"
        // Type 3: Retrieve result and assign to store
        // - retrieve result value at "offset" of "result" and add to "storeNumber"
        uint256 storeNumber;
        uint256 offset;
        uint256 fraction;
    }

    // Step 2: Define a struct for the outer array element
    struct Step {
        address stepAddress;
        bytes stepEncodedCall;
        StoreOperation[] storeOperations;
    }

    function runSteps(Step[] calldata steps, uint256[] memory stores) external {
        require(steps.length > 0, "MAESTRO: INVALID LENGTHS");

        bool isSuccess;
        bytes memory result;

        for (uint16 i = 0; i < steps.length; i++) {
            uint256 value = 0;
            // bytes encodedCall = new bytes(steps[i].stepEncodedCall.length);
            bytes memory encodedCall = steps[i].stepEncodedCall;

            for (uint16 j = 0; j < steps[i].storeOperations.length; j++) {
                if (steps[i].storeOperations[j].storeOpType == 1) {
                    value = stores[steps[i].storeOperations[j].storeNumber];
                } else if (steps[i].storeOperations[j].storeOpType == 2) {
                    encodedCall = modifyCallData(
                        encodedCall,
                        steps[i].storeOperations[j].offset,
                        stores[steps[i].storeOperations[j].storeNumber]
                    );
                }
            }

            if (value > 0) {
                (isSuccess, result) = steps[i].stepAddress.call{value: value}(
                    encodedCall
                );
            } else {
                (isSuccess, result) = steps[i].stepAddress.call(encodedCall);
            }

            if (!isSuccess) {
                assembly {
                    let ptr := mload(0x40)
                    let size := returndatasize()
                    returndatacopy(ptr, 0, size)
                    revert(ptr, size)
                }
            }

            for (uint16 j = 0; j < steps[i].storeOperations.length; j++) {
                if (steps[i].storeOperations[j].storeOpType == 3) {
                    stores[
                        steps[i].storeOperations[j].storeNumber
                    ] += getResultOffset(
                        result,
                        steps[i].storeOperations[j].offset
                    );
                }
            }
        }
    }
}
