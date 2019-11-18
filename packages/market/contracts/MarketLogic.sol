pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "@openzeppelin/upgrades/contracts/Initializable.sol";

import "@energyweb/erc-test-contracts/contracts/Interfaces/ERC20Interface.sol";
import "@energyweb/user-registry/contracts/RoleManagement.sol";
import "@energyweb/asset-registry/contracts/IAssetLogic.sol";
import "@energyweb/origin/contracts/ICertificateLogic.sol";
import "@energyweb/origin/contracts/CertificateDefinitions.sol";

contract MarketLogic is Initializable, RoleManagement {

    bool private _initialized;
    IAssetLogic private _assetLogic;
    ICertificateLogic private _certificateLogic;

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

    struct PurchasableCertificate {
        bool forSale;
        address acceptedToken;
        uint onChainDirectPurchasePrice;
    }

    event createdNewDemand(address _sender, uint indexed _demandId);
    event createdNewSupply(address _sender, uint indexed _supplyId);
    event DemandStatusChanged(address _sender, uint indexed _demandId, uint16 indexed _status);
    event DemandUpdated(uint indexed _demandId);
    event DemandPartiallyFilled(uint indexed _demandId, uint indexed _certificateId, uint indexed _amount);

    event LogAgreementFullySigned(uint indexed _agreementId, uint indexed _demandId, uint indexed _supplyId);
    event LogAgreementCreated(uint indexed _agreementId, uint indexed _demandId, uint indexed _supplyId);

    event LogPublishForSale(uint indexed _certificateId, uint _price, address _token);
    event LogUnpublishForSale(uint indexed _certificateId);

    /// @notice list with all created demands
    Demand[] private allDemands;
    /// @notice list with all supplies
    Supply[] private allSupply;
    /// @notice list with all created agreements
    Agreement[] private allAgreements;
    // Mapping of tokenId to PurchasableCertificate
    mapping(uint256 => PurchasableCertificate) private purchasableCertificates;

    modifier onlyCertificateOwner(uint _certificateId) {
        require(
            _certificateLogic.ownerOf(_certificateId) == msg.sender || isRole(RoleManagement.Role.Matcher, msg.sender),
            "onlyCertificateOwner: not the certificate-owner or market matcher"
        );
        _;
    }

    modifier onlyDemandOwner(uint _demandId) {
        require(isRole(RoleManagement.Role.Trader, msg.sender), "onlyDemandOwner: demand owner has to be a trader");
        require(allDemands[_demandId].demandOwner == msg.sender, "onlyDemandOwner: not the demand owner");
        _;
    }

    function initialize(address certificateLogicContract) public initializer {
        require(certificateLogicContract != address(0), "initialize: Cannot use address 0x0 as certificateLogicContract.");

        _certificateLogic = ICertificateLogic(certificateLogicContract);
        require(_certificateLogic.assetLogicAddress() != address(0), "initialize: certificateLogic hasn't been initialized yet.");

        _assetLogic = IAssetLogic(_certificateLogic.assetLogicAddress());
        require(_assetLogic.userLogicAddress() != address(0), "initialize: assetLogic hasn't been initialized yet.");

        RoleManagement.initialize(_assetLogic.userLogicAddress());

        _initialized = true;
    }

    function certificateLogicAddress() public view returns (address) {
        require(_initialized == true, "certificateLogicAddress: The contract has not been initialized yet.");
        require(
            address(_certificateLogic) != address(0),
            "certificateLogicAddress: The address is set to 0x0 address."
        );

        return address(_certificateLogic);
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
    function deleteDemand(uint _demandId) external onlyDemandOwner(_demandId) {
        Demand memory demand = allDemands[_demandId];
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
    ) external onlyDemandOwner(_demandId) {
        Demand memory demand = allDemands[_demandId];
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

        CertificateDefinitions.Certificate memory certificate = _certificateLogic.getCertificate(_certificateId);
        buyCertificateFor(_certificateId, demand.demandOwner);

        emit DemandPartiallyFilled(_demandId, _certificateId, certificate.energy);
    }

    function changeDemandStatus(uint _demandId, DemandStatus _status)
        public
        onlyDemandOwner(_demandId)
        returns (DemandStatus)
    {
        Demand memory demand = allDemands[_demandId];

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

    function setDemandStatus(uint _demandId, DemandStatus _status)
        public onlyDemandOwner(_demandId)
        returns (DemandStatus)
    {
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
    ) external {
        require(_assetLogic.getAssetOwner(_assetId) == msg.sender, "wrong msg.sender");

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
    ) external {
        Demand memory demand = allDemands[_demandId];
        Supply memory supply = allSupply[_supplyId];

        address supplyOwner = _assetLogic.getAssetOwner(supply.assetId);

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

        CertificateDefinitions.Certificate memory certificate = _certificateLogic.getCertificate(_certificateId);
        _certificateLogic.transferFrom(
            _certificateLogic.ownerOf(_certificateId),
            demand.demandOwner,
            _certificateId
        );

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
            _assetLogic.getAssetOwner(supply.assetId) == msg.sender,
            "approveAgreementSupply: wrong msg.sender"
        );

        agreement.approvedBySupplyOwner = true;

        // we approve a supply. If it's returning true it means that both supply and demand are approved thus making the agreement complete
        if (agreement.approvedByDemandOwner && agreement.approvedBySupplyOwner){
            emit LogAgreementFullySigned(_agreementId, agreement.demandId, agreement.supplyId);
        }
    }

    function getPurchasableCertificate(uint certificateId)
        public view returns (PurchasableCertificate memory)
    {
        // require(certificateId < _certificateLogic.totalSupply(), "getPurchasableCertificate: index out of bounds");
        return purchasableCertificates[certificateId];
    }

    /// @notice makes the certificate available for sale
    /// @param _certificateId The id of the certificate
    /// @param _price the purchase price
    /// @param _tokenAddress the address of the ERC20 token address
    function publishForSale(uint _certificateId, uint _price, address _tokenAddress) public onlyCertificateOwner(_certificateId) {
        _publishForSale(_certificateId, _price, _tokenAddress);
    }

    /// @notice makes the certificate not available for sale
    /// @param _certificateId The id of the certificate
    function unpublishForSale(uint _certificateId) public onlyCertificateOwner(_certificateId) {
        PurchasableCertificate storage pCert = purchasableCertificates[_certificateId];

        pCert.forSale = false;
        emit LogUnpublishForSale(_certificateId);
    }

    /// @notice gets the certificate
    /// @param _certificateId the id of a certificate
    /// @return the certificate (ERC20 contract)
    function getTradableToken(uint _certificateId) public view returns (address) {
        return getPurchasableCertificate(_certificateId).acceptedToken;
    }

    /// @notice buys a certificate
    /// @param _certificateId the id of the certificate
    function buyCertificate(uint _certificateId) public onlyRole(RoleManagement.Role.Trader) {
        _buyCertificate(_certificateId, msg.sender);
    }

    /// @notice buys a certificate for owner
    /// @param _certificateId the id of the certificate
    /// @param _newOwner the address of the new owner
    function buyCertificateFor(uint _certificateId, address _newOwner)
        public
        onlyRole(RoleManagement.Role.Matcher)
        userHasRole(RoleManagement.Role.Trader, _newOwner)
    {
        _buyCertificate(_certificateId, _newOwner);
    }

    /// @notice buys a set of certificates
    /// @param _idArray the ids of the certificates to be bought
    function buyCertificateBulk(uint[] memory _idArray) public onlyRole(RoleManagement.Role.Trader) {
        for (uint i = 0; i < _idArray.length; i++) {
            _buyCertificate(_idArray[i], msg.sender);
        }
    }

    function splitAndBuyCertificate(uint _certificateId, uint _energy) public onlyRole(RoleManagement.Role.Trader) {
        CertificateDefinitions.Certificate memory cert = _certificateLogic.getCertificate(_certificateId);
        PurchasableCertificate memory pCert = getPurchasableCertificate(_certificateId);

        require(_energy > 0 && _energy <= cert.energy, "Energy has to be higher than 0 and lower or equal than certificate energy");
        require(pCert.forSale == true, "Unable to split and buy a certificate that is not for sale.");

        if (_energy == cert.energy) {
            _buyCertificate(_certificateId, msg.sender);
        } else {
            (uint childOneId, uint childTwoId) = _certificateLogic.splitCertificate(_certificateId, _energy);

            _publishForSale(childOneId, pCert.onChainDirectPurchasePrice, pCert.acceptedToken);
            _publishForSale(childTwoId, pCert.onChainDirectPurchasePrice, pCert.acceptedToken);

            _buyCertificate(childOneId, msg.sender);
        }
    }

    /// @notice Splits a certificate and publishes the first split certificate for sale
    /// @param _certificateId The id of the certificate
    /// @param _energy The amount of energy in W for the 1st certificate
    /// @param _price the purchase price
    /// @param _tokenAddress the address of the ERC20 token address
    function splitAndPublishForSale(uint _certificateId, uint _energy, uint _price, address _tokenAddress)
        public onlyCertificateOwner(_certificateId)
    {
        (uint childOneId, ) = _certificateLogic.splitCertificate(_certificateId, _energy);
        _publishForSale(childOneId, _price, _tokenAddress);
    }

    /// @notice gets the price for a direct purchase onchain
    /// @param _certificateId the certificate-id
    function getOnChainDirectPurchasePrice(uint _certificateId) public view returns (uint) {
        return getPurchasableCertificate(_certificateId).onChainDirectPurchasePrice;
    }

    /**
        internal functions
    */

    function _buyCertificate(uint _certificateId, address buyer) internal {
        CertificateDefinitions.Certificate memory cert = _certificateLogic.getCertificate(_certificateId);
        PurchasableCertificate memory pCert = getPurchasableCertificate(_certificateId);

        require(buyer != _certificateLogic.ownerOf(_certificateId), "Can't buy your own certificates.");
        require(pCert.forSale == true, "Unable to buy a certificate that is not for sale.");
        require(cert.status == uint(CertificateDefinitions.Status.Active), "You can only buy Active certificates.");

        bool isOnChainSettlement = pCert.acceptedToken != address(0x0);

        if (isOnChainSettlement) {
            ERC20Interface erc20 = ERC20Interface(pCert.acceptedToken);
            require(
                erc20.balanceOf(buyer) >= pCert.onChainDirectPurchasePrice,
                "_buyCertificate: the buyer should have enough tokens to buy"
            );
            require(
                erc20.allowance(buyer, _certificateLogic.ownerOf(_certificateId)) >= pCert.onChainDirectPurchasePrice,
                "_buyCertificate: the buyer should have enough allowance to buy"
            );
            erc20.transferFrom(buyer, _certificateLogic.ownerOf(_certificateId), pCert.onChainDirectPurchasePrice);
        } else {
            //  TO-DO: Implement off-chain settlement checks
            //  For now automatically transfer the certificate
            //  if it's an off chain settlement
        }

        _certificateLogic.transferFrom(_certificateLogic.ownerOf(_certificateId), buyer, _certificateId);
        _removeTokenAndPrice(_certificateId);

        unpublishForSale(_certificateId);
    }

    /// @notice sets the price (as ERC20 token) for direct onchain purchasement
    /// @param _certificateId the id of the certificate
    /// @param _price the new price (as ERC20 tokens)
    function _setOnChainDirectPurchasePrice(uint _certificateId, uint _price) internal {
        PurchasableCertificate storage pCert = purchasableCertificates[_certificateId];
        pCert.onChainDirectPurchasePrice = _price;
    }

    /// @notice sets the tradable token (ERC20 contracts) of a certificate
    /// @param _certificateId the certificate ID
    /// @param _token the ERC20-tokenaddress
    function _setTradableToken(uint _certificateId, address _token) internal {
        PurchasableCertificate storage pCert = purchasableCertificates[_certificateId];
        pCert.acceptedToken = _token;
    }

    /// @notice removes accepted token and the price for an certificate
    /// @dev should be called after the transfer of an certificate
    /// @param _certificateId the id of the certificate
    function _removeTokenAndPrice(uint _certificateId) internal {
        _setTradableToken(_certificateId, address(0));
        _setOnChainDirectPurchasePrice(_certificateId, 0);
    }

    function _publishForSale(uint _certificateId, uint _price, address _tokenAddress) internal {
        _setOnChainDirectPurchasePrice(_certificateId, _price);
        _setTradableToken(_certificateId, _tokenAddress);
        purchasableCertificates[_certificateId].forSale = true;

        emit LogPublishForSale(_certificateId, _price, _tokenAddress);
    }
}