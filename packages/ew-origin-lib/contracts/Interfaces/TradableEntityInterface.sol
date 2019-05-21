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

interface TradableEntityInterface {


    /// @notice creates a tradable entity
    /// @param _assetId the id of the asset that produced the energy
    /// @param _powerInW the amount of energy produced
    /// @return the id of the newly created entity
    function createTradableEntity(uint _assetId, uint _powerInW) external returns (uint);
    
    /// @notice sets the tradable token (ERC20 contract) for an entity
    /// @param _entityId the id of the entity
    /// @param _tokenContract the ERC20 token contract
    function setTradableToken(uint _entityId, address _tokenContract) external;

    /// @notice sets the onchain direct purchase price for an entity
    /// @param _entityId the id of the entity
    /// @param _price the price of the entity
    function setOnChainDirectPurchasePrice(uint _entityId, uint _price) external;

    /// @notice gets the tradable token (ERC20 contract) for an entity
    /// @param _entityId the id of the entity
    /// @return the address of the ERC20 token contract
    function getTradableToken(uint _entityId) external view returns (address);

    /// @notice gets the onchain direct purchase price for an entity
    /// @param _entityId the id of the entity
    /// @return the onchain direct purchase price for an entity
    function getOnChainDirectPurchasePrice(uint _entityId) external view returns (uint);

    /// @notice returns whether the contracts supports the provided interface-id
    /// @param _interfaceID the interface id
    /// @return true if interaceId == 0x80ac58cd
    function supportsInterface(bytes4 _interfaceID) external view returns (bool);
}
