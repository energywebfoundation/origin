pragma solidity ^0.5.2;

import '@energyweb/issuer/contracts/ERC1155/IERC1155.sol';
import '@energyweb/issuer/contracts/ERC1155/IERC1155TokenReceiver.sol';
import '@energyweb/issuer/contracts/ERC1155/Common.sol';

contract TokenAccount is ERC1155TokenReceiver, CommonConstants {
    address private wallet;

    constructor(address _wallet) public {
        wallet = _wallet;
    }

    function onERC1155Received(
        address _operator,
        address _from,
        uint256 _id,
        uint256 _value,
        bytes calldata _data
    ) external returns (bytes4) {
        IERC1155(msg.sender).safeTransferFrom(address(this), wallet, _id, _value, _data);

        return ERC1155_ACCEPTED;
    }

    function onERC1155BatchReceived(
        address _operator,
        address _from,
        uint256[] calldata _ids,
        uint256[] calldata _values,
        bytes calldata _data
    ) external returns (bytes4) {
        IERC1155(msg.sender).safeBatchTransferFrom(address(this), wallet, _ids, _values, _data);

        return ERC1155_BATCH_ACCEPTED;
    }
}
