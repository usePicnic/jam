// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// import "./IRouter.sol";

// Uncomment this line to use console.log
import "hardhat/console.sol";

//  is IRouter
contract Router {
    enum StoreOpType {
        // 0: Retrieve store and assign to value
        // - retrieve store value at "storeNumber", multiply by "fraction" and set "value"
        RetrieveStoreAssignValue,
        // 1: Retrieve store and assign to encodedCall
        // - retrieve store value at "storeNumber", multiply by "fraction" and set "offset" at "stepEncodedCall"
        RetrieveStoreAssignCall,
        // 2: Retrieve result and adds to store
        // - retrieve result value at "offset" of "result" and add to "storeNumber"
        RetrieveResultAddStore,
        // 3: Retrieve result and subtracts from store
        // - retrieve result value at "offset" of "result" and subtracts from "storeNumber"
        RetrieveResultSubtractStore,
        // 4: Retrieve store, assign to value and subtract calculated value from store
        // - retrieve store value at "storeNumber", multiply by "fraction" and set "value"
        // - subtracts calculated value from store
        RetrieveStoreAssignValueSubtract,
        // 5: Retrieve store, assign to encodedCall at offset and subtract calculated value from store
        // - retrieve store value at "storeNumber", multiply by "fraction" and set "offset" at "stepEncodedCall"
        // - subtracts calculated value from store
        RetrieveStoreAssignCallSubtract,
        // 6: Subtracts store value from another store
        // - subtracts store value multiplied by "fraction" at store "secondaryStoreNumber" from store at "storeNumber"
        SubtractStoreFromStore,
        // 7: Add store value to another store
        // - adds store value multiplied by "fraction" at store "secondaryStoreNumber" to store at "storeNumber"
        AddStoreToStore
    }

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
        StoreOpType storeOpType;
        uint8 storeNumber;
        uint8 secondaryStoreNumber;
        uint16 offset;
        uint24 fraction;
    }

    // Step 2: Define a struct for the outer array element
    struct Step {
        address stepAddress;
        bytes stepEncodedCall;
        StoreOperation[] storeOperations;
    }

    function runSteps(Step[] calldata steps, uint256[] memory stores) external {
        require(steps.length > 0, "ROUTER: INVALID LENGTHS");

        bool isSuccess;
        bytes memory result;

        for (uint16 i = 0; i < steps.length; i++) {
            uint256 value = 0;
            // bytes encodedCall = new bytes(steps[i].stepEncodedCall.length);
            bytes memory encodedCall = steps[i].stepEncodedCall;

            for (uint16 j = 0; j < steps[i].storeOperations.length; j++) {
                uint256 storeValue = stores[
                    steps[i].storeOperations[j].storeNumber
                ];
                uint256 fraction = steps[i].storeOperations[j].fraction;
                uint256 calculatedValue = 0;
                StoreOpType storeOpType = steps[i]
                    .storeOperations[j]
                    .storeOpType;

                if (
                    storeOpType == StoreOpType.RetrieveStoreAssignValue ||
                    storeOpType == StoreOpType.RetrieveStoreAssignValueSubtract
                ) {
                    calculatedValue = (storeValue * fraction) / 1000000;
                    value = calculatedValue;
                }

                if (
                    storeOpType == StoreOpType.RetrieveStoreAssignCall ||
                    storeOpType == StoreOpType.RetrieveStoreAssignCallSubtract
                ) {
                    calculatedValue = (storeValue * fraction) / 1000000;

                    encodedCall = modifyCallData(
                        encodedCall,
                        steps[i].storeOperations[j].offset,
                        calculatedValue
                    );
                }

                if (
                    storeOpType ==
                    StoreOpType.RetrieveStoreAssignValueSubtract ||
                    storeOpType == StoreOpType.RetrieveStoreAssignCallSubtract
                ) {
                    require(
                        stores[steps[i].storeOperations[j].storeNumber] >=
                            calculatedValue,
                        "Insufficient store value"
                    );
                    stores[
                        steps[i].storeOperations[j].storeNumber
                    ] -= calculatedValue;
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
                if (
                    steps[i].storeOperations[j].storeOpType ==
                    StoreOpType.RetrieveResultAddStore
                ) {
                    stores[
                        steps[i].storeOperations[j].storeNumber
                    ] += getResultOffset(
                        result,
                        steps[i].storeOperations[j].offset
                    );
                } else if (
                    steps[i].storeOperations[j].storeOpType ==
                    StoreOpType.RetrieveResultSubtractStore
                ) {
                    stores[
                        steps[i].storeOperations[j].storeNumber
                    ] -= getResultOffset(
                        result,
                        steps[i].storeOperations[j].offset
                    );
                } else if (
                    steps[i].storeOperations[j].storeOpType ==
                    StoreOpType.SubtractStoreFromStore
                ) {
                    stores[steps[i].storeOperations[j].storeNumber] -=
                        (stores[
                            steps[i].storeOperations[j].secondaryStoreNumber
                        ] * steps[i].storeOperations[j].fraction) /
                        1000000;
                } else if (
                    steps[i].storeOperations[j].storeOpType ==
                    StoreOpType.AddStoreToStore
                ) {
                    stores[steps[i].storeOperations[j].storeNumber] +=
                        (stores[
                            steps[i].storeOperations[j].secondaryStoreNumber
                        ] * steps[i].storeOperations[j].fraction) /
                        1000000;
                }
            }
        }
    }
}
