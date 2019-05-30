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

pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../../contracts/Trading/MarketDB.sol";
import "../../contracts/Trading/AgreementLogic.sol";
import "ew-asset-registry-lib/contracts/Interfaces/AssetGeneralInterface.sol";

/// @title The logic contract for the AgreementDB of Origin list
contract MarketLogic is AgreementLogic {

    event createdNewDemand(address _sender, uint indexed _demandId);
    event createdNewSupply(address _sender, uint indexed _supplyId);
    event deletedDemand(address _sender, uint indexed _demandId);

    /// @notice constructor
    constructor(
        AssetContractLookupInterface _assetContractLookup,
        MarketContractLookupInterface _marketContractLookup
    )
        AgreementLogic(_assetContractLookup,_marketContractLookup)
        public
    {
    }

	/// @notice Function to create a demand
	/// @dev will return an event with the event-Id
	/// @param _propertiesDocumentHash document-hash with all the properties of the demand
	/// @param _documentDBURL url-address of the demand
    function createDemand(
        string calldata _propertiesDocumentHash,
        string calldata _documentDBURL
    )
        external
        onlyRole(RoleManagement.Role.Trader)
     {
        uint demandID = db.createDemand(_propertiesDocumentHash, _documentDBURL, msg.sender);
        emit createdNewDemand(msg.sender, demandID);
    }

    /// @notice Deletes the demand on a specific index
	/// @dev will return an event with the event-Id
	/// @param _demandId index of the demand in the allDemands-array
    function deleteDemand(uint _demandId)
        external
        onlyRole(RoleManagement.Role.Trader)
    {
        MarketDB.Demand memory demand = db.getDemand(_demandId);
        require(msg.sender == demand.demandOwner, "user is not the owner of this demand");

        db.deleteDemand(_demandId);
        emit deletedDemand(msg.sender, _demandId);
    }

	/// @notice Function to create a supply
	/// @dev will return an event with the event-Id
	/// @param _propertiesDocumentHash document-hash with all the properties of the demand
	/// @param _documentDBURL url-address of the demand
	/// @param _assetId the asset Id
    function createSupply(
        string calldata _propertiesDocumentHash,
        string calldata _documentDBURL,
        uint _assetId
    )
        external
     {
        require(AssetGeneralInterface(assetContractLookup.assetProducingRegistry()).getAssetOwner(_assetId) == msg.sender, "wrong msg.sender");
        uint supplyID = db.createSupply(_propertiesDocumentHash, _documentDBURL, _assetId);
        emit createdNewSupply(msg.sender, supplyID);
    }

	/// @notice function to return the length of the allDemands-array in the database
	/// @return length of the allDemansa-array
    function getAllDemandListLength() external view returns (uint) {
        return db.getAllDemandListLength();
    }

	/// @notice function to return the length of the allSupply-array in the database
	/// @return length of the allDemansa-array
    function getAllSupplyListLength() external view returns (uint) {
        return db.getAllSupplyListLength();
    }

	/// @notice Returns the information of a demand
	/// @param _demandId index of the demand in the allDemands-array
	/// @return propertiesDocumentHash, documentDBURL and owner
    function getDemand(uint _demandId)
        external
        view
        returns (
            string memory _propertiesDocumentHash,
            string memory _documentDBURL,
            address _owner
        )
    {
        MarketDB.Demand memory demand = db.getDemand(_demandId);
        _propertiesDocumentHash = demand.propertiesDocumentHash;
        _documentDBURL = demand.documentDBURL;
        _owner = demand.demandOwner;
    }

	/// @notice gets a supply
	/// @param _supplyId the supply Id
	/// @return the supply
    function getSupply(uint _supplyId)
        external
        view
        returns (
            string memory _propertiesDocumentHash,
            string memory _documentDBURL,
            uint _assetId
        )
    {
        MarketDB.Supply memory supply = db.getSupply(_supplyId);
        _propertiesDocumentHash = supply.propertiesDocumentHash;
        _documentDBURL = supply.documentDBURL;
        _assetId = supply.assetId;
    }

}
