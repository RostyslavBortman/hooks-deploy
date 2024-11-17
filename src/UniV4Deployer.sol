// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {PoolManager} from "v4-core/PoolManager.sol";
import {PoolKey} from "v4-core/types/PoolKey.sol";

import {Ownable2Step, Ownable} from "@openzeppelin/contracts/access/Ownable2Step.sol";

contract UniV4Deployer is Ownable2Step {
    event Deployed(address addr);
    event CommissionFeeUpdated(uint256 newFee);
    event CommissionWithdrawn(address indexed receiver, uint256 amount);

    error EmptyBytecode();
    error DeploymentFailed();
    error HookAddressMismatch();
    error InsufficientCommission();
    error NoCommissionToWithdraw();

    PoolManager public manager;
    uint256 public commissionFee;

    constructor(PoolManager initManager) Ownable(msg.sender) {
        manager = initManager;
    }

    /**
     * @dev Sets the commission fee for deploying pools.
     * @param _fee The new commission fee in wei.
     */
    function setCommissionFee(uint256 _fee) external onlyOwner {
        commissionFee = _fee;
        emit CommissionFeeUpdated(_fee);
    }

    /**
     * @dev Withdraws the specified amount of accumulated commission to the specified receiver.
     * @param receiver The address to receive the withdrawn commission.
     * @param amount The amount of commission to withdraw in wei.
     */
    function withdrawCommission(address receiver, uint256 amount) external onlyOwner {
        uint256 balance = address(this).balance;
        if (amount == 0 || amount > balance) {
            revert NoCommissionToWithdraw();
        }
        payable(receiver).transfer(amount);
        emit CommissionWithdrawn(receiver, amount);
    }

    /**
     * @dev Deploys a pool with the given parameters and collects commission.
     * @param key The pool key containing pool parameters.
     * @param sqrtPriceX96 The initial price of the pool.
     * @param hookData Additional data for hooks.
     * @param hookBytecode The bytecode of the hook contract to deploy.
     * @param hookSalt A salt to ensure unique hook contract addresses.
     */
    function deployPoolWithHook(
        PoolKey memory key,
        uint160 sqrtPriceX96,
        bytes calldata hookData,
        bytes memory hookBytecode,
        bytes32 hookSalt
    ) public payable {
        if (msg.value < commissionFee) {
            revert("InsufficientCommission");
        }

        address hook = deployCreate2(hookBytecode, hookSalt);

        // if (address(key.hooks) != hook) {
        //     revert("HookAddressMismatch");
        // }

        // manager.initialize(key, sqrtPriceX96, hookData);
    }

    /**
     * @dev Deploys a contract using CREATE2 with the given bytecode and salt.
     * @param bytecode The bytecode of the contract to deploy.
     * @param salt A salt to ensure unique contract addresses.
     * @return addr The address of the deployed contract.
     */
    function deployCreate2(bytes memory bytecode, bytes32 salt) public returns (address addr) {
        if (bytecode.length == 0) {
            revert EmptyBytecode();
        }

        assembly {
            addr := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
        }

        if (addr == address(0)) {
            revert DeploymentFailed();
        }

        emit Deployed(addr);
    }

    /**
     * @dev Computes the address of a contract deployed using CREATE2.
     * @param bytecode The bytecode of the contract to deploy.
     * @param salt The salt used in the deployment.
     * @return The address where the contract will be deployed.
     */
    function computeAddress(bytes memory bytecode, bytes32 salt) private view returns (address) {
        bytes32 bytecodeHash = keccak256(bytecode);
        bytes32 data = keccak256(
            abi.encodePacked(bytes1(0xff), address(this), salt, bytecodeHash)
        );
        return address(uint160(uint256(data)));
    }
}