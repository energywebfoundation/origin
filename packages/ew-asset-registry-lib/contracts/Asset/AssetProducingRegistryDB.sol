// Copyright 2018 Energy Web Foundation
//
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
// @authors: slock.it GmbH, Heiko Burkhardt, heiko.burkhardt@slock.it, Martin Kuechler, martin.kuechler@slock.it

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "../Msc/Owned.sol";
import "../Interfaces/AssetDbInterface.sol";

/// @title The Database contract for the Asset Registration
/// @notice This contract only provides getter and setter methods
contract AssetProducingRegistryDB is Owned, AssetDbInterface {

    struct Asset{
        uint certificatesUsedForWh;
        address smartMeter;
        address owner;
        uint lastSmartMeterReadWh;
        bool active;
        string lastSmartMeterReadFileHash;

        address[] matcher;
        uint certificatesCreatedForWh;
        uint lastSmartMeterCO2OffsetRead;
        uint maxOwnerChanges;
        string propertiesDocumentHash;
        string url;   
    }

    /// @notice An array containing all registerd assets
    Asset[] private assets;

    /// @notice Constructor
    /// @param _owner The owner of the contract
    constructor (address _owner)  public Owned(_owner) {} 

    /// @notice Creates a new energyproducing asset
    /// @param _smartMeter smartmeter-address 
    /// @param _owner owner-address
    /// @param _maxOwnerChanges amount of allowed owner changes for a certificate created by this asset
    /// @param _active flag if the asset is enabled
    /// @param _matcher matcher-address
    /// @param _propertiesDocumentHash document-hash with all the properties of the asset
    /// @param _url url-address of the asset
    /// @return returns the array-position and thus the index / identifier of this new asset
    function createAsset(  
        address _smartMeter,
        address _owner,
        uint _maxOwnerChanges,
        bool _active,
        address _matcher,
        string _propertiesDocumentHash,
        string _url
    ) 
        external
        onlyOwner
        returns (uint _assetId)
    {
        address[] memory matcherarray = new address[](1);
        matcherarray[0] = _matcher;   

        Asset memory a = Asset({
            certificatesUsedForWh: 0,
            smartMeter: _smartMeter,
            owner: _owner,
            lastSmartMeterReadWh: 0,
            active: _active,
            lastSmartMeterReadFileHash: "",
            matcher: matcherarray,
            certificatesCreatedForWh:0,
            lastSmartMeterCO2OffsetRead:0,
            maxOwnerChanges: _maxOwnerChanges,
            propertiesDocumentHash: _propertiesDocumentHash,
            url: _url
        });

        assets.push(a);
        _assetId = assets.length>0?assets.length-1:0;        
    }

    /// @notice Sets if an entry in the asset registry is active
    /// @param _assetId The id belonging to an entry in the asset registry
    /// @param _active true if active
    function setActive(uint _assetId, bool _active)
        onlyOwner
        external
    {
        assets[_assetId].active = _active;
    }

    /// @notice Sets amount of Wh used to issue certificates belonging to an entry in the asset registry
    /// @param _assetId The id belonging to an entry in the asset registry
    /// @param _certificatesCreatedForWh The amount of Wh used to issue certificates
    function setCertificatesCreatedForWh(uint _assetId, uint _certificatesCreatedForWh) 
        onlyOwner
        external
    {
        assets[_assetId].certificatesCreatedForWh = _certificatesCreatedForWh;
    }

    /// @notice Sets amount of Wh used to issue certificates belonging to an entry in the asset registry
    /// @param _assetId The id belonging to an entry in the asset registry
    /// @param _certificatesUsedForWh The amount of Wh used to issue certificates
    function setCertificatesUsedForWh(uint _assetId, uint _certificatesUsedForWh) 
        onlyOwner
        external
    {
        assets[_assetId].certificatesUsedForWh = _certificatesUsedForWh;
    }
    
    /// @notice Sets the last smart meter read in saved CO2 of an entry in the asset registry
    /// @param _assetId The id belonging to an entry in the asset registry
    /// @param _lastCO2OffsetReading The new amount of saved CO2
    function setLastCO2OffsetReading(uint _assetId, uint _lastCO2OffsetReading)
        onlyOwner
        external
    {
        assets[_assetId].lastSmartMeterCO2OffsetRead = _lastCO2OffsetReading;
    }

    /// @notice Sets last meter read file hash
    /// @param _assetId The id belonging to an entry in the asset registry
    /// @param _lastSmartMeterReadFileHash Last meter read file hash
    function setLastSmartMeterReadFileHash(uint _assetId, string _lastSmartMeterReadFileHash)
        onlyOwner
        external
    {
        assets[_assetId].lastSmartMeterReadFileHash = _lastSmartMeterReadFileHash;
    }

    /// @notice Sets the last smart meter read in Wh of an entry in the asset registry
    /// @param _assetId The id belonging to an entry in the asset registry
    /// @param _lastSmartMeterReadWh The smart meter read in Wh
    function setLastSmartMeterReadWh(uint _assetId, uint _lastSmartMeterReadWh) 
        onlyOwner
        external
    {
        assets[_assetId].lastSmartMeterReadWh = _lastSmartMeterReadWh;
    }

    /// @notice Sets the owner of an entry in the asset registry
    /// @param _assetId The id belonging to an entry in the asset registry
    /// @param _owner The new owner
    function setOwner(uint _assetId, address _owner) 
        onlyOwner
        external
    {
        assets[_assetId].owner = _owner;
    }

    /// @notice Sets a new document-hash with the properties of an asset
    /// @param _assetId The id belonging to an entry in the asset registry
    /// @param _propDocumentHash new document-hash
    function setPropertiesDocumentHash(uint _assetId, string _propDocumentHash)
        onlyOwner
        external
    {
        assets[_assetId].propertiesDocumentHash = _propDocumentHash;
    }
    /// @notice Sets the smart meter address belonging to an entry in the asset registry
    /// @param _assetId The id belonging to an entry in the asset registry
    /// @param _smartMeter The new smart meter address
    function setSmartMeter(uint _assetId, address _smartMeter) 
        onlyOwner
        external
    {
        assets[_assetId].smartMeter = _smartMeter;
    }

    /// @notice Sets a new url of an asset
    /// @param _assetId the id belonging to an entry in the asset registry
    /// @param _url the new url
    function setUrl(uint _assetId, string _url)
        onlyOwner
        external
    {
        assets[_assetId].url = _url;
    }

    /// @notice Returns an asset
    /// @param _assetId the id belonging to an entry in the asset registry
    /// @return asset-struct
    function getAsset(uint _assetId)
        onlyOwner
        external
        view 
        returns (Asset)
    {
        return assets[_assetId];
    }

    /// @notice function to get the amount of assets
    /// @return amount of assets
    function getAssetListLength()
        external
        view
        onlyOwner 
        returns (uint)
    {
        return assets.length;
    }    
}