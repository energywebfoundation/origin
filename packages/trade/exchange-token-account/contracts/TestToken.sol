// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract TestToken is ERC1155 {
    constructor(string memory _uri) ERC1155(_uri) {}
}
