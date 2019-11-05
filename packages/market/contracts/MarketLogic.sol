pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "@openzeppelin/upgrades/contracts/Initializable.sol";

import "@energyweb/user-registry/contracts/RoleManagement.sol";
import "@energyweb/user-registry/contracts/IUserLogic.sol";
import "@energyweb/asset-registry/contracts/IAssetLogic.sol";
import "@energyweb/origin/contracts/ICertificateLogic.sol";

contract MarketLogic is Initializable, RoleManagement {

    IUserLogic private userLogic;
    IAssetLogic private assetLogic;
    ICertificateLogic private certificateLogic;

    enum DemandStatus { ACTIVE, PAUSED, ARCHIVED }

    /// @notice struct for gather all information
    struct Demand {
        string propertiesDocumentHash;
        string documentDBURL;
        address demandOwner;
        DemandStatus status;
    }

    struct Supply {
        string propertiesDocumentHash;
        string documentDBURL;
        uint assetId;
    }

    struct Agreement {
        string propertiesDocumentHash;
        string documentDBURL;
        uint demandId;
        uint supplyId;
        bool approvedBySupplyOwner;
        bool approvedByDemandOwner;
    }

    event createdNewDemand(address _sender, uint indexed _demandId);
    event createdNewSupply(address _sender, uint indexed _supplyId);
    event DemandStatusChanged(address _sender, uint indexed _demandId, uint16 indexed _status);
    event DemandUpdated(uint indexed _demandId);
    event DemandPartiallyFilled(uint indexed _demandId, uint indexed _certificateId, uint indexed _amount);

    event LogAgreementFullySigned(uint indexed _agreementId, uint indexed _demandId, uint indexed _supplyId);
    event LogAgreementCreated(uint indexed _agreementId, uint indexed _demandId, uint indexed _supplyId);

    /// @notice list with all created demands
    Demand[] private allDemands;
    /// @notice list with all supplies
    Supply[] private allSupply;
    /// @notice list with all created agreements
    Agreement[] private allAgreements;

    function initialize(
        IUserLogic _userLogicContract,
        IAssetLogic _assetLogicContract,
        ICertificateLogic _certificateLogicContract
    ) public initializer {
        assetLogic = _assetLogicContract;
        userLogic = _userLogicContract;
        certificateLogic = _certificateLogicContract;

        RoleManagement.initialize(userLogic);
    }

    /// @notice Returns the information of a demand
	/// @param _demandId index of the demand in the allDemands-array
	/// @return propertiesDocumentHash, documentDBURL and owner
    function getDemand(uint _demandId) public view returns (
        string memory _propertiesDocumentHash,
        string memory _documentDBURL,
        address _owner,
        uint _status
    ) {
        Demand memory demand = allDemands[_demandId];
        _propertiesDocumentHash = demand.propertiesDocumentHash;
        _documentDBURL = demand.documentDBURL;
        _owner = demand.demandOwner;
        _status = uint(demand.status);
    }

    /// @notice Function to create a demand
	/// @dev will return an event with the event-Id
	/// @param _propertiesDocumentHash document-hash with all the properties of the demand
	/// @param _documentDBURL url-address of the demand
    function createDemand(
        string calldata _propertiesDocumentHash,
        string calldata _documentDBURL
    ) external onlyRole(RoleManagement.Role.Trader) {
        allDemands.push(Demand({
            propertiesDocumentHash: _propertiesDocumentHash,
            documentDBURL: _documentDBURL,
            demandOwner: msg.sender,
            status: DemandStatus.ACTIVE
        }));
        uint demandID = allDemands.length > 0 ? allDemands.length - 1 : 0;

        emit createdNewDemand(msg.sender, demandID);
    }

    /// @notice Deletes the demand on a specific index
	/// @dev will return an event with the event-Id
	/// @param _demandId index of the demand in the allDemands-array
    function deleteDemand(uint _demandId) external onlyRole(RoleManagement.Role.Trader) {
        Demand memory demand = allDemands[_demandId];
        require(msg.sender == demand.demandOwner, "user is not the owner of this demand");

        changeDemandStatus(_demandId, DemandStatus.ARCHIVED);
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
    ) external onlyRole(RoleManagement.Role.Trader) {
        Demand memory demand = allDemands[_demandId];
        require(msg.sender == demand.demandOwner, "user is not the owner of this demand");
        require(demand.status != DemandStatus.ARCHIVED, "demand cannot be in archived state");

        allDemands[_demandId].propertiesDocumentHash = _propertiesDocumentHash;
        allDemands[_demandId].documentDBURL = _documentDBURL;

        emit DemandUpdated(_demandId);
    }

    /// @notice Matches a certificate to a demand
	/// @dev will return an event with the event-Id
	/// @param _demandId index of the demand in the allDemands-array
    /// @param _certificateId ID of the certificate
    function fillDemand(uint _demandId, uint _certificateId) external onlyRole(RoleManagement.Role.Matcher) {
        Demand memory demand = allDemands[_demandId];
        require(demand.status == DemandStatus.ACTIVE, "demand should be in ACTIVE state");

        CertificateDefinitions.Certificate memory certificate = certificateLogic.getCertificate(_certificateId);
        certificateLogic.buyCertificateFor(_certificateId, demand.demandOwner);

        emit DemandPartiallyFilled(_demandId, _certificateId, certificate.energy);
    }

    function changeDemandStatus(uint _demandId, DemandStatus _status)
        public
        onlyRole(RoleManagement.Role.Trader)
        returns (DemandStatus)
    {
        Demand memory demand = allDemands[_demandId];
        require(msg.sender == demand.demandOwner, "user is not the owner of this demand");

        if (demand.status == _status) {
            return _status;
        }
        if (demand.status == DemandStatus.ARCHIVED) {
            return DemandStatus.ARCHIVED;
        }

        DemandStatus status = setDemandStatus(_demandId, _status);
        emit DemandStatusChanged(msg.sender, _demandId, uint16(status));

        return status;
    }

    function setDemandStatus(uint _demandId, DemandStatus _status) public returns (DemandStatus){
        allDemands[_demandId].status = _status;
        return _status;
    }

    /// @notice function to return the length of the allDemands-array in the database
	/// @return length of the allDemansa-array
    function getAllDemandListLength() external view returns (uint) {
        return allDemands.length;
    }

    /// @notice gets a supply
	/// @param _supplyId the supply Id
	/// @return the supply
    function getSupply(uint _supplyId) external view returns (
        string memory _propertiesDocumentHash,
        string memory _documentDBURL,
        uint _assetId
    ) {
        Supply memory supply = allSupply[_supplyId];
        _propertiesDocumentHash = supply.propertiesDocumentHash;
        _documentDBURL = supply.documentDBURL;
        _assetId = supply.assetId;
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
        require(assetLogic.getAssetOwner(_assetId) == msg.sender, "wrong msg.sender");

        allSupply.push(Supply({
            propertiesDocumentHash: _propertiesDocumentHash,
            documentDBURL: _documentDBURL,
            assetId: _assetId
        }));

        uint supplyID = allSupply.length > 0 ? allSupply.length - 1 : 0;

        emit createdNewSupply(msg.sender, supplyID);
    }

    /// @notice function to return the length of the allSupply-array in the database
	/// @return length of the allDemansa-array
    function getAllSupplyListLength() external view returns (uint) {
        return allSupply.length;
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
        Demand memory demand = allDemands[_demandId];
        Supply memory supply = allSupply[_supplyId];

        address supplyOwner = assetLogic.getAssetOwner(supply.assetId);

        require(
            msg.sender == demand.demandOwner || msg.sender == supplyOwner,
            "createAgreement: wrong owner when creating"
        );

        allAgreements.push(Agreement({
            propertiesDocumentHash: _propertiesDocumentHash,
            documentDBURL: _documentDBURL,
            demandId: _demandId,
            supplyId: _supplyId,
            approvedBySupplyOwner: false,
            approvedByDemandOwner: false
        }));

        uint agreementId = allAgreements.length > 0 ? allAgreements.length - 1 : 0;

        if (msg.sender == demand.demandOwner){
            approveAgreementDemand(agreementId);
        }

        if (msg.sender == supplyOwner){
            approveAgreementSupply(agreementId);
        }

        emit LogAgreementCreated(agreementId, _demandId, _supplyId);
    }

    /// @notice Matches a certificate to a demand from the agreement
	/// @dev will return an event with the event-Id
	/// @param _demandId index of the demand in the allDemands-array
    /// @param _certificateId ID of the certificate
    function fillAgreement(uint _demandId, uint _certificateId) external onlyRole(RoleManagement.Role.Matcher) {
        Demand memory demand = allDemands[_demandId];
        require(demand.status == DemandStatus.ACTIVE, "demand should be in ACTIVE state");

        CertificateDefinitions.Certificate memory certificate = certificateLogic.getCertificate(_certificateId);
        certificateLogic.buyCertificateFor(_certificateId, demand.demandOwner);

        emit DemandPartiallyFilled(_demandId, _certificateId, certificate.energy);
    }

	/// @notice get all agreement list length
	/// @return length of the allAgreements-array
    function getAllAgreementListLength() external view returns (uint) {
        return allAgreements.length;
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
        Agreement memory agreement = allAgreements[_agreementId];
        _propertiesDocumentHash = agreement.propertiesDocumentHash;
        _documentDBURL = agreement.documentDBURL;
        _demandId = agreement.demandId;
        _supplyId = agreement.supplyId;
        _approvedBySupplyOwner = agreement.approvedBySupplyOwner;
        _approvedByDemandOwner = agreement.approvedByDemandOwner;
    }

    function getAgreementStruct(uint _agreementId) external view returns (Agreement memory) {
        return allAgreements[_agreementId];
    }

	/// @notice approves a demand for an agreement
	/// @param _agreementId the agreement Id
    function approveAgreementDemand(uint _agreementId) public {
        Agreement storage agreement = allAgreements[_agreementId];

        require(
            allDemands[agreement.demandId].demandOwner == msg.sender,
            "approveAgreementDemand: wrong msg.sender"
        );

        agreement.approvedByDemandOwner = true;

        // we approve a demand. If it's returning true it means that both supply and demand are approved thus making the agreement complete
        if (agreement.approvedByDemandOwner && agreement.approvedBySupplyOwner) {
            emit LogAgreementFullySigned(_agreementId, agreement.demandId, agreement.supplyId);
        }
    }

	/// @notice approves a supply for an agreement
	/// @param _agreementId the agreement Id
    function approveAgreementSupply(uint _agreementId) public {
        Agreement storage agreement = allAgreements[_agreementId];
        Supply memory supply = allSupply[agreement.supplyId];

        require(
            assetLogic.getAssetOwner(supply.assetId) == msg.sender,
            "approveAgreementSupply: wrong msg.sender"
        );

        agreement.approvedBySupplyOwner = true;

        // we approve a supply. If it's returning true it means that both supply and demand are approved thus making the agreement complete
        if (agreement.approvedByDemandOwner && agreement.approvedBySupplyOwner){
            emit LogAgreementFullySigned(_agreementId, agreement.demandId, agreement.supplyId);
        }
    }
}