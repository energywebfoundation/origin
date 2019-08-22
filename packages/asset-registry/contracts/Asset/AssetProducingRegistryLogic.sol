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

import "../Asset/AssetProducingDB.sol";
import "../AssetContractLookup.sol";
import "../Interfaces/OriginMarketContractLookupInterface.sol";

import "../Asset/AssetLogic.sol";
import "@energyweb/utils-general/contracts/Msc/Owned.sol";
import "../Interfaces/AssetProducingInterface.sol";


/// @title The logic contract for the asset registration
/// @notice This contract provides the logic that determines how the data is stored
/// @dev Needs a valid AssetProducingRegistryDB contract to function correctly
contract AssetProducingRegistryLogic is AssetLogic, AssetProducingInterface {

    event LogNewMeterRead(
        uint indexed _assetId,
        uint _oldMeterRead,
        uint _newMeterRead,
        uint _timestamp
    );

    
    /// @notice Constructor
    /// @param _userContractLookup usercontract-lookup-contract
    /// @param _assetContractLookup the asset-lookup-contract
    constructor(
        UserContractLookupInterface _userContractLookup, 
        AssetContractLookupInterface _assetContractLookup
    ) 
        RoleManagement(_userContractLookup, address(_assetContractLookup)) 
        public 
    {
    }

	/// @notice Logs meter read
	/// @param _assetId The id belonging to an entry in the asset registry
	/// @param _newMeterRead The current meter read of the asset
	/// @param _lastSmartMeterReadFileHash Last meter read file hash
    function saveSmartMeterRead(
        uint _assetId,
        uint _newMeterRead,
        string calldata _lastSmartMeterReadFileHash,
        uint _timestamp
    )
        external
        isInitialized
    {
        uint timestamp = _timestamp;

        require(timestamp >= 0, "a timestamp cannot be a negative number");
        require(timestamp <= block.timestamp + 60, "a timestamp cannot be higher than current block time plus 1 min");

        if (timestamp == 0) {
            timestamp = block.timestamp;
        }

        uint createdEnergy = setSmartMeterReadInternal(_assetId, _newMeterRead, _lastSmartMeterReadFileHash, timestamp);

        AssetProducingDB(address(db)).addAssetRead(_assetId, AssetProducingDB.SmartMeterRead({
            energy: createdEnergy,
            timestamp: timestamp
        }));
    }

	/// @notice creates an asset with the provided parameters
	/// @param _smartMeter smartmeter of the asset
	/// @param _owner asset-owner
	/// @param _active flag if the asset is already active
	/// @param _matcher array with matcher addresses
	/// @param _propertiesDocumentHash hash of the document with the properties of an asset
	/// @param _url where to find the documentHash
	/// @param _numOwnerChanges allowed amount of owner-changes of certificates created by the asset
	/// @return generated asset-id
    function createAsset(
        address _smartMeter,
        address _owner,
        bool _active,
        address[] calldata _matcher,
        string calldata _propertiesDocumentHash,
        string calldata _url,
        uint _numOwnerChanges
    )
        external
        returns (uint _assetId)
    {
        checkBeforeCreation(_matcher, _owner, _smartMeter);

        AssetGeneral memory a = AssetGeneral({
            smartMeter: _smartMeter,
            owner: _owner,
            lastSmartMeterReadWh: 0,
            active: true,
            lastSmartMeterReadFileHash: "",
            matcher: _matcher,
            propertiesDocumentHash: _propertiesDocumentHash,
            url: _url,
            marketLookupContract: address(0x0),
            bundled: false
        });

        AssetProducingDB.Asset memory _asset = AssetProducingDB.Asset(
            {assetGeneral: a,
            maxOwnerChanges: _numOwnerChanges
            }
        );

        _assetId =  AssetProducingDB(address(db)).addFullAsset(_asset);

        emit LogAssetCreated(msg.sender, _assetId);

    }

    function getSmartMeterReadsForAsset(uint _assetId)
        external
        view
        returns (
            AssetProducingDB.SmartMeterRead[] memory reads
        )
    {
        return AssetProducingDB(address(db)).getSmartMeterReadsForAsset(_assetId);
    }

	/// @notice Gets an asset
	/// @param _assetId The id belonging to an entry in the asset registry
	/// @return Full informations of an asset
    function getAssetById(uint _assetId)
        external
        view
        returns (
            AssetProducingDB.Asset memory
        )
    {
        return AssetProducingDB(address(db)).getAssetById(_assetId);
    }

	/// @notice gets an asset by its smartmeter
	/// @param _smartMeter smartmeter used for by the asset
	/// @return Asset-Struct
    function getAssetBySmartMeter(address _smartMeter)
        external
        view
        returns (
            AssetProducingDB.Asset memory
        )
    {
        return AssetProducingDB(address(db)).getAssetBySmartMeter(_smartMeter);
    }

	/// @notice checks whether an assets with the provided smartmeter already exists
	/// @param _smartMeter smartmter of an asset
	/// @return whether there is already an asset with that smartmeter
    function checkAssetExist(address _smartMeter) public view returns (bool){
        return checkAssetGeneralExistingStatus(AssetProducingDB(address(db)).getAssetBySmartMeter(_smartMeter).assetGeneral);
    }

    function checkAssetExistExternal(address _smartMeter) external view returns (bool) {
        return checkAssetExist(_smartMeter);
    }


	/// @notice enabes or disables the bundle-functionality
	/// @param _assetId the id of an asset
	/// @param _active whether the asset should use bundle functions
    function setBundleActive(uint _assetId, bool _active) external {

        require(msg.sender == db.getAssetOwner(_assetId),"setBundleActive: not the owner");
        db.setIsBundled(_assetId, _active);
    }
}