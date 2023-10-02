pragma solidity ^0.8.6;

interface IHypervisorRouter {
    function getDepositAmount(
        address pos,
        address token,
        uint256 _deposit
    ) external view returns (uint256 amountStart, uint256 amountEnd);
}
