pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/ERC721Enumerable.sol";

import "@energyweb/user-registry/contracts/RoleManagement.sol";
import "@energyweb/user-registry/contracts/Interfaces/IUserLogic.sol";
import "@energyweb/asset-registry/contracts/IAssetLogic.sol";
import "@energyweb/asset-registry/contracts/AssetStructs.sol";

contract CertificateLogic is Initializable, ERC721, ERC721Enumerable, RoleManagement {

    IUserLogic private userLogic;
    IAssetLogic private assetLogic;

    event LogCreatedCertificate(uint indexed _certificateId, uint energy, address owner);
    event LogCertificateClaimed(uint indexed _certificateId);
    event LogCertificateSplit(uint indexed _certificateId, uint _childOne, uint _childTwo);

    enum CertificationRequestStatus {
        Pending,
        Approved
    }

    enum Status {
        Active,
        Claimed,
        Split
    }

    struct CertificationRequest {
        uint assetId;
        uint readsStartIndex;
        uint readsEndIndex;
        CertificationRequestStatus status;
    }

    struct Certificate {
        uint assetId;
        uint energy;
        uint status;
        uint creationTime;
        uint parentId;
        uint[] children;
    }

    mapping(uint => uint) internal assetRequestedCertsForSMReadsLength;

    CertificationRequest[] private certificationRequests;

    // Mapping of tokenId to Certificate
    mapping(uint256 => Certificate) private certificates;

    function initialize(IUserLogic _userLogicContract, IAssetLogic _assetLogicContract) public initializer {
        assetLogic = _assetLogicContract;
        userLogic = _userLogicContract;

        ERC721.initialize();
        ERC721Enumerable.initialize();
        RoleManagement.initialize(userLogic);
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
    function getCertificate(uint256 certificateId) public view returns (Certificate memory) {
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
            "claimCertificateBulk: maximum num of certificates to claim in one bulk tx is 100"
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
        return getCertificate(_certificateId).status == uint(Status.Claimed);
    }

    function getCertificationRequests() public view returns (CertificationRequest[] memory) {
        return certificationRequests;
    }

    function getCertificationRequestsLength() public view returns (uint) {
        return certificationRequests.length;
    }

    function getAssetRequestedCertsForSMReadsLength(uint _assetId) public view returns (uint) {
        return assetRequestedCertsForSMReadsLength[_assetId];
    }

    function requestCertificates(uint _assetId, uint lastRequestedSMReadIndex) public {
        AssetStructs.Asset memory asset = assetLogic.getAssetById(_assetId);

        require(asset.owner == msg.sender, "msg.sender must be asset owner");

        AssetStructs.SmartMeterRead[] memory reads = assetLogic.getSmartMeterReadsForAsset(_assetId);

        require(lastRequestedSMReadIndex < reads.length, "requestCertificates: index should be lower than smart meter reads length");

        uint start = 0;
        uint requestedSMReadsLength = getAssetRequestedCertsForSMReadsLength(_assetId);

        if (requestedSMReadsLength > start) {
            start = requestedSMReadsLength;
        }

        require(lastRequestedSMReadIndex >= start, "requestCertificates: index has to be higher or equal to start index");

        certificationRequests.push(CertificationRequest(
            _assetId,
            start,
            lastRequestedSMReadIndex,
            CertificationRequestStatus.Pending
        ));

        _setAssetRequestedCertsForSMReadsLength(_assetId, lastRequestedSMReadIndex + 1);
    }

    function approveCertificationRequest(uint _certicationRequestIndex) public onlyRole(RoleManagement.Role.Issuer) {
        CertificationRequest storage request = certificationRequests[_certicationRequestIndex];

        require(request.status == CertificationRequestStatus.Pending, "approveCertificationRequest: request has to be in pending state");

        AssetStructs.SmartMeterRead[] memory reads = assetLogic.getSmartMeterReadsForAsset(request.assetId);

        uint certifyEnergy = 0;
        for (uint i = request.readsStartIndex; i <= request.readsEndIndex; i++) {
            certifyEnergy += reads[i].energy;
        }

        AssetStructs.Asset memory asset = assetLogic.getAssetById(request.assetId);

        _createNewCertificate(request.assetId, certifyEnergy, asset.owner);

        request.status = CertificationRequestStatus.Approved;
    }

    /**
        internal functions
    */

    function _createNewCertificate(uint assetId, uint energy, address owner) internal {
        uint newCertificateId = totalSupply();

        certificates[newCertificateId] = Certificate({
            assetId: assetId,
            energy: energy,
            status: uint(Status.Active),
            creationTime: block.timestamp,
            parentId: newCertificateId,
            children: new uint256[](0)
        });

        _mint(owner, newCertificateId);

        emit LogCreatedCertificate(newCertificateId, energy, owner);
    }

    function _claimCertificate(uint certificateId) internal {
        Certificate memory cert = getCertificate(certificateId);

        require(msg.sender == ownerOf(certificateId), "_claimCertificate: You have to be the owner of the certificate.");
        require(cert.children.length == 0, "_claimCertificate: Unable to claim certificates split certificates.");
        require(cert.status != uint(Status.Claimed), "_claimCertificate: cannot claim a certificate that has already been claimed");

        _setStatus(certificateId, Status.Claimed);
        emit LogCertificateClaimed(certificateId);
    }

    /// @notice sets the status for a certificate
    /// @param certificateId the id of the certificate
    /// @param status enum Status
    function _setStatus(uint certificateId, Status status) internal {
        Certificate storage certificate = certificates[certificateId];

        if (certificate.status != uint(status)) {
            certificate.status = uint(status);
        }
    }

    /// @notice sets the status for a certificate
    /// @param childrenIds id's of the children
    function _setChildren(uint certificateId, uint[2] memory childrenIds) internal {
        Certificate storage certificate = certificates[certificateId];
        certificate.children = childrenIds;
    }

    /// @notice Splits a certificate into two smaller ones, where (total - energy = 2ndCertificate)
    /// @param certificateId The id of the certificate
    /// @param energy The amount of energy in W for the 1st certificate
    function _splitCertificate(uint certificateId, uint energy) internal returns (uint childOneId, uint childTwoId) {
        Certificate memory parent = getCertificate(certificateId);

        require(parent.energy > energy, "_splitCertificate: The certificate doesn't have enough energy to be split.");
        require(parent.status == uint(Status.Active), "_splitCertificate: You can only split Active certificates.");
        require(parent.children.length == 0, "_splitCertificate: This certificate has already been split.");

        (uint childIdOne, uint childIdTwo) = _createChildCertificates(certificateId, energy);
        emit Transfer(address(0), ownerOf(childIdOne), childIdOne);
        emit Transfer(address(0), ownerOf(childIdTwo), childIdTwo);

        _setChildren(certificateId, [childIdOne, childIdTwo]);
        _setStatus(certificateId, Status.Split);
        emit LogCertificateSplit(certificateId, childIdOne, childIdTwo);

        return (childIdOne, childIdTwo);
    }

    /// @notice Creates 2 new children certificates
    /// @param parentId the id of the parent certificate
    /// @param energy the energy that should be splitted
    /// @return The ids of the certificate
    function _createChildCertificates(uint parentId, uint energy) internal returns (uint childOneId, uint childTwoId) {
        Certificate memory parent = certificates[parentId];

        uint childIdOne = totalSupply();
        certificates[childIdOne] = Certificate({
            assetId: parent.assetId,
            energy: energy,
            status: uint(Status.Active),
            creationTime: parent.creationTime,
            parentId: parentId,
            children: new uint256[](0)
        });
        _mint(ownerOf(parentId), childIdOne);

        uint childIdTwo = totalSupply();
        certificates[childIdTwo] = Certificate({
            assetId: parent.assetId,
            energy: parent.energy - energy,
            status: uint(Status.Active),
            creationTime: parent.creationTime,
            parentId: parentId,
            children: new uint256[](0)
        });
        _mint(ownerOf(parentId), childIdTwo);

        return (childIdOne, childIdTwo);
    }

    function _setAssetRequestedCertsForSMReadsLength(uint assetId, uint readsLength) internal {
        assetRequestedCertsForSMReadsLength[assetId] = readsLength;
    }
}