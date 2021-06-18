// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.4;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "./Registry.sol";

/// @title Issuer contract
/// @notice Used to manage the request/approve workflow for issuing ERC-1888 certificates.
contract Issuer is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    event CertificationRequested(address indexed _owner, uint256 indexed _id);
    event CertificationRequestedBatch(address[] indexed _owners, uint256[] indexed _id);
    event CertificationRequestApproved(address indexed _owner, uint256 indexed _id, uint256 indexed _certificateId);
    event CertificationRequestBatchApproved(address[] indexed _owners, uint256[] indexed _ids, uint256[] indexed _certificateIds);
    event CertificationRequestRevoked(address indexed _owner, uint256 indexed _id);

    event CertificateRevoked(uint256 indexed _certificateId);

    // Certificate topic - check ERC-1888 topic description
    uint256 public certificateTopic;

    // ERC-1888 contract to issue certificates to
    Registry public registry;

    // Optional: Private Issuance contract
    address public privateIssuer;

    // Storage for CertificationRequest structs
    mapping(uint256 => CertificationRequest) private _certificationRequests;

    // Mapping from request ID to certificate ID
    mapping(uint256 => uint256) private requestToCertificate;

    // Incrementing nonce, used for generating certification request IDs
    uint256 private _latestCertificationRequestId;

    // Mapping to whether a certificate with a specific ID has been revoked by the Issuer
    mapping(uint256 => bool) private _revokedCertificates;

    struct CertificationRequest {
        address owner; // Owner of the request
        bytes data;
        bool approved;
        bool revoked;
        address sender;  // User that triggered the request creation
    }

	/// @notice Contructor.
    /// @dev Uses the OpenZeppelin `initializer` for upgradeability.
    /// @dev `_registry` cannot be the zero address.
    function initialize(uint256 _certificateTopic, address _registry) public initializer {
        require(_registry != address(0), "Issuer::initialize: Cannot use address 0x0 as registry address.");

        certificateTopic = _certificateTopic;

        registry = Registry(_registry);
        OwnableUpgradeable.__Ownable_init();
        UUPSUpgradeable.__UUPSUpgradeable_init();
    }

	/// @notice Attaches a private issuance contract to this issuance contract.
    /// @dev `_privateIssuer` cannot be the zero address.
    function setPrivateIssuer(address _privateIssuer) public onlyOwner {
        require(_privateIssuer != address(0), "Issuer::setPrivateIssuer: Cannot use address 0x0 as the private issuer address.");
        require(privateIssuer == address(0), "Issuer::setPrivateIssuer: private issuance contract already set.");

        privateIssuer = _privateIssuer;
    }

	/*
		Certification requests
	*/

    function getCertificationRequest(uint256 _requestId) public view returns (CertificationRequest memory) {
        return _certificationRequests[_requestId];
    }

    function requestCertificationFor(bytes memory _data, address _owner) public returns (uint256) {
        uint256 id = ++_latestCertificationRequestId;

        _certificationRequests[id] = CertificationRequest({
            owner: _owner,
            data: _data,
            approved: false,
            revoked: false,
            sender: _msgSender()
        });

        emit CertificationRequested(_owner, id);

        return id;
    }

    function requestCertificationForBatch(bytes[] memory _data, address[] memory _owners) public returns (uint256[] memory) {
        uint256[] memory requestIds = new uint256[](_data.length);

        for (uint256 i = 0; i < _data.length; i++) {
            uint256 id = i + _latestCertificationRequestId + 1;

            _certificationRequests[id] = CertificationRequest({
                owner: _owners[i],
                data: _data[i],
                approved: false,
                revoked: false,
                sender: _msgSender()
            });

            requestIds[i] = id;
        }

        emit CertificationRequestedBatch(_owners, requestIds);

        _latestCertificationRequestId = requestIds[requestIds.length - 1];

        return requestIds;
    }

    function requestCertification(bytes calldata _data) external returns (uint256) {
        return requestCertificationFor(_data, _msgSender());
    }

    function revokeRequest(uint256 _requestId) external {
        CertificationRequest storage request = _certificationRequests[_requestId];

        require(_msgSender() == request.owner || _msgSender() == OwnableUpgradeable.owner(), "Issuer::revokeRequest: Only the request creator can revoke the request.");
        require(!request.revoked, "Issuer::revokeRequest: Already revoked");
        require(!request.approved, "Issuer::revokeRequest: You can't revoke approved requests");

        request.revoked = true;

        emit CertificationRequestRevoked(request.owner, _requestId);
    }

    function revokeCertificate(uint256 _certificateId) external onlyOwner {
        require(!_revokedCertificates[_certificateId], "Issuer::revokeCertificate: Already revoked");
        _revokedCertificates[_certificateId] = true;

        emit CertificateRevoked(_certificateId);
    }

    function approveCertificationRequest(
        uint256 _requestId,
        uint256 _value
    ) public returns (uint256) {
        require(_msgSender() == owner() || _msgSender() == privateIssuer, "Issuer::approveCertificationRequest: caller is not the owner or private issuer contract");
        require(_requestNotApprovedOrRevoked(_requestId), "Issuer::approveCertificationRequest: request already approved or revoked");

        CertificationRequest storage request = _certificationRequests[_requestId];
        request.approved = true;

        uint256 certificateId = registry.issue(
            request.owner,
            abi.encodeWithSignature("isRequestValid(uint256)",_requestId),
            certificateTopic,
            _value,
            request.data
        );

        requestToCertificate[_requestId] = certificateId;

        emit CertificationRequestApproved(request.owner, _requestId, certificateId);

        return certificateId;
    }

    function approveCertificationRequestBatch(
        uint256[] memory _requestIds,
        uint256[] memory _values
    ) public returns (uint256[] memory) {
        require(_msgSender() == owner() || _msgSender() == privateIssuer, "Issuer::approveCertificationRequestBatch: caller is not the owner or private issuer contract");

		for (uint256 i = 0; i < _requestIds.length; i++) {
            require(_requestNotApprovedOrRevoked(_requestIds[i]), "Issuer::approveCertificationRequestBatch: request already approved or revoked");
		}

        address[] memory owners = new address[](_requestIds.length);
        bytes[] memory data = new bytes[](_requestIds.length);
        bytes[] memory validityData = new bytes[](_requestIds.length);

        for (uint256 i = 0; i < _requestIds.length; i++) {
            CertificationRequest storage request = _certificationRequests[_requestIds[i]];
            request.approved = true;

            owners[i] = request.owner;
            data[i] = request.data;
            validityData[i] = abi.encodeWithSignature("isRequestValid(uint256)",_requestIds[i]);
        }

        uint256[] memory certificateIds = registry.batchIssueMultiple(
            owners,
            data,
            certificateTopic,
            _values,
            validityData
        );

        for (uint256 i = 0; i < _requestIds.length; i++) {
            requestToCertificate[_requestIds[i]] = certificateIds[i];
        }

        emit CertificationRequestBatchApproved(owners, _requestIds, certificateIds);

        return certificateIds;
    }

    /// @notice Directly issue a certificate without going through the request/approve procedure manually.
    function issue(address _to, uint256 _value, bytes memory _data) public onlyOwner returns (uint256) {
        uint256 requestId = requestCertificationFor(_data, _to);

        return approveCertificationRequest(
            requestId,
            _value
        );
    }

    /// @notice Directly issue a batch of certificates without going through the request/approve procedure manually.
    function issueBatch(address[] memory _to, uint256[] memory _values, bytes[] memory _data) public onlyOwner returns (uint256[] memory) {
        uint256[] memory requestIds = requestCertificationForBatch(_data, _to);

        return approveCertificationRequestBatch(
            requestIds,
            _values
        );
    }

    /// @notice Validation for certification requests.
    /// @dev Used by other contracts to validate the token.
    /// @dev `_requestId` has to be an existing ID.
    function isRequestValid(uint256 _requestId) external view returns (bool) {
        require(_requestId <= _latestCertificationRequestId, "Issuer::isRequestValid: certification request ID out of bounds");

        CertificationRequest memory request = _certificationRequests[_requestId];
        uint256 certificateId = requestToCertificate[_requestId];

        return request.approved
            && !request.revoked
            && !_revokedCertificates[certificateId];
    }

	/*
		Info
	*/

    function getRegistryAddress() external view returns (address) {
        return address(registry);
    }

    function getPrivateIssuerAddress() external view returns (address) {
        return privateIssuer;
    }

    function version() external pure returns (string memory) {
        return "v0.1";
    }

	/*
		Private methods
	*/

    function _requestNotApprovedOrRevoked(uint256 _requestId) internal view returns (bool) {
        CertificationRequest memory request = _certificationRequests[_requestId];

        return !request.approved && !request.revoked;
    }
    
    /// @notice Needed for OpenZeppelin contract upgradeability.
    /// @dev Allow only to the owner of the contract.
	function _authorizeUpgrade(address) internal override onlyOwner {}
}