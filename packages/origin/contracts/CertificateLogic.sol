pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/ERC721Enumerable.sol";

import "@energyweb/erc-test-contracts/contracts/Interfaces/ERC20Interface.sol";
import "@energyweb/user-registry/contracts/RoleManagement.sol";
import "@energyweb/asset-registry/contracts/IAssetLogic.sol";
import "@energyweb/asset-registry/contracts/AssetDefinitions.sol";

import "./CertificateDefinitions.sol";
import "./ICertificateLogic.sol";

contract CertificateLogic is Initializable, ERC721, ERC721Enumerable, RoleManagement, ICertificateLogic {

    bool private _initialized;
    IAssetLogic private assetLogic;

    event LogCreatedCertificate(uint indexed _certificateId, uint energy, address owner);
    event LogCertificateClaimed(uint indexed _certificateId);
    event LogCertificateSplit(uint indexed _certificateId, uint _childOne, uint _childTwo);

    event LogPublishForSale(uint indexed _certificateId, uint _price, address _token);
    event LogUnpublishForSale(uint indexed _certificateId);

    event CertificationRequestCreated(uint assetId, uint readsStartIndex, uint readsEndIndex);
    event CertificationRequestApproved(uint assetId, uint readsStartIndex, uint readsEndIndex);

    mapping(uint => uint) internal assetRequestedCertsForSMReadsLength;

    CertificateDefinitions.CertificationRequest[] private certificationRequests;

    // Mapping of tokenId to Certificate
    mapping(uint256 => CertificateDefinitions.Certificate) private certificates;

    modifier onlyCertificateOwner(uint _certificateId) {
        address owner = ownerOf(_certificateId);
        require(
            owner == msg.sender || isRole(RoleManagement.Role.Matcher, msg.sender),
            "onlyCertificateOwner: not the certificate-owner or market matcher"
        );
        _;
    }

    function initialize(address _assetLogicAddress) public initializer {
        require(_assetLogicAddress != address(0), "initialize: Cannot use address 0x0 as _assetLogicAddress.");

        assetLogic = IAssetLogic(_assetLogicAddress);

        require(assetLogic.userLogicAddress() != address(0), "initialize: assetLogic hasn't been initialized yet.");

        ERC721.initialize();
        ERC721Enumerable.initialize();
        RoleManagement.initialize(assetLogic.userLogicAddress());

        _initialized = true;
    }

    function assetLogicAddress() public view returns (address) {
        require(_initialized == true, "assetLogicAddress: The contract has not been initialized yet.");
        require(address(assetLogic) != address(0), "assetLogicAddress: The asset logic address is set to 0x0 address.");

        return address(assetLogic);
    }

    /*
        ERC 721 Overrides
    */

    /**
     * @dev Transfers the ownership of a given token ID to another address.
     * Usage of this method is discouraged, use `safeTransferFrom` whenever possible.
     * Requires the msg.sender to be the owner, approved, or operator.
     * @param from current owner of the token
     * @param to address to receive the ownership of the given token ID
     * @param tokenId uint256 ID of the token to be transferred
     */
    function transferFrom(address from, address to, uint256 tokenId) public {
        require(
            _isApprovedOrOwner(msg.sender, tokenId) || isRole(RoleManagement.Role.Matcher, msg.sender),
            "transferFrom: caller is not owner, nor approved, nor has Matcher role"
        );

        _transferFrom(from, to, tokenId);
        _removeTokenAndPrice(tokenId);
    }

    /*
        Public functions
    */

    /**
     * @dev Gets the token ID at a given index of all the tokens in this contract
     * Reverts if the index is greater or equal to the total number of tokens.
     * @param certificateId uint256 representing the index to be accessed of the tokens list
     * @return uint256 token ID at the given index of the tokens list
     */
    function getCertificate(uint256 certificateId) public view returns (CertificateDefinitions.Certificate memory) {
        require(certificateId < totalSupply(), "ERC721Enumerable: global index out of bounds");
        return certificates[certificateId];
    }

    /// @notice Get the address of the owner of certificate
    /// @param certificateId The id of the certificate
    function getCertificateOwner(uint256 certificateId) public view returns (address) {
        require(certificateId < totalSupply(), "ERC721Enumerable: global index out of bounds");
        return ownerOf(certificateId);
    }

    /// @notice Request a certificate to claim. Only Certificate owner can claim
    /// @param certificateId The id of the certificate
    function claimCertificate(uint certificateId) public {
        _claimCertificate(certificateId);
    }

    /// @notice claims a set of certificates
    /// @param _idArray the ids of the certificates to be claimed
    function claimCertificateBulk(uint[] memory _idArray) public {
        require(
            _idArray.length <= 100,
            "claimCertificateBulk: max num of certificates to claim in one bulk tx is 100"
        );

        for (uint i = 0; i < _idArray.length; i++) {
            _claimCertificate(_idArray[i]);
        }
    }

    /// @notice Splits a certificate into two smaller ones, where (total - energy = 2ndCertificate)
    /// @param certificateId The id of the certificate
    /// @param energy The amount of energy in Wh for the 1st certificate
    function splitCertificate(uint certificateId, uint energy) public {
        require(
            msg.sender == ownerOf(certificateId) || isRole(RoleManagement.Role.Matcher, msg.sender),
            "splitCertificate: You are not the owner of the certificate"
        );

        _splitCertificate(certificateId, energy);
    }

    /// @notice gets whether the certificate is claimed
    /// @param _certificateId The id of the requested certificate
    /// @return flag whether the certificate is claimed
    function isClaimed(uint _certificateId) public view returns (bool) {
        return getCertificate(_certificateId).status == uint(CertificateDefinitions.Status.Claimed);
    }

    /// @notice makes the certificate available for sale
    /// @param _certificateId The id of the certificate
    /// @param _price the purchase price
    /// @param _tokenAddress the address of the ERC20 token address
    function publishForSale(uint _certificateId, uint _price, address _tokenAddress) public onlyCertificateOwner(_certificateId) {
        _setOnChainDirectPurchasePrice(_certificateId, _price);
        _setTradableToken(_certificateId, _tokenAddress);
        certificates[_certificateId].forSale = true;

        emit LogPublishForSale(_certificateId, _price, _tokenAddress);
    }

    /// @notice makes the certificate not available for sale
    /// @param _certificateId The id of the certificate
    function unpublishForSale(uint _certificateId) public onlyCertificateOwner(_certificateId) {
        CertificateDefinitions.Certificate storage cert = certificates[_certificateId];

        cert.forSale = false;
        emit LogUnpublishForSale(_certificateId);
    }

    /// @notice gets the certificate
    /// @param _certificateId the id of a certificate
    /// @return the certificate (ERC20 contract)
    function getTradableToken(uint _certificateId) public view returns (address) {
        return getCertificate(_certificateId).acceptedToken;
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
        CertificateDefinitions.Certificate memory cert = getCertificate(_certificateId);

        require(_energy > 0 && _energy <= cert.energy, "Energy has to be higher than 0 and lower or equal than certificate energy");

        if (_energy == cert.energy) {
            _buyCertificate(_certificateId, msg.sender);
        } else {
            require(cert.forSale == true, "Unable to split and buy a certificate that is not for sale.");

            (uint childOneId, uint childTwoId) = _splitCertificate(_certificateId, _energy);

            _setOnChainDirectPurchasePrice(childOneId, cert.onChainDirectPurchasePrice);
            _setTradableToken(childOneId, cert.acceptedToken);

            _setOnChainDirectPurchasePrice(childTwoId, cert.onChainDirectPurchasePrice);
            _setTradableToken(childTwoId, cert.acceptedToken);

            emit LogPublishForSale(childOneId, cert.onChainDirectPurchasePrice, cert.acceptedToken);
            emit LogPublishForSale(childTwoId, cert.onChainDirectPurchasePrice, cert.acceptedToken);

            _buyCertificate(childOneId, msg.sender);
        }
    }

    /// @notice Splits a certificate and publishes the first split certificate for sale
    /// @param _certificateId The id of the certificate
    /// @param _energy The amount of energy in W for the 1st certificate
    /// @param _price the purchase price
    /// @param _tokenAddress the address of the ERC20 token address
    function splitAndPublishForSale(uint _certificateId, uint _energy, uint _price, address _tokenAddress) public {
        require(
            msg.sender == ownerOf(_certificateId) || isRole(RoleManagement.Role.Matcher, msg.sender),
            "You are not the owner of the certificate"
        );

        (uint childOneId, ) = _splitCertificate(_certificateId, _energy);

        publishForSale(childOneId, _price, _tokenAddress);

        emit LogPublishForSale(childOneId, _price, _tokenAddress);
    }

    /// @notice gets the price for a direct purchase onchain
    /// @param _certificateId the certificate-id
    function getOnChainDirectPurchasePrice(uint _certificateId) public view returns (uint) {
        return getCertificate(_certificateId).onChainDirectPurchasePrice;
    }

    function getCertificationRequests() public view returns (CertificateDefinitions.CertificationRequest[] memory) {
        return certificationRequests;
    }

    function getCertificationRequestsLength() public view returns (uint) {
        return certificationRequests.length;
    }

    function getAssetRequestedCertsForSMReadsLength(uint _assetId) public view returns (uint) {
        return assetRequestedCertsForSMReadsLength[_assetId];
    }

    function requestCertificates(uint _assetId, uint lastRequestedSMReadIndex) public {
        AssetDefinitions.Asset memory asset = assetLogic.getAssetById(_assetId);

        require(asset.owner == msg.sender, "msg.sender must be asset owner");

        AssetDefinitions.SmartMeterRead[] memory reads = assetLogic.getSmartMeterReadsForAsset(_assetId);

        require(lastRequestedSMReadIndex < reads.length, "requestCertificates: index should be lower than smart meter reads length");

        uint start = 0;
        uint requestedSMReadsLength = getAssetRequestedCertsForSMReadsLength(_assetId);

        if (requestedSMReadsLength > start) {
            start = requestedSMReadsLength;
        }

        require(lastRequestedSMReadIndex >= start, "requestCertificates: index has to be higher or equal to start index");

        certificationRequests.push(CertificateDefinitions.CertificationRequest(
            _assetId,
            start,
            lastRequestedSMReadIndex,
            CertificateDefinitions.CertificationRequestStatus.Pending
        ));

        _setAssetRequestedCertsForSMReadsLength(_assetId, lastRequestedSMReadIndex + 1);

        emit CertificationRequestCreated(_assetId, start, lastRequestedSMReadIndex);
    }

    function approveCertificationRequest(uint _certicationRequestIndex) public onlyRole(RoleManagement.Role.Issuer) {
        CertificateDefinitions.CertificationRequest storage request = certificationRequests[_certicationRequestIndex];

        require(
            request.status == CertificateDefinitions.CertificationRequestStatus.Pending,
            "approveCertificationRequest: request has to be in pending state"
        );

        AssetDefinitions.SmartMeterRead[] memory reads = assetLogic.getSmartMeterReadsForAsset(request.assetId);

        uint certifyEnergy = 0;
        for (uint i = request.readsStartIndex; i <= request.readsEndIndex; i++) {
            certifyEnergy += reads[i].energy;
        }

        AssetDefinitions.Asset memory asset = assetLogic.getAssetById(request.assetId);

        _createNewCertificate(request.assetId, certifyEnergy, asset.owner);

        request.status = CertificateDefinitions.CertificationRequestStatus.Approved;

        emit CertificationRequestApproved(request.assetId, request.readsStartIndex, request.readsEndIndex);
    }

    /**
        internal functions
    */

    function _createNewCertificate(uint assetId, uint energy, address owner) internal {
        uint newCertificateId = totalSupply();

        certificates[newCertificateId] = CertificateDefinitions.Certificate({
            assetId: assetId,
            energy: energy,
            status: uint(CertificateDefinitions.Status.Active),
            creationTime: block.timestamp,
            parentId: newCertificateId,
            children: new uint256[](0),
            forSale: false,
            acceptedToken: address(0x0),
            onChainDirectPurchasePrice: 0
        });

        _mint(owner, newCertificateId);

        emit LogCreatedCertificate(newCertificateId, energy, owner);
    }

    function _claimCertificate(uint certificateId) internal {
        CertificateDefinitions.Certificate memory cert = getCertificate(certificateId);

        require(msg.sender == ownerOf(certificateId), "_claimCertificate: You have to be the owner of the certificate.");
        require(cert.children.length == 0, "_claimCertificate: Unable to claim certificates split certificates.");
        require(
            cert.status != uint(CertificateDefinitions.Status.Claimed),
            "_claimCertificate: cannot claim a certificate that has already been claimed"
        );

        _setStatus(certificateId, CertificateDefinitions.Status.Claimed);
        emit LogCertificateClaimed(certificateId);
    }

    /// @notice sets the status for a certificate
    /// @param certificateId the id of the certificate
    /// @param status enum Status
    function _setStatus(uint certificateId, CertificateDefinitions.Status status) internal {
        CertificateDefinitions.Certificate storage certificate = certificates[certificateId];

        if (certificate.status != uint(status)) {
            certificate.status = uint(status);
        }
    }

    /// @notice sets the status for a certificate
    /// @param childrenIds id's of the children
    function _setChildren(uint certificateId, uint[2] memory childrenIds) internal {
        CertificateDefinitions.Certificate storage certificate = certificates[certificateId];
        certificate.children = childrenIds;
    }

    /// @notice Splits a certificate into two smaller ones, where (total - energy = 2ndCertificate)
    /// @param certificateId The id of the certificate
    /// @param energy The amount of energy in W for the 1st certificate
    function _splitCertificate(uint certificateId, uint energy) internal returns (uint childOneId, uint childTwoId) {
        CertificateDefinitions.Certificate memory parent = getCertificate(certificateId);

        require(parent.energy > energy, "_splitCertificate: The certificate doesn't have enough energy to be split.");
        require(parent.status == uint(CertificateDefinitions.Status.Active), "_splitCertificate: You can only split Active certificates.");
        require(parent.children.length == 0, "_splitCertificate: This certificate has already been split.");

        (uint childIdOne, uint childIdTwo) = _createChildCertificates(certificateId, energy);
        emit Transfer(address(0), ownerOf(childIdOne), childIdOne);
        emit Transfer(address(0), ownerOf(childIdTwo), childIdTwo);

        _setChildren(certificateId, [childIdOne, childIdTwo]);
        _setStatus(certificateId, CertificateDefinitions.Status.Split);
        emit LogCertificateSplit(certificateId, childIdOne, childIdTwo);

        return (childIdOne, childIdTwo);
    }

    /// @notice Creates 2 new children certificates
    /// @param parentId the id of the parent certificate
    /// @param energy the energy that should be splitted
    /// @return The ids of the certificate
    function _createChildCertificates(uint parentId, uint energy) internal returns (uint childOneId, uint childTwoId) {
        CertificateDefinitions.Certificate memory parent = certificates[parentId];

        uint childIdOne = totalSupply();
        certificates[childIdOne] = CertificateDefinitions.Certificate({
            assetId: parent.assetId,
            energy: energy,
            status: uint(CertificateDefinitions.Status.Active),
            creationTime: parent.creationTime,
            parentId: parentId,
            children: new uint256[](0),
            forSale: parent.forSale,
            acceptedToken: address(0x0),
            onChainDirectPurchasePrice: 0
        });
        _mint(ownerOf(parentId), childIdOne);

        uint childIdTwo = totalSupply();
        certificates[childIdTwo] = CertificateDefinitions.Certificate({
            assetId: parent.assetId,
            energy: parent.energy - energy,
            status: uint(CertificateDefinitions.Status.Active),
            creationTime: parent.creationTime,
            parentId: parentId,
            children: new uint256[](0),
            forSale: parent.forSale,
            acceptedToken: address(0x0),
            onChainDirectPurchasePrice: 0
        });
        _mint(ownerOf(parentId), childIdTwo);

        return (childIdOne, childIdTwo);
    }

    function _buyCertificate(uint _certificateId, address buyer) internal {
        CertificateDefinitions.Certificate memory cert = getCertificate(_certificateId);

        require(buyer != ownerOf(_certificateId), "Can't buy your own certificates.");
        require(cert.forSale == true, "Unable to buy a certificate that is not for sale.");
        require(cert.status == uint(CertificateDefinitions.Status.Active), "You can only buy Active certificates.");

        bool isOnChainSettlement = cert.acceptedToken != address(0x0);

        if (isOnChainSettlement) {
            ERC20Interface erc20 = ERC20Interface(cert.acceptedToken);
            require(
                erc20.balanceOf(buyer) >= cert.onChainDirectPurchasePrice,
                "_buyCertificate: the buyer should have enough tokens to buy"
            );
            require(
                erc20.allowance(buyer, ownerOf(_certificateId)) >= cert.onChainDirectPurchasePrice,
                "_buyCertificate: the buyer should have enough allowance to buy"
            );
            erc20.transferFrom(buyer, ownerOf(_certificateId), cert.onChainDirectPurchasePrice);
        } else {
            //  TO-DO: Implement off-chain settlement checks
            //  For now automatically transfer the certificate
            //  if it's an off chain settlement
        }

        _transferFrom(ownerOf(_certificateId), buyer, _certificateId);
        _removeTokenAndPrice(_certificateId);

        unpublishForSale(_certificateId);
    }

    /// @notice sets the price (as ERC20 token) for direct onchain purchasement
    /// @param _certificateId the id of the certificate
    /// @param _price the new price (as ERC20 tokens)
    function _setOnChainDirectPurchasePrice(uint _certificateId, uint _price) internal {
        CertificateDefinitions.Certificate storage cert = certificates[_certificateId];
        cert.onChainDirectPurchasePrice = _price;
    }

    /// @notice sets the tradable token (ERC20 contracts) of a certificate
    /// @param _certificateId the certificate ID
    /// @param _token the ERC20-tokenaddress
    function _setTradableToken(uint _certificateId, address _token) internal {
        CertificateDefinitions.Certificate storage cert = certificates[_certificateId];
        cert.acceptedToken = _token;
    }

    /// @notice removes accepted token and the price for an certificate
    /// @dev should be called after the transfer of an certificate
    /// @param _certificateId the id of the certificate
    function _removeTokenAndPrice(uint _certificateId) internal {
        _setTradableToken(_certificateId, address(0));
        _setOnChainDirectPurchasePrice(_certificateId, 0);
    }

    function _setAssetRequestedCertsForSMReadsLength(uint assetId, uint readsLength) internal {
        assetRequestedCertsForSMReadsLength[assetId] = readsLength;
    }
}