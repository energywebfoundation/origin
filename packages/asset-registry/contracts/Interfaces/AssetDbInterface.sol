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

import "../../contracts/Asset/AssetGeneralStructContract.sol";

/// @title this interface defines the functions that both consuming and producing assets are sharing
interface AssetDbInterface {

	/// @notice gets the AssetGeneral struct of an asset
	/// @param _assetId the id of asset
	/// @return AssetGeneral struct
    function getAssetGeneral(uint _assetId) external view returns (AssetGeneralStructContract.AssetGeneral memory general);

	/// @notice sets the active flag of an asset
	/// @param _assetId the id of an asset
	/// @param _active active flag
    function setActive(uint _assetId, bool _active) external;

	/// @notice gets the active flag of an asset
	/// @param _assetId the id of an asset
	/// @return active flag
    function getActive(uint _assetId) external view returns (bool);

	/// @notice sets a new filehash of a meterreading
	/// @param _assetId the id of an asset
	/// @param _lastSmartMeterReadFileHash new filehash
    function setLastSmartMeterReadFileHash(uint _assetId, string calldata _lastSmartMeterReadFileHash) external;

	/// @notice gets the latest filehash
	/// @param _assetId the id of an sset
	/// @return filehash
    function getLastSmartMeterReadFileHash(uint _assetId) external view returns (string memory);

	/// @notice seta a new meterreading
	/// @param _assetId the id of an asset
	/// @param _lastSmartMeterReadWh the new meterreading
    function setLastSmartMeterReadWh(uint _assetId, uint _lastSmartMeterReadWh) external;

	/// @notice gets the current meterreading
	/// @param _assetId the id of an asset
	/// @return current meterreading
    function getLastSmartMeterReadWh(uint _assetId) external  view returns (uint);

	/// @notice sets the asset owner
	/// @param _assetId the id of an asset
	/// @param _owner the asset-owner
    function setAssetOwner(uint _assetId, address _owner) external;

	/// @notice gets the asset owner
	/// @param _assetId the id of an asset
	/// @return the asset owner
    function getAssetOwner(uint _assetId) external view returns (address);

	/// @notice gets the smart meter
	/// @param _assetId the id of an asset
	/// @return the smartmeter
    function getSmartMeter(uint _assetId) external view returns (address);

	/// @notice gets the bundled flag
	/// @param _assetId the id of an asset
	/// @return the bundled flag
    function getIsBundled(uint _assetId) external view returns (bool);

	/// @notice sets the bundled flag
	/// @param _assetId the id of an asset
	/// @param _bundled bundled flag
    function setIsBundled(uint _assetId, bool _bundled) external;

	/// @notice set the marketLookup contract
	/// @param _assetId the id of an asset
	/// @param _marketLookupContract new marketLookup contract
    function setMarketLookupContract(uint _assetId, address _marketLookupContract) external;

	/// @notice gets the marketLookup contract
	/// @param _assetId the id of an asset
	/// @return the marketcontract lookup
    function getMarketLookupContract(uint _assetId) external view returns (address);

	/// @notice sets a new meterreading and its filehash
	/// @param _assetId the id of an asset
	/// @param _lastSmartMeterReadWh meterreading in Wh
	/// @param _lastSmartMeterReadFileHash filehash of the meterreading
	function setSmartMeterRead(uint _assetId, uint _lastSmartMeterReadWh, string calldata _lastSmartMeterReadFileHash) external;
	
	/// @notice gets the latest meterreading and its hash
	/// @param _assetId id of an asset
	/// @return meterreading and its hash
    function getLastMeterReadingAndHash(uint _assetId) external view returns (uint _lastSmartMeterReadWh, string memory _lastSmartMeterReadFileHash);

	/// @notice get the amount of onboarded assets
	/// @return the amount of onboarded assets
    function getAssetListLength() external view returns (uint);
}