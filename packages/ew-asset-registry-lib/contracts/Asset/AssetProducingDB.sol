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

/// @title The Database contract for the Asset Registration
/// @notice This contract only provides getter and setter methods
contract AssetProducingDB is AssetGeneralDB {

    struct Asset {
        AssetGeneral assetGeneral;
        uint maxOwnerChanges;
    }

    struct SmartMeterRead {
        uint energy;
        uint timestamp;
    }

    /// @dev mapping for smartMeter-address => Asset
    mapping(address => Asset) internal assetMapping;

    mapping(address => SmartMeterRead[]) internal assetSmartMeterReadsMapping;
        
    /// @dev list of all the smartMeters already used
    address[] internal smartMeterAddresses;

    constructor(address _assetLogic) AssetGeneralDB(_assetLogic) public {}

	/// @notice gets the assetstruct
	/// @param _assetId the id of an asset
	/// @return the Asset-struct
    function getAssetGeneralInternal(uint _assetId)
        internal
        view
        returns (AssetGeneral storage general)
    {
        return assetMapping[smartMeterAddresses[_assetId]].assetGeneral;
    }

	/// @notice adds a complete sset to the mapping and array
	/// @param _a the complete asset
	/// @return the generated assetId
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

	/// @notice gets amount of already onboarded assets
	/// @return amount of already onboarded assets
    function getAssetListLength() external view returns (uint){
        return smartMeterAddresses.length;
    }

	/// @notice gets an asset by its id
	/// @param _assetId the id of an asset
	/// @return Asset-struct
    function getAssetById(uint _assetId) external view returns (Asset memory) {
        return assetMapping[smartMeterAddresses[_assetId]];
    }

    function getSmartMeterReadsForAsset(uint _assetId) external view returns (SmartMeterRead[] memory) {
        return assetSmartMeterReadsMapping[smartMeterAddresses[_assetId]];
    }

    function addAssetRead(uint _assetId, SmartMeterRead memory _smartMeterRead)
        public
        onlyOwner
    {
        assetSmartMeterReadsMapping[smartMeterAddresses[_assetId]].push(_smartMeterRead);
    }

	/// @notice gets an asset by its smartmeter
	/// @param _smartMeter the smartmeter of an asset
	/// @return Asset-Struct
    function getAssetBySmartMeter(address _smartMeter) external onlyOwner view returns (Asset memory) {
        return assetMapping[_smartMeter];
    }

}
