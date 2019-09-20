pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "@energyweb/origin/contracts/Origin/CertificateLogic.sol";
import "@energyweb/origin/contracts/Origin/TradableEntityContract.sol";
import "@energyweb/origin/contracts/Interfaces/TradableEntityDBInterface.sol";
import "@energyweb/origin/contracts/Interfaces/TradableEntityInterface.sol";
import "@energyweb/asset-registry/contracts/Interfaces/AssetGeneralInterface.sol";
import "../../contracts/Trading/MarketDB.sol";
import "../../contracts/Trading/AgreementLogic.sol";

/// @title The logic contract for the AgreementDB of Origin list
contract MarketLogic is AgreementLogic {
    event createdNewDemand(address _sender, uint indexed _demandId);
    event createdNewSupply(address _sender, uint indexed _supplyId);
    event DemandStatusChanged(address _sender, uint indexed _demandId, uint16 indexed _status);
    event DemandUpdated(uint indexed _demandId);
    event DemandPartiallyFilled(uint indexed _demandId, uint indexed _entityId, uint indexed _amount, address _entityOwner, address _demandOwner);

    /// @notice constructor
    constructor(
        AssetContractLookupInterface _assetContractLookup,
        OriginContractLookupInterface _originContractLookup,
        MarketContractLookupInterface _marketContractLookup
    )
        AgreementLogic(_assetContractLookup, _originContractLookup, _marketContractLookup)
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

        changeDemandStatus(_demandId, MarketDB.DemandStatus.ARCHIVED);
    }

    /// @notice Updates existing demand with new properties
	/// @dev will return an event with the event-Id
	/// @param _demandId index of the demand in the allDemands-array
    /// @param _propertiesDocumentHash document-hash with all the properties of the demand
	/// @param _documentDBURL url-address of the demand
    function updateDemand(
        uint _demandId,
        string calldata _propertiesDocumentHash,
        string calldata _documentDBURL
    )
        external
        onlyRole(RoleManagement.Role.Trader)
    {
        MarketDB.Demand memory demand = db.getDemand(_demandId);
        require(msg.sender == demand.demandOwner, "user is not the owner of this demand");
        require(demand.status != MarketDB.DemandStatus.ARCHIVED, "demand cannot be in archived state");

        db.updateDemand(_demandId, _propertiesDocumentHash, _documentDBURL);

        emit DemandUpdated(_demandId);
    }

    /// @notice Matches a tradable entity to a demand
	/// @dev will return an event with the event-Id
	/// @param _demandId index of the demand in the allDemands-array
    /// @param _entityId ID of the tradable entity
    function fillDemand(
        uint _demandId,
        uint _entityId
    )
        external
        onlyRole(RoleManagement.Role.Matcher)
    {
        MarketDB.Demand memory demand = db.getDemand(_demandId);
        require(demand.status == MarketDB.DemandStatus.ACTIVE, "demand cannot be in archived state");

        address originLogicRegistry = originContractLookup.originLogicRegistry();

        TradableEntityContract.TradableEntity memory te = TradableEntityDB(originLogicRegistry).getTradableEntity(_entityId);
        CertificateLogic(originLogicRegistry).transferFrom(
            te.owner, demand.demandOwner, _entityId
        );

        emit DemandPartiallyFilled(_demandId, _entityId, te.powerInW, te.owner, demand.demandOwner);
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
            address _owner,
            uint _status
        )
    {
        MarketDB.Demand memory demand = db.getDemand(_demandId);
        _propertiesDocumentHash = demand.propertiesDocumentHash;
        _documentDBURL = demand.documentDBURL;
        _owner = demand.demandOwner;
        _status = uint(demand.status);
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

    function changeDemandStatus(uint _demandId, MarketDB.DemandStatus _status)
        public
        onlyRole(RoleManagement.Role.Trader)
        returns (MarketDB.DemandStatus)
    {
        MarketDB.Demand memory demand = db.getDemand(_demandId);
        require(msg.sender == demand.demandOwner, "user is not the owner of this demand");

        if (demand.status == _status) {
            return _status;
        }
        if (demand.status == MarketDB.DemandStatus.ARCHIVED) {
            return MarketDB.DemandStatus.ARCHIVED;
        }

        MarketDB.DemandStatus status = db.setDemandStatus(_demandId, _status);
        emit DemandStatusChanged(msg.sender, _demandId, uint16(status));

        return status;
    }
}
