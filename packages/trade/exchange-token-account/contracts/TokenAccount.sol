// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import './Common.sol';

contract TokenAccount is ReentrancyGuard, IERC1155Receiver, CommonConstants {
    address private wallet;

    constructor(address _wallet) nonReentrant {
        wallet = _wallet;
    }

    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external override nonReentrant returns (bytes4) {
        IERC1155(msg.sender).safeTransferFrom(address(this), wallet, id, value, data);

        return ERC1155_ACCEPTED;
    }

    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external override nonReentrant returns (bytes4) {
        IERC1155(msg.sender).safeBatchTransferFrom(address(this), wallet, ids, values, data);

        return ERC1155_BATCH_ACCEPTED;
    }

    function supportsInterface(bytes4 interfaceId) public pure override returns (bool) {
        return interfaceId == type(IERC165).interfaceId;
    }
}
