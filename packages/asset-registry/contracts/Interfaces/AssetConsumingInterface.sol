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

/// @title this interface defines the functions of the AssetContractLookup-Contract
interface AssetConsumingInterface {

	/// @notice saves the meterreading
	/// @param _assetId id of an asset
	/// @param _newMeterRead new meterreading in wh
	/// @param _lastSmartMeterReadFileHash filehash
    function saveSmartMeterRead(uint _assetId, uint _newMeterRead, string calldata _lastSmartMeterReadFileHash, uint _timestamp) external;

	/// @notice gets an asset by its id
	/// @param _assetId id of an asset
	/// @return Asset-Consuming-Struct
    function getAssetById(uint _assetId) external view returns (AssetConsumingDB.Asset memory);

	/// @notice gets an asset by its smartmeter
	/// @param _smartMeter smartmeter of an asset
	/// @return Asset-Consuming-Struct
    function getAssetBySmartMeter(address _smartMeter) external view returns (AssetConsumingDB.Asset memory);

    /// @notice creates an asset
	/// @param _smartMeter smartmeter address
	/// @param _owner owner of the asset (eth-address)
	/// @param _active active-flag
	/// @param _matcher matcher-array
	/// @param _propertiesDocumentHash hash of the document with the asset-properties
	/// @param _url where to find the document
	/// @return generated asset-id
    function createAsset(address _smartMeter, address _owner, bool _active, address[] calldata _matcher, string calldata _propertiesDocumentHash, string calldata _url) external returns (uint);

    /// @notice checks whether an asset already exists
	/// @param _smartMeter smartmeter of an asset
	/// @return whether an asset already exists
    function checkAssetExistExternal(address _smartMeter) external view returns (bool);
}
