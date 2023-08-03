// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/utils/Create2.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "./PicnicAccountSafe.sol";
import "@account-abstraction/contracts/interfaces/UserOperation.sol";
import "./proxies/PicnicProxyFactory.sol";

/* solhint-disable no-inline-assembly */
/**
 * A wrapper factory contract to deploy GnosisSafe as an ERC-4337 account contract.
 */
contract PicnicAccountSafeFactory {
    // PicnicAccount public immutable accountImplementation;
    PicnicProxyFactory public immutable proxyFactory;
    address public immutable picnicSafeSingleton;

    constructor(PicnicProxyFactory _proxyFactory, address _picnicSafeSingleton){
        // accountImplementation = new PicnicAccount(_entryPoint);
        proxyFactory = _proxyFactory;
        picnicSafeSingleton = _picnicSafeSingleton;
    }

    /**
     * create an account, and return its address.
     * returns the address even if the account is already deployed.
     * Note that during UserOperation execution, this method is called only if the account is not deployed.
     * This method returns an existing account address so that entryPoint.getSenderAddress() would work even after account creation
     */
    function createAccount(address[] memory owner, address entryPoint, uint256 salt) public returns (address) {
        address addr = getAddress(owner, entryPoint, salt);
        uint codeSize = addr.code.length;
        if (codeSize > 0) {
            return addr;
        }
        return address(proxyFactory.createProxyWithNonce(
            picnicSafeSingleton, getInitializer(owner, entryPoint), salt
        ));
    }

    function getInitializer(address[] memory owner, address entryPoint)
        internal pure returns (bytes memory) {
        uint threshold = 1;
        // address eip4337fallback = eip4337Manager.eip4337Fallback();

        // bytes memory setup4337Modules = abi.encodeCall(
        //     EIP4337Manager.setup4337Modules, (eip4337Manager));

        return abi.encodeCall(PicnicAccountSafe.setupWithEntrypoint, (
            owner,
            threshold,
            address(0),
            bytes("0x"),
            address(0),
            address(0),
            0,
            payable(0),
            entryPoint
        ));

    }

    /**
     * calculate the counterfactual address of this account as it would be returned by createAccount()
     */
    function getAddress(address[] memory owner, address entryPoint, uint256 salt) public view returns (address) {
        bytes memory initializer = getInitializer(owner, entryPoint);
        bytes32 salt2 = keccak256(abi.encodePacked(keccak256(initializer), salt));
        bytes memory deploymentData = abi.encodePacked(proxyFactory.proxyCreationCode(), uint256(uint160(picnicSafeSingleton)));
        return Create2.computeAddress(bytes32(salt2), keccak256(deploymentData), address(proxyFactory));
    }
}
