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

pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

interface TradableEntityDBInterface {

    /// @notice sets the forSale flag
    /// @param _entityId the id of the tradableEntity
    /// @param _isForSale true/false
    function setForSale(uint _entityId, bool _isForSale) external;

    /// @notice adds an approved address to an entity
    /// @param _entityId the id of the entity
    /// @param _approve the approved address
    function addApprovalExternal(uint _entityId, address _approve) external;

    /// @notice sets the owner of a tradableEntity
    /// @param _entityId the id of the entity
    /// @param _owner the new owner
    function setTradableEntityOwnerExternal(uint _entityId, address _owner) external;

    /// @notice sets a tradable token for an entity
    /// @param _entityId the entityId
    /// @param _token the address of the ERC20 token address
    function setTradableToken(uint _entityId, address _token) external;

    /// @notice sets the onchain direct purchase price
    /// @param _entityId the id of the entity
    /// @param _price the price
    function setOnChainDirectPurchasePrice(uint _entityId, uint _price) external;

    /// @notice removes accepted token and onchain direct purchase price for an entity
    /// @param _entityId the id of the entity
    function removeTokenAndPrice(uint _entityId) external;

    /// @notice sets the flags whether an escrow can transfer the certificates of a company
    /// @param _company the owner of certificates
    /// @param _escrow the escrow address (matcher)
    /// @param _allowed flag whether the escrow is allowed to transfer certificates
    function setOwnerToOperators(address _company, address _escrow, bool _allowed) external;

    /// @notice sets the owner of a tradableEntity and adds approval
    /// @param _entityId the id of the entity
    /// @param _owner the new owner
    /// @param _approve the approved address
    function setTradableEntityOwnerAndAddApproval(uint _entityId, address _owner, address _approve) external;

    /// @notice gets the approved address for an entity
    /// @param _entityId the id of the enitity
    /// @return approved address
    function getApproved(uint256 _entityId) external view returns (address);

    /// @notice gets the balance of an account
    /// @param _owner the account
    /// @return the balance of the account
    function getBalanceOf(address _owner) external view returns (uint);

    /// @notice gets the tradable-token (ERC20) for an entity
    /// @param _entityId the id of the entity
    /// @return the address of a ERC20 token
    function getTradableToken(uint _entityId) external view returns (address);

    /// @notice gets the owner of a tradable entity
    /// @param _entityId the id of the entity
    /// @return the owner of a tradable entity
    function getTradableEntityOwner(uint _entityId) external view returns (address);

    /// @notice gets the onchain direct purchase price for an entity
    /// @param _entityId the id of the entity
    /// @return the onchain direct purchase price for an entity
    function getOnChainDirectPurchasePrice(uint _entityId) external view returns (uint);

    /// @notice gets whether the provided address is an operator/escrow for the company
    /// @param _company the company owning tokens
    /// @param _escrow the provided escrow address
    /// @return whether the provided address is an operator/escrow for the company
    function getOwnerToOperators(address _company, address _escrow) external view returns (bool);

}
