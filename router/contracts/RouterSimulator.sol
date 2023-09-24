// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.6;
import "./Router.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract RouterSimulator {
    function simulateJamTx(
        address routerAddress,
        address inputToken,
        uint256 inputAmount,
        address outputToken,
        Router.Step[] calldata steps,
        uint256[] memory stores
    ) external returns (uint256) {
        Router router = Router(routerAddress);

        IERC20(inputToken).transferFrom(msg.sender, address(this), inputAmount);

        router.runSteps(steps, stores);

        return IERC20(outputToken).balanceOf(address(this));
    }
}
