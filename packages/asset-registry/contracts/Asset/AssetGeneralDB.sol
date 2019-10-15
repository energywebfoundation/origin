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

import "@energyweb/utils-general/contracts/Msc/Owned.sol";
import "../../contracts/Interfaces/AssetDbInterface.sol";
import "../../contracts/Asset/AssetGeneralStructContract.sol";

/// @title an (abstract) contract for handling all the AssetGeneral-Struct specific tasks in the database contract
/// @notice this funciton provides getter and setter functions for the AssetGeneral-struct.
/// @dev in order to use this contract, inherhit it and implement the abstract functions (e.g. AssetConsumingDB and AssetProducingDB)
contract AssetGeneralDB is Owned, AssetGeneralStructContract, AssetDbInterface {

    /// @notice constructor
    /// @param _assetLogic the AssetLogic-contract-address owning this contract
    constructor(address _assetLogic) Owned(_assetLogic) public { }

    /**
        abstract funcitons to be implemented
     */

    /// @notice gets the AssetGeneral-struct as storage-pointer
    /// @dev function has to be implemented in order to create a deployable bytecode
    /// @param _assetId the assetId of the AssetGeneral-struct to be returned
    /// @return returns a storage pointer to a AssetGeneral struct
    function getAssetGeneralInternal(uint _assetId) internal view returns (AssetGeneral storage general);

    /// @notice gets the amount of onboarded assets
    /// @dev this function has to be implemetned in order to create a deployable bytecode
    /// @return retuns the amount of onboarded assets
    function getAssetListLength() external view returns (uint);

    /**
        external functions
    */

    /// @notice set the flag whether an asset is active
    /// @param _assetId the id of an asset
    /// @param _active the flag whether the asset is active
    function setActive(uint _assetId, bool _active) external onlyOwner {
        getAssetGeneralInternal(_assetId).active = _active;
    }

    /// @notice set the Asset-owner
    /// @param _assetId the id of an asset
    /// @param _owner the new owner address
    function setAssetOwner(uint _assetId, address _owner) external onlyOwner {
        getAssetGeneralInternal(_assetId).owner = _owner;
    }


    /// @notice set the flag whether an asset is bundled to energy
    /// @param _assetId the id of an asset
    /// @param _bundled the bundle flag
    function setIsBundled(uint _assetId, bool _bundled) external onlyOwner {
        getAssetGeneralInternal(_assetId).bundled = _bundled;
    }

    /// @notice set the Last SmartMeterRead File-Hash
    /// @param _assetId the id of an asset
    /// @param _lastSmartMeterReadFileHash the hash of the last meterreading
    function setLastSmartMeterReadFileHash(uint _assetId, string calldata _lastSmartMeterReadFileHash) external onlyOwner {
        getAssetGeneralInternal(_assetId).lastSmartMeterReadFileHash = _lastSmartMeterReadFileHash;
    }

    /// @notice set the new meterreading
    /// @param _assetId the id of an asset
    /// @param _lastSmartMeterReadWh the new meterreadind
    function setLastSmartMeterReadWh(uint _assetId, uint _lastSmartMeterReadWh) external onlyOwner {
        getAssetGeneralInternal(_assetId).lastSmartMeterReadWh = _lastSmartMeterReadWh;
    }

    /// @notice set the meterreading and the filehash at the same time
    /// @dev can be used to save gas-costs when setting a meterreading in the logic contract
    /// @param _assetId the id of an asset
    /// @param _lastSmartMeterReadWh the meterreading
    /// @param _lastSmartMeterReadFileHash the filehash
    function setSmartMeterRead(
        uint _assetId,
        uint _lastSmartMeterReadWh,
        string calldata _lastSmartMeterReadFileHash
    )
        external
        onlyOwner
    {
        AssetGeneral storage general = getAssetGeneralInternal(_assetId);
        general.lastSmartMeterReadWh = _lastSmartMeterReadWh;
        general.lastSmartMeterReadFileHash = _lastSmartMeterReadFileHash;
    }

    /// @notice gets the active flag
    /// @param _assetId the id of an asset
    /// @return flag whether an active is marked as active
    function getActive(uint _assetId) external onlyOwner view returns (bool) {
        return getAssetGeneralInternal(_assetId).active;
    }

    /// @notice gets the AssetGeneral-struct as memory
    /// @param _assetId the id of an asset
    /// @return the AssetGeneral-struct as memory
    function getAssetGeneral(uint _assetId) external onlyOwner view returns (AssetGeneral memory general){
        return getAssetGeneralInternal(_assetId);
    }

    /// @notice gets the bundled-flag of an asset
    /// @param _assetId the id of an asset
    /// @return bundle-flag of an asset
    function getIsBundled(uint _assetId) external onlyOwner view returns (bool) {
        return getAssetGeneralInternal(_assetId).bundled;
    }

    /// @notice gets the last filehash of a meterreading
    /// @param _assetId the id of an asset
    /// @return filehash of the last meterreading
    function getLastSmartMeterReadFileHash(uint _assetId) external onlyOwner view returns (string memory) {
        return getAssetGeneralInternal(_assetId).lastSmartMeterReadFileHash;
    }

    /// @notice gets the current meterreading
    /// @param _assetId the id of an asset
    /// @return the current meterreading
    function getLastSmartMeterReadWh(uint _assetId) external onlyOwner view returns (uint) {
        return getAssetGeneralInternal(_assetId).lastSmartMeterReadWh;
    }

    /// @notice gets the asset-owner
    /// @param _assetId the id of an asset
    /// @return the eth-address of the owner of the asset
    function getAssetOwner(uint _assetId) external onlyOwner view returns (address){
        return getAssetGeneralInternal(_assetId).owner;
    }

    /// @notice gets the last meterreading and its filehash
    /// @dev this function can be used to save gas-costs when calling it
    /// @param _assetId the id of an asset
    /// @return last meterreading and its filehash
    function getLastMeterReadingAndHash(uint _assetId) external onlyOwner view returns (uint _lastSmartMeterReadWh, string memory _lastSmartMeterReadFileHash) {
        AssetGeneral memory general = getAssetGeneralInternal(_assetId);
        _lastSmartMeterReadWh = general.lastSmartMeterReadWh;
        _lastSmartMeterReadFileHash = general.lastSmartMeterReadFileHash;
    }

    /// @notice gets the smartmeter of an asset
    /// @param _assetId the id of an asset
    /// @return eth-address of the smartmeter
    function getSmartMeter(uint _assetId) external onlyOwner view returns (address){
        return getAssetGeneralInternal(_assetId).smartMeter;
    }
}
