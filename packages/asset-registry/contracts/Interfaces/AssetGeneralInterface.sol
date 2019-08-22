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

/// @title this interface defines the functions of the AssetContractLookup-Contract
interface AssetGeneralInterface {
    function setActive(uint _assetId, bool _active) external;
    function setMarketLookupContract(uint _assetId, address _marketContractLookup) external;
    function getMarketLookupContract(uint _assetId) external view returns (address);
    function getAssetListLength() external view returns (uint);
    function getLastMeterReadingAndHash(uint _assetId) external view returns (uint _lastSmartMeterReadWh, string memory _lastSmartMeterReadFileHash);
    function getAssetOwner(uint _assetId) external view returns (address);
    function addMatcher(uint _assetId, address _new) external ;
    function getMatcher(uint _assetId) external view returns(address[] memory);
    function removeMatcher(uint _assetId, address _remove) external;
    function getAssetGeneral(uint _assetId) external view returns (address smartMeter, address owner, uint lastSmartMeterReadWh, bool active, string memory lastSmartMeterReadFileHash, address[] memory matcher, string memory propertiesDocumentHash, string memory url, address marketLookupContract, bool bundled);
}
