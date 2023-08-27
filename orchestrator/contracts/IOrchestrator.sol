pragma solidity ^0.8.6;

interface IOrchestrator {
    function runSteps(
        address[] calldata stepAddresses,
        bytes[] calldata stepEncodedCalls,
        uint256[] calldata stepValues,
        uint256[] memory stores
    ) external;
}
