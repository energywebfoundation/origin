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
// @authors: slock.it GmbH, Martin Kuechler, martin.kuchler@slock.it

pragma solidity ^0.4.24;

import "../Users/RoleManagement.sol";
import "../Interfaces/Updatable.sol";
import "../Interfaces/AssetDbInterface.sol";

/// @title Contract for storing the current logic-contracts-addresses for the certificate of origin
contract AssetLogic is RoleManagement, Updatable {

    event LogAssetCreated(address _sender, uint indexed _assetId);
    event LogAssetFullyInitialized(uint indexed _assetId);
    event LogAssetSetActive(uint indexed _assetId);
    event LogAssetSetInactive(uint indexed _assetId);

    AssetDbInterface public db;

    modifier isInitialized {
        require(address(db) != 0x0);
        _;
    }

    /**
        external functions
    */
    /// @notice function toinizialize the database, can only be called once
    /// @param _dbAddress address of the database contract
    function init(address _dbAddress) 
        external
        onlyRole(RoleManagement.Role.TopAdmin)
    {
        require(address(db) == 0x0);
        db = AssetDbInterface(_dbAddress);
    }

    /// @notice Sets active to false
    /// @param _assetId The id belonging to an entry in the asset registry
    /// @param _active flag if the asset is asset or not
    function setActive(uint _assetId, bool _active)
        external
        isInitialized
        onlyRole(RoleManagement.Role.AssetAdmin)
    {
       
        db.setActive(_assetId, _active);
        if (_active) {
            emit LogAssetSetActive(_assetId);
        } else {
            emit LogAssetSetInactive(_assetId);
        } 
    }

    /// @notice Updates the logic contract
    /// @param _newLogic Address of the new logic contract
    function update(address _newLogic) 
        external
        onlyAccount(address(cooContract))
    {
        Owned(db).changeOwner(_newLogic);
    }

    /// @notice Changes the address of a smart meter belonging to an asset
    /// @param _assetId The id belonging to an entry in the asset registry
    /// @param _newSmartMeter The address of the new smart meter
    function updateSmartMeter(uint _assetId, address _newSmartMeter)
        external
        isInitialized
        onlyRole(RoleManagement.Role.AssetAdmin)
    {
        db.setSmartMeter(_assetId, _newSmartMeter);
    }

    /// @notice Function to get the amount of all assets
    /// @dev needed to iterate though all the asset
    /// @return the amount of all assets
    function getAssetListLength()
        external
        view 
        returns (uint)
    {
        return db.getAssetListLength();
    }

}