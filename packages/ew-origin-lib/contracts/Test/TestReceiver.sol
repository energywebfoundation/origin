// Copyright 2018 Energy Web Foundation
// This file is part of the Origin Application brought to you by the Energy Web Foundation,
// a global non-profit organization focused on accelerating blockchain technology across the energy sector,
// incorporated in Zug, Switzerland.
//
// The Origin Application is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// This is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY and without an implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details, at <http://www.gnu.org/licenses/>.
//
// @authors: slock.it GmbH; Martin Kuechler, martin.kuchler@slock.it; Heiko Burkhardt, heiko.burkhardt@slock.it;

pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "../../contracts/Interfaces/ERC721TokenReceiver.sol";
import "../../contracts/Interfaces/ERC721.sol";

contract TestReceiver is ERC721TokenReceiver {

    ERC721 public entityContract;

    constructor(ERC721 _entityContract) public {
        entityContract = _entityContract;
    }

    /// @notice Handle the receipt of an NFT
    /// @dev The ERC721 smart contract calls this function on the recipient
    ///  after a `transfer`. This function MAY throw to revert and reject the
    ///  transfer. Return of other than the magic value MUST result in the
    ///  transaction being reverted.
    ///  Note: the contract address is always the message sender.
    /// @param _operator The address which called `safeTransferFrom` function
    /// @param _from The address which previously owned the token
    /// @param _tokenId The NFT identifier which is being transferred
    /// @param _data Additional data with no specified format
    /// @return `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`
    ///  unless throwing
    function onERC721Received(address _operator, address _from, uint256 _tokenId, bytes calldata _data) external returns(bytes4){
        return bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));
    }

    function safeTransferFrom(address _from, address _to, uint256 _entityId) external payable {

        entityContract.safeTransferFrom(_from, _to, _entityId);
    }

    function safeTransferFrom(address _from, address _to, uint256 _entityId, bytes calldata _data) external payable {

        entityContract.safeTransferFrom(_from, _to, _entityId, _data);
    }
}
