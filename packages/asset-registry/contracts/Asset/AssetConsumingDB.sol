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
// @authors: slock.it GmbH; Martin Kuechler, martin.kuchler@slock.it; Heiko Burkhardt, heiko.burkhardt@slock.it

pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "../../contracts/Asset/AssetGeneralDB.sol";

/// @title The Database contract for the consuming registration
/// @notice This contract only provides getter and setter methods
contract AssetConsumingDB is AssetGeneralDB {

    struct Asset {
        AssetGeneral assetGeneral;
    }

    /// @dev mapping for smartMeter-address => Asset
    mapping(address => Asset) internal assetMapping;
    /// @dev list of all the smartMeters already used
    address[] internal smartMeterAddresses;

    /// @notice constructor
    /// @param _assetLogic the address of the AssetConsumingRegistryLogic-contract that owns this contract
    constructor(address _assetLogic) AssetGeneralDB(_assetLogic) public {}

    /**
        external functions
     */

    /// @notice function to get an asset by its id
    /// @param _assetId the id of the asset
    /// @return the Asset-struct
    function getAssetById(uint _assetId) external onlyOwner view returns (Asset memory) {
        return assetMapping[smartMeterAddresses[_assetId]];
    }

    /// @notice function to get an asset by its smartmeter
    /// @param _smartMeter the smartmeter of the asset
    /// @return the Asset-struct
    function getAssetBySmartMeter(address _smartMeter) external onlyOwner view returns (Asset memory) {
        return assetMapping[_smartMeter];
    }

    /// @notice function to get the amount of already onboarded assets
    /// @return the amount of assets already deployed
    function getAssetListLength() external onlyOwner view returns (uint){
        return smartMeterAddresses.length;
    }

    /**
        public functions
     */

    /// @notice function to add a new asset to the list of assets
    /// @dev it's using a public-modifier in order to avoid an UnimplementedFeatureError
    /// @return the assetId beloning the asset
    function addFullAsset(Asset memory _a)
        public
        onlyOwner
        returns (uint _assetId)
    {
        _assetId = smartMeterAddresses.length;
        address smartMeter = _a.assetGeneral.smartMeter;
        assetMapping[smartMeter] = _a;
        smartMeterAddresses.push(smartMeter);
    }

    /**
        internal functions
     */

    /// @notice function to get the AssetGeneral-struct part of an asset
    /// @dev internal as we have to pass it as storage
    /// @dev implements abstract funciton of AssetGeneralDB
    /// @param _assetId the id of the asset
    /// @return the AssetGeneral-Struct as storage-pointer
    function getAssetGeneralInternal(uint _assetId)
        internal
        view
        returns (AssetGeneral storage general)
    {
        address smAddress = smartMeterAddresses[_assetId];
        return assetMapping[smAddress].assetGeneral;
    }


}
