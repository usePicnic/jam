// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./interfaces/IHypervisorRouter.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract GammaRatiosCalculator {
    function calculateRatios(
        address[] calldata tokens,
        uint256[] memory amountsIn,
        address hypervisorAddress,
        IHypervisorRouter hypervisorRouter
    ) public view returns (uint256, uint256) {
        (uint256 startB, uint256 endB) = hypervisorRouter.getDepositAmount(
            hypervisorAddress,
            tokens[0],
            amountsIn[0]
        );

        (uint256 startA, uint256 endA) = hypervisorRouter.getDepositAmount(
            hypervisorAddress,
            tokens[1],
            amountsIn[1]
        );

        // * 9999 / 10000 is a hack to deal with unprecise math and avoid "improper ratio bug")
        if (startA > amountsIn[0]) {
            return (
                amountsIn[0],
                Math.min(amountsIn[1], (endB * 9999) / 10000)
            );
        } else if (startB > amountsIn[1]) {
            return (
                Math.min(amountsIn[0], (endA * 9999) / 10000),
                amountsIn[1]
            );
        } else {
            return (
                Math.min(amountsIn[0], (endA * 9999) / 10000),
                Math.min(amountsIn[1], (endB * 9999) / 10000)
            );
        }
    }
}
