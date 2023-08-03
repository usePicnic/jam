// SPDX-License-Identifier: Unlicense
pragma solidity >=0.7.0 <0.9.0;
import "./PicnicWalletProxy.sol";

interface IProxyCreationCallback {
    function proxyCreated(PicnicWalletProxy proxy, address _singleton, bytes calldata initializer, uint256 saltNonce) external;
}