// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract TestToken is ERC1155 {
    // A nonce to ensure we have a unique id each time we mint.
    uint256 public nonce;

    constructor(string memory _uri) ERC1155(_uri) {}

    // Creates a new token type and assigns _initialSupply to minter
    function create(uint256 _initialSupply, address creator) external returns (uint256 _id) {
        _id = ++nonce;

        ERC1155._mint(creator, _id, _initialSupply, new bytes(0));
    }
}
