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

import "@energyweb/user-registry/contracts/Users/RoleManagement.sol";
import "@energyweb/utils-general/contracts/Interfaces/Updatable.sol";
import "../../contracts/Interfaces/AssetDbInterface.sol";
import "../../contracts/Interfaces/AssetGeneralInterface.sol";
import "../../contracts/AssetContractLookup.sol";
import "../../contracts/Asset/AssetGeneralStructContract.sol";

/// @title Contract for storing the current logic-contracts-addresses for the certificate of origin
contract AssetLogic is RoleManagement, Updatable, AssetGeneralInterface, AssetGeneralStructContract {

    event LogAssetCreated(address _sender, uint indexed _assetId);
    event LogAssetFullyInitialized(uint indexed _assetId);
    event LogAssetSetActive(uint indexed _assetId);
    event LogAssetSetInactive(uint indexed _assetId);
    event LogNewMeterRead(
        uint indexed _assetId,
        uint _oldMeterRead,
        uint _newMeterRead,
        uint _timestamp
    );

    /**
        abtract functions
     */

	/// @notice checks whether an asset with the provided smartmeter aready exists
	/// @param _smartMeter provided smartmeter
	/// @return whether there is already an asset with that smartmeter
    function checkAssetExist(address _smartMeter) public view returns (bool);


    AssetDbInterface public db;

    modifier isInitialized {
        require(address(db) != address(0x0));
        _;
    }

    /**
        external functions
    */
	/// @notice function toinizialize the database, can only be called once
	/// @param _dbAddress address of the database contract
    function init(address _dbAddress, address )
        external
        onlyOwner
    {
        require(address(db) == address(0x0));
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

	/// @notice Set the MarketLookup contract contract
	/// @param _assetId the id belonging ti an entry in the asset registry
	/// @param _marketContractLookup the MarketLookup-contract
    function setMarketLookupContract(uint _assetId, address _marketContractLookup)
        external
    {
        require(msg.sender == db.getAssetOwner(_assetId),"sender is not the assetOwner");
        db.setMarketLookupContract(_assetId, _marketContractLookup);
    }

	/// @notice Updates the logic contract
	/// @param _newLogic address of the new logic contract
    function update(address _newLogic)
        external
        onlyOwner
    {
        Owned(address(db)).changeOwner(_newLogic);
    }

	/// @notice gets the amount of all assets
	/// @dev needed to iterate though all the asset
	/// @return the amount of all assets
    function getAssetListLength()
        external
        view
        returns (uint)
    {
        return db.getAssetListLength();
    }

	/// @notice gets the MarketLookup-contract
	/// @param _assetId the id of an asset
	/// @return contract address of the MarketLookup-contract
    function getMarketLookupContract(uint _assetId)
        external
        view
        returns (address)
    {
        return db.getMarketLookupContract(_assetId);
    }

	/// @notice gets the matcher-array
	/// @param _assetId the id of an asset
	/// @return array with matcher-addresses
    function getMatcher(uint _assetId)
        external
        view
        returns(address[] memory)
    {
        return db.getMatcher(_assetId);
    }

	/// @notice adds a new matcher-address to the matcher-array of an asset
	/// @param _assetId the id of an asset
	/// @param _new matcher-address to be included
    function addMatcher(uint _assetId, address _new) external {

        require(msg.sender == db.getAssetOwner(_assetId),"addMatcher: not the owner");
        address[] memory matcher = db.getMatcher(_assetId);
        assert(matcher.length < matcher.length + 1);
        require(matcher.length+1 <= AssetContractLookup(owner).maxMatcherPerAsset(),"addMatcher: too many matcher already");

        db.addMatcher(_assetId,_new);
    }

	/// @notice removes a matcher address from the array of an asset
	/// @param _assetId the id of an asset
	/// @param _remove matcher address to be removed
    function removeMatcher(uint _assetId, address _remove) external  {
        require(msg.sender == db.getAssetOwner(_assetId),"removeMatcher: not the owner");
        require(db.removeMatcherExternal(_assetId,_remove),"removeMatcher: address not found");

    }
	/// @notice checks whether an AssetGeneral-struct already exists
	/// @param _assetGeneral the AssetGeneral-struct
	/// @return whether that struct exists
    function checkAssetGeneralExistingStatus(AssetGeneralStructContract.AssetGeneral memory _assetGeneral) internal pure returns (bool) {
        return !(
            address(_assetGeneral.smartMeter) == address(0x0)
            && address(_assetGeneral.owner) == address(0x0)
            && _assetGeneral.lastSmartMeterReadWh == 0
            && !_assetGeneral.active
            && bytes(_assetGeneral.lastSmartMeterReadFileHash).length == 0
            && _assetGeneral.matcher.length == 0
            && bytes(_assetGeneral.propertiesDocumentHash).length == 0
            && bytes(_assetGeneral.url).length == 0
            && address(_assetGeneral.marketLookupContract) == address(0x0)
        );
    }

	/// @notice sets a new meterreading for an asset
	/// @param _assetId the id of an asset
	/// @param _newMeterRead the new meterreading in Wh
	/// @param _smartMeterReadFileHash the filehash for the meterreading
    function setSmartMeterReadInternal(
        uint _assetId,
        uint _newMeterRead,
        string memory _smartMeterReadFileHash,
        uint _timestamp
    ) internal returns (uint){

        AssetGeneralStructContract.AssetGeneral memory asset = db.getAssetGeneral(_assetId);
        require(asset.smartMeter == msg.sender,"saveSmartMeterRead: wrong sender");
        require(asset.active,"saveSmartMeterRead: asset not active");

        uint oldMeterRead = asset.lastSmartMeterReadWh;

        require(_newMeterRead > oldMeterRead,"saveSmartMeterRead: meterread too low");
        /// @dev need to check if new meter read is higher then the old one

        db.setSmartMeterRead(_assetId, _newMeterRead, _smartMeterReadFileHash);

        emit LogNewMeterRead(
            _assetId,
            oldMeterRead,
            _newMeterRead,
            _timestamp
        );

        return (_newMeterRead-oldMeterRead);
    }

	/// @notice gets the general information of an asset
	/// @param _assetId the id of an asset
	/// @return the AssetGeneral-Stuct as separate returnvalues
    function getAssetGeneral(uint _assetId) external view returns (
        address smartMeter,
        address owner,
        uint lastSmartMeterReadWh,
        bool active,
        string memory lastSmartMeterReadFileHash,
        address[] memory matcher,
        string memory propertiesDocumentHash,
        string memory url,
        address marketLookupContract,
        bool bundled
    )
    {
        AssetGeneral memory a = db.getAssetGeneral(_assetId);

        smartMeter = a.smartMeter;
        owner = a.owner;
        lastSmartMeterReadWh = a.lastSmartMeterReadWh;
        active = a.active;
        lastSmartMeterReadFileHash = a.lastSmartMeterReadFileHash;
        matcher = a.matcher;
        propertiesDocumentHash = a.propertiesDocumentHash;
        url = a.url;
        marketLookupContract = a.marketLookupContract;
        bundled = a.bundled;
    }

	/// @notice gets the owner-address of an asset
	/// @param _assetId the id of an asset
	/// @return the owner of that asset
    function getAssetOwner(uint _assetId) external view returns (address){
        return db.getAssetGeneral(_assetId).owner;
    }

	/// @notice gets the last meterreading and its hash
	/// @param _assetId the id of an asset
	/// @return the last meterreading and its hash
    function getLastMeterReadingAndHash(uint _assetId) external view returns (uint _lastSmartMeterReadWh, string memory _lastSmartMeterReadFileHash)
    {
        return db.getLastMeterReadingAndHash(_assetId);
    }

	/// @notice runs some checks before creating an asset
	/// @param _matcher the matcher array
	/// @param _owner the address of the asset-owner
	/// @param _smartMeter the smartmeter used by that asset
    function checkBeforeCreation(address[] memory _matcher, address _owner, address _smartMeter) internal view {
        require(_matcher.length <= AssetContractLookup(owner).maxMatcherPerAsset(),"addMatcher: too many matcher already");
        require(isRole(RoleManagement.Role.AssetManager, _owner),"user does not have the required role");
        require(isRole(RoleManagement.Role.AssetAdmin, msg.sender),"user does not have the required role");
        require(!checkAssetExist(_smartMeter),"smartmeter does already exist");
    }

}
