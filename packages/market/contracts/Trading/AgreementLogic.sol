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
import "@energyweb/user-registry/contracts/Users/RoleManagement.sol";
import "@energyweb/utils-general/contracts/Interfaces/Updatable.sol";
import "@energyweb/asset-registry/contracts/Interfaces/AssetGeneralInterface.sol";
import "@energyweb/asset-registry/contracts/Interfaces/AssetProducingInterface.sol";
import "@energyweb/asset-registry/contracts/Interfaces/AssetConsumingInterface.sol";
import "@energyweb/asset-registry/contracts/Interfaces/AssetContractLookupInterface.sol";
import "@energyweb/origin/contracts/Interfaces/OriginContractLookupInterface.sol";
import "../../contracts/Interfaces/MarketContractLookupInterface.sol";

contract AgreementLogic is RoleManagement, Updatable {

    event LogAgreementFullySigned(uint indexed _agreementId, uint indexed _demandId, uint indexed _supplyId);
    event LogAgreementCreated(uint indexed _agreementId, uint indexed _demandId, uint indexed _supplyId);

    /// @notice database contract
    MarketDB public db;

    AssetContractLookupInterface public assetContractLookup;
    OriginContractLookupInterface public originContractLookup;

    /// @notice constructor
    constructor(
        AssetContractLookupInterface _assetContractLookup,
        OriginContractLookupInterface _originContractLookup,
        MarketContractLookupInterface _marketContractLookup
    )
        RoleManagement(UserContractLookupInterface(_assetContractLookup.userRegistry()), address(_marketContractLookup))
        public
    {
        assetContractLookup = _assetContractLookup;
        originContractLookup = _originContractLookup;
    }

	/// @notice Function to create a agreement
	/// @dev will return an event with the event-Id
	/// @param _propertiesDocumentHash document-hash with all the properties of the demand
	/// @param _documentDBURL url-address of the demand
	/// @param _demandId the demand Id
	/// @param _supplyId the supply Id
    function createAgreement(
        string calldata _propertiesDocumentHash,
        string calldata _documentDBURL,
        uint _demandId,
        uint _supplyId
    )
        external
    {
        MarketDB.Demand memory demand = db.getDemand(_demandId);
        MarketDB.Supply memory supply = db.getSupply(_supplyId);

        address supplyOwner = AssetGeneralInterface(assetContractLookup.assetProducingRegistry()).getAssetOwner(supply.assetId);

        require(msg.sender == demand.demandOwner || msg.sender == supplyOwner, "createDemand: wrong owner when creating");
        uint agreementId = db.createAgreementDB(
            _propertiesDocumentHash,
            _documentDBURL,
            _demandId,
            _supplyId
        );

        if(msg.sender == demand.demandOwner){
            approveAgreementDemand(agreementId);
        }
        if(msg.sender == supplyOwner){
            approveAgreementSupply(agreementId);
        }

        emit LogAgreementCreated(agreementId, _demandId, _supplyId);
    }

	/// @notice fuction to set the database contract, can only be called once
	/// @param _database the database contract
	/// @param _admin the admin
    function init(address _database, address _admin)
        public
        onlyOwner
    {
        require(address(db) == address(0x0),"init: already initialize");
        db = MarketDB(_database);
    }

	/// @notice Updates the logic contract
	/// @param _newLogic Address of the new logic contract
    function update(address _newLogic)
        external
        onlyOwner
    {
        db.changeOwner(_newLogic);
    }

	/// @notice get all agreement list length
	/// @return length of the allAgreements-array
    function getAllAgreementListLength() external view returns (uint) {
        return db.getAllAgreementListLengthDB();
    }

	/// @notice gets agreement
	/// @param _agreementId the agreement Id
	/// @return the agreement
    function getAgreement(uint _agreementId)
        external
        view
        returns (
            string memory _propertiesDocumentHash,
            string memory _documentDBURL,
            uint _demandId,
            uint _supplyId,
            bool _approvedBySupplyOwner,
            bool _approvedByDemandOwner
        )
    {
        MarketDB.Agreement memory agreement = db.getAgreementDB(_agreementId);
        _propertiesDocumentHash = agreement.propertiesDocumentHash;
        _documentDBURL = agreement.documentDBURL;
        _demandId = agreement.demandId;
        _supplyId = agreement.supplyId;
        _approvedBySupplyOwner = agreement.approvedBySupplyOwner;
        _approvedByDemandOwner = agreement.approvedByDemandOwner;
    }

    function getAgreementStruct(uint _agreementId)
        external
        view
        returns (MarketDB.Agreement memory){
        return db.getAgreementDB(_agreementId);
    }

	/// @notice approves a demand for an agreement
	/// @param _agreementId the agreement Id
    function approveAgreementDemand(uint _agreementId)
        public
    {
        MarketDB.Agreement memory agreement = db.getAgreementDB(_agreementId);
        require(db.getDemand(agreement.demandId).demandOwner == msg.sender, "approveAgreementDemand: wrong msg.sender");

        // we approve a demand. If it's returning true it means that both supply and demand are approved thus making the agreement complete
        if(db.approveAgreementDemandDB(_agreementId)) {
            emit LogAgreementFullySigned(_agreementId, agreement.demandId, agreement.supplyId);
        }
    }

	/// @notice approves a supply for an agreement
	/// @param _agreementId the agreement Id
    function approveAgreementSupply(uint _agreementId)
        public
    {
        MarketDB.Agreement memory agreement = db.getAgreementDB(_agreementId);
        MarketDB.Supply memory supply = db.getSupply(agreement.supplyId);

        require(
            AssetGeneralInterface(assetContractLookup.assetProducingRegistry()).getAssetOwner(supply.assetId) == msg.sender, "approveAgreementSupply: wrong msg.sender"
        );

        // we approve a supply. If it's returning true it means that both supply and demand are approved thus making the agreement complete
        if(db.approveAgreementSupplyDB(_agreementId)){
            emit LogAgreementFullySigned(_agreementId, agreement.demandId, agreement.supplyId);
        }
    }
}