pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/ERC721Enumerable.sol";

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

    event CertificationRequestCreated(uint assetId, uint readsStartIndex, uint readsEndIndex);
    event CertificationRequestApproved(uint assetId, uint readsStartIndex, uint readsEndIndex);

    mapping(uint => uint) internal assetRequestedCertsForSMReadsLength;

    CertificateDefinitions.CertificationRequest[] private certificationRequests;

    // Mapping of tokenId to Certificate
    mapping(uint256 => CertificateDefinitions.Certificate) private certificates;

    modifier onlyCertificateOwner(uint _certificateId) {
        require(
            ownerOf(_certificateId) == msg.sender || isRole(RoleManagement.Role.Matcher, msg.sender),
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
    function splitCertificate(uint certificateId, uint energy) public returns (uint childOneId, uint childTwoId) {
        require(
            msg.sender == ownerOf(certificateId) || isRole(RoleManagement.Role.Matcher, msg.sender),
            "splitCertificate: You are not the owner of the certificate"
        );

        return _splitCertificate(certificateId, energy);
    }

    /// @notice gets whether the certificate is claimed
    /// @param _certificateId The id of the requested certificate
    /// @return flag whether the certificate is claimed
    function isClaimed(uint _certificateId) public view returns (bool) {
        return getCertificate(_certificateId).status == uint(CertificateDefinitions.Status.Claimed);
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

        _createNewCertificate(request.assetId, certifyEnergy, asset.owner,  request.readsStartIndex, request.readsEndIndex);

        request.status = CertificateDefinitions.CertificationRequestStatus.Approved;

        emit CertificationRequestApproved(request.assetId, request.readsStartIndex, request.readsEndIndex);
    }

    /**
        internal functions
    */
    function _createNewCertificate(uint assetId, uint energy, address owner, uint readsStartIndex, uint readsEndIndex) internal {
        uint newCertificateId = totalSupply();

        certificates[newCertificateId] = CertificateDefinitions.Certificate({
            assetId: assetId,
            energy: energy,
            status: uint(CertificateDefinitions.Status.Active),
            creationTime: block.timestamp,
            parentId: newCertificateId,
            children: new uint256[](0),
            readsStartIndex: readsStartIndex,
            readsEndIndex: readsEndIndex
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
        AssetDefinitions.SmartMeterRead[] memory reads = assetLogic.getSmartMeterReadsForAsset(parent.assetId);

        uint parentEnergy = 0;
        uint index = parent.readsStartIndex;
        while(parentEnergy < energy) {
            parentEnergy += reads[index++].energy;
        }
        if (parentEnergy > energy) {
            index--;
        }

        uint childIdOne = totalSupply();
        certificates[childIdOne] = CertificateDefinitions.Certificate({
            assetId: parent.assetId,
            energy: energy,
            status: uint(CertificateDefinitions.Status.Active),
            creationTime: parent.creationTime,
            parentId: parentId,
            children: new uint256[](0),
            readsStartIndex: parent.readsStartIndex,
            readsEndIndex: index
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
            readsStartIndex: index,
            readsEndIndex: parent.readsEndIndex
        });
        _mint(ownerOf(parentId), childIdTwo);

        return (childIdOne, childIdTwo);
    }

    function _setAssetRequestedCertsForSMReadsLength(uint assetId, uint readsLength) internal {
        assetRequestedCertsForSMReadsLength[assetId] = readsLength;
    }
}