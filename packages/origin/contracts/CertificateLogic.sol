pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/ERC721Enumerable.sol";

import "@energyweb/user-registry/contracts/RoleManagement.sol";
import "@energyweb/asset-registry/contracts/IDeviceLogic.sol";
import "@energyweb/asset-registry/contracts/DeviceDefinitions.sol";

import "./CertificateDefinitions.sol";
import "./ICertificateLogic.sol";

contract CertificateLogic is Initializable, ERC721, ERC721Enumerable, RoleManagement, ICertificateLogic {

    bool private _initialized;
    IDeviceLogic private deviceLogic;

    event LogCreatedCertificate(uint indexed _certificateId, uint energy, address owner);
    event LogCertificateClaimed(uint indexed _certificateId);
    event LogCertificateSplit(uint indexed _certificateId, uint _childOne, uint _childTwo);

    event CertificationRequestCreated(uint deviceId, uint readsStartIndex, uint readsEndIndex);
    event CertificationRequestApproved(uint deviceId, uint readsStartIndex, uint readsEndIndex);

    mapping(uint => uint) internal deviceRequestedCertsForSMReadsLength;

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

    function initialize(address _deviceLogicAddress) public initializer {
        require(_deviceLogicAddress != address(0), "initialize: Cannot use address 0x0 as _deviceLogicAddress.");

        deviceLogic = IDeviceLogic(_deviceLogicAddress);

        require(deviceLogic.userLogicAddress() != address(0), "initialize: deviceLogic hasn't been initialized yet.");

        ERC721.initialize();
        ERC721Enumerable.initialize();
        RoleManagement.initialize(deviceLogic.userLogicAddress());

        _initialized = true;
    }

    function deviceLogicAddress() public view returns (address) {
        require(_initialized == true, "deviceLogicAddress: The contract has not been initialized yet.");
        require(address(deviceLogic) != address(0), "deviceLogicAddress: The device logic address is set to 0x0 address.");

        return address(deviceLogic);
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

    function getDeviceRequestedCertsForSMReadsLength(uint _deviceId) public view returns (uint) {
        return deviceRequestedCertsForSMReadsLength[_deviceId];
    }

    function requestCertificates(uint _deviceId, uint lastRequestedSMReadIndex) public {
        DeviceDefinitions.Device memory device = deviceLogic.getDeviceById(_deviceId);

        require(device.owner == msg.sender, "msg.sender must be device owner");

        DeviceDefinitions.SmartMeterRead[] memory reads = deviceLogic.getSmartMeterReadsForDevice(_deviceId);

        require(lastRequestedSMReadIndex < reads.length, "requestCertificates: index should be lower than smart meter reads length");

        uint start = 0;
        uint requestedSMReadsLength = getDeviceRequestedCertsForSMReadsLength(_deviceId);

        if (requestedSMReadsLength > start) {
            start = requestedSMReadsLength;
        }

        require(lastRequestedSMReadIndex >= start, "requestCertificates: index has to be higher or equal to start index");

        certificationRequests.push(CertificateDefinitions.CertificationRequest(
            _deviceId,
            start,
            lastRequestedSMReadIndex,
            CertificateDefinitions.CertificationRequestStatus.Pending
        ));

        _setDeviceRequestedCertsForSMReadsLength(_deviceId, lastRequestedSMReadIndex + 1);

        emit CertificationRequestCreated(_deviceId, start, lastRequestedSMReadIndex);
    }

    function approveCertificationRequest(uint _certicationRequestIndex) public onlyRole(RoleManagement.Role.Issuer) {
        CertificateDefinitions.CertificationRequest storage request = certificationRequests[_certicationRequestIndex];

        require(
            request.status == CertificateDefinitions.CertificationRequestStatus.Pending,
            "approveCertificationRequest: request has to be in pending state"
        );

        DeviceDefinitions.SmartMeterRead[] memory reads = deviceLogic.getSmartMeterReadsForDevice(request.deviceId);

        uint certifyEnergy = 0;
        for (uint i = request.readsStartIndex; i <= request.readsEndIndex; i++) {
            certifyEnergy += reads[i].energy;
        }

        DeviceDefinitions.Device memory device = deviceLogic.getDeviceById(request.deviceId);

        _createNewCertificate(request.deviceId, certifyEnergy, device.owner,  request.readsStartIndex, request.readsEndIndex);

        request.status = CertificateDefinitions.CertificationRequestStatus.Approved;

        emit CertificationRequestApproved(request.deviceId, request.readsStartIndex, request.readsEndIndex);
    }

    /**
        internal functions
    */
    function _createNewCertificate(uint deviceId, uint energy, address owner, uint readsStartIndex, uint readsEndIndex) internal {
        uint newCertificateId = totalSupply();

        certificates[newCertificateId] = CertificateDefinitions.Certificate({
            deviceId: deviceId,
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
        DeviceDefinitions.SmartMeterRead[] memory reads = deviceLogic.getSmartMeterReadsForDevice(parent.deviceId);

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
            deviceId: parent.deviceId,
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
            deviceId: parent.deviceId,
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

    function _setDeviceRequestedCertsForSMReadsLength(uint deviceId, uint readsLength) internal {
        deviceRequestedCertsForSMReadsLength[deviceId] = readsLength;
    }
}