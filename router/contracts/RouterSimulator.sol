// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.6;
import "./Router.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract RouterSimulator {
    function simulateJamTx(
        address routerAddress,
        address inputToken,
        uint256 inputAmount,
        address outputToken,
        Router.Step[] calldata steps,
        uint256[] memory stores
    ) external returns (uint256) {
        uint previousBalance = IERC20(outputToken).balanceOf(address(this));

        IERC20(inputToken).transferFrom(msg.sender, address(this), inputAmount);

        (bool success, ) = routerAddress.delegatecall(
            abi.encodeWithSelector(Router.runSteps.selector, steps, stores)
        );

        require(success, "Delegatecall failed");

        uint newBalance = IERC20(outputToken).balanceOf(address(this));
        return newBalance - previousBalance;
    }
}
