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

import "../../contracts/Asset/AssetConsumingDB.sol";
import "../../contracts/AssetContractLookup.sol";
import "../../contracts/Asset/AssetLogic.sol";
import "../../contracts/Interfaces/AssetConsumingInterface.sol";

/// @title The logic contract for the consuming asset registration
/// @notice This contract provides the logic that determines how the data is stored
/// @dev Needs a valid AssetConsumingRegistryDB contract to function correctly
contract AssetConsumingRegistryLogic is AssetLogic, AssetConsumingInterface {

    event LogNewMeterRead(
        uint indexed _assetId,
        uint _oldMeterRead,
        uint _newMeterRead,
        uint _timestamp
    );

    /// @notice Constructor
    /// @param _userContractLookup userContract-lookup contract
    /// @param _assetContractLookup assetContract-lookup contracts (that should own this contract)
    constructor(
        UserContractLookupInterface _userContractLookup,
        AssetContractLookupInterface _assetContractLookup
    )
    RoleManagement(_userContractLookup,address (_assetContractLookup))
    public {

    }

    /**
        external functions
    */
    /// @notice Logs meter read
    /// @param _assetId The id belonging to an entry in the asset registry
    /// @param _newMeterRead The current meter read of the asset
    /// @param _lastSmartMeterReadFileHash Last meter read file hash
    function saveSmartMeterRead(uint _assetId, uint _newMeterRead, string calldata _lastSmartMeterReadFileHash, uint _timestamp)
        external
    {
        uint timestamp = _timestamp;

        require(timestamp >= 0, "a timestamp cannot be a negative number");
        require(timestamp <= block.timestamp + 60, "a timestamp cannot be higher than current block time plus 1 min");

        if (timestamp == 0) {
            timestamp = block.timestamp;
        }

        setSmartMeterReadInternal(_assetId, _newMeterRead, _lastSmartMeterReadFileHash, timestamp);
    }

    /// @notice function to get an asset by its id
    /// @param _assetId The id belonging to an entry in the asset registry
    /// @return AssetConsumingDB.Asset-struct
    function getAssetById(uint _assetId)
        external
        view
        returns (
            AssetConsumingDB.Asset memory
        )
    {
        return AssetConsumingDB(address(db)).getAssetById(_assetId);
    }

    /// @notice function to create a new asset
    /// @dev this function will fail when a different onboarded assets already uses the same smartmeter address
    /// @dev this function will fail when the owner does not have the correct rights
    /// @param _smartMeter the smartmeter of the asset
    /// @param _owner the owner of the asset (onboarded user in the user-contracts)
    /// @param _active flag whether this asset is active already
    /// @param _propertiesDocumentHash hash of the documents with the corresponding properties
    /// @param _url address where to find that document
    /// @return returns the asset-id of the newly onboarded asset
    function createAsset(
        address _smartMeter,
        address _owner,
        bool _active,
        string calldata _propertiesDocumentHash,
        string calldata _url
    )
        external
        returns (uint _assetId)
    {
        // in order to avoid "stack too deep" erros we're checking all the modifiers in a seperate function
        checkBeforeCreation(_owner, _smartMeter);

        AssetGeneral memory a = AssetGeneral({
            smartMeter: _smartMeter,
            owner: _owner,
            lastSmartMeterReadWh: 0,
            active: true,
            lastSmartMeterReadFileHash: "",
            propertiesDocumentHash: _propertiesDocumentHash,
            url: _url,
            bundled: false
        });

        AssetConsumingDB.Asset memory _asset = AssetConsumingDB.Asset(
            {assetGeneral: a}
        );

        _assetId = AssetConsumingDB(address(db)).addFullAsset(_asset);
        emit LogAssetCreated(msg.sender,_assetId);
    }

    /// @notice function to get an asset by its smartmeter
    /// @param _smartMeter the smartmeter belonging to an asset
    /// @return AssetConsumingDB.Asset-struct
    function getAssetBySmartMeter(address _smartMeter)
        external
        view
        returns (
            AssetConsumingDB.Asset memory
        )
    {
        return AssetConsumingDB(address(db)).getAssetBySmartMeter(_smartMeter);
    }

    /**
        public functions
    */
    /// @notice function to check whether an asset exists already for the provided smartmeter
    /// @param _smartMeter the smartmeter of the asset ot be deployed
    /// @return true if smartMeter is already in use, false otherwhise
    function checkAssetExist(address _smartMeter) public view returns (bool){
        return checkAssetGeneralExistingStatus(AssetConsumingDB(address(db)).getAssetBySmartMeter(_smartMeter).assetGeneral);
    }

    function checkAssetExistExternal(address _smartMeter) external view returns (bool) {
        return checkAssetExist(_smartMeter);
    }
}