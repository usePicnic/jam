// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.6;
import "./Router.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract RouterSimulator {
    function simulateJamTx(
        address routerAddress,
        address[] calldata inputTokens,
        uint256[] calldata inputAmounts,
        address[] calldata outputTokens,
        Router.Step[] calldata steps,
        uint256[] memory stores
    ) external returns (uint256[] memory) {
        uint256[] memory previousBalances = new uint[](outputTokens.length);
        for (uint i = 0; i < outputTokens.length; i++) {
            previousBalances[i] = IERC20(outputTokens[i]).balanceOf(
                address(this)
            );
        }

        for (uint i = 0; i < inputTokens.length; i++) {
            IERC20(inputTokens[i]).transferFrom(
                msg.sender,
                address(this),
                inputAmounts[i]
            );
        }

        (bool success, ) = routerAddress.delegatecall(
            abi.encodeWithSelector(Router.runSteps.selector, steps, stores)
        );

        require(success, "Delegatecall failed");

        // uint newBalance = IERC20(outputToken).balanceOf(address(this));
        uint[] memory diffBalances = new uint[](outputTokens.length);
        for (uint i = 0; i < outputTokens.length; i++) {
            diffBalances[i] =
                IERC20(outputTokens[i]).balanceOf(address(this)) -
                previousBalances[i];
        }

        return diffBalances;
    }
}
