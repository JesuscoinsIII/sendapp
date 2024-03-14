// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import {Script, console2} from "forge-std/Script.sol";

abstract contract Helper is Script {
    /**
     * The address of Send token deployed to mainnet and base.
     */
    address constant SEND_TOKEN = 0x3f14920c99BEB920Afa163031c4e47a3e03B3e4A;
    /**
     * The address of the Send manager and deployer on mainnet.
     */
    address constant SEND_DEPLOYER = 0x647eb43401e13e995D89Cf26cD87e68890EE3f89;
    /**
     * Send: Treasury
     * https://etherscan.io/address/0x4bB2f4c771ccB60723a78a974a2537AD339071c7
     *
     */
    address constant SEND_TREASURY_SAFE = 0x05CEa6C36f3a44944A4F4bA39B1820677AcB97EE;
    /**
     * Send: Airdrops
     * https://etherscan.io/address/0x6204Bc0662ccd8a9A762d59fe7906733f251E3b7
     *
     */
    address constant SEND_AIRDROPS_SAFE = 0x077c4E5983e5c495599C1Eb5c1511A52C538eB50;
    /**
     * Send Merkle Drop for Send token distributions on base.
     */
    address constant SEND_MERKLE_DROP = 0x471F9abb65aE7FC0cF0EF745dB234A3896142896;
    /**
     * Send Account Verifier
     * @notice Not deployed yet. TODO: update this address when deployed.
     */
    address constant SEND_VERIFIER = 0xFC65337c9671a7dA063b62dBE6584bC29e6b65b5;
    /**
     * Send Account Verifier Proxy
     * @notice Not deployed yet. TODO: update this address when deployed.
     */
    address constant SEND_VERIFIER_PROXY = 0x5b0A5b6feEc59e93f541cD7fac1677db273bf070;
    /**
     * Send Account Factory
     * @notice Not deployed yet. TODO: update this address when deployed.
     */
    address constant SEND_ACCOUNT_FACTORY = 0x92F9acDa58877431FF3d091D71A9e20Fe1BFf4dd;
    /**
     *
     * Account-Abstraction (EIP-4337) v0.6.0 singleton EntryPoint implementation.
     * https://basescan.org/address/0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
     */
    address constant AA_ENTRY_POINT_V0_6 = 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789;
    /**
     *
     * Account-Abstraction (EIP-4337) v0.7.0 singleton EntryPoint implementation.
     * https://basescan.org/address/0x0000000071727De22E5E9d8BAf0edAc6f37da032
     */
    address constant AA_ENTRY_POINT_V0_7 = 0x0000000071727De22E5E9d8BAf0edAc6f37da032;

    function labels() public {
        vm.label(SEND_TOKEN, "SEND_TOKEN");
        vm.label(SEND_DEPLOYER, "SEND_DEPLOYER");
        vm.label(SEND_TREASURY_SAFE, "SEND_TREASURY_SAFE");
        vm.label(SEND_AIRDROPS_SAFE, "SEND_AIRDROPS_SAFE");
        vm.label(SEND_MERKLE_DROP, "SEND_MERKLE_DROP");
        vm.label(AA_ENTRY_POINT_V0_6, "AA_ENTRY_POINT_V0_6");
        vm.label(AA_ENTRY_POINT_V0_7, "AA_ENTRY_POINT_V0_7");
        vm.label(SEND_VERIFIER, "SEND_VERIFIER");
        vm.label(SEND_VERIFIER_PROXY, "SEND_VERIFIER_PROXY");
        vm.label(SEND_ACCOUNT_FACTORY, "SEND_ACCOUNT_FACTORY");
    }
}
