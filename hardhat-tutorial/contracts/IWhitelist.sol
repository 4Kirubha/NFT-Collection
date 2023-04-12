//SPDX-License-Identifier:MIT
pragma solidity ^0.8.18;

interface IWhitelist{
    function whitelistedAddress(address) external view returns (bool);
}