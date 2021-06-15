// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.4;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "./Registry.sol";

contract Issuer is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    event CertificationRequested(address indexed _owner, uint256 indexed _id);
    event CertificationRequestedBatch(address[] indexed _owners, uint256[] indexed _id);
    event CertificationRequestApproved(address indexed _owner, uint256 indexed _id, uint256 indexed _certificateId);
    event CertificationRequestBatchApproved(address[] indexed _owners, uint256[] indexed _ids, uint256[] indexed _certificateIds);
    event CertificationRequestRevoked(address indexed _owner, uint256 indexed _id);

    event CertificateRevoked(uint256 indexed _certificateId);

    uint256 public certificateTopic;
    Registry public registry;
    address public privateIssuer;

    mapping(uint256 => CertificationRequest) private _certificationRequests;
    mapping(uint256 => uint256) private requestToCertificate;

    uint256 private _latestCertificationRequestId;

    mapping(uint256 => bool) private _revokedCertificates;

    struct CertificationRequest {
        address owner;
        bytes data;
        bool approved;
        bool revoked;
        address sender;
    }

    function initialize(uint256 _certificateTopic, address _registry) public initializer {
        require(_registry != address(0), "Issuer::initialize: Cannot use address 0x0 as registry address.");

        certificateTopic = _certificateTopic;

        registry = Registry(_registry);
        OwnableUpgradeable.__Ownable_init();
        UUPSUpgradeable.__UUPSUpgradeable_init();
    }

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

        for (uint i = 1; i <= _data.length; i++) {
            uint256 id = i + _latestCertificationRequestId;

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

        return requestIds;
    }

    function requestCertification(bytes calldata _data) external returns (uint256) {
        return requestCertificationFor(_data, _msgSender());
    }

    function isRequestValid(uint256 _requestId) external view returns (bool) {
        CertificationRequest memory request = _certificationRequests[_requestId];
        uint certificateId = requestToCertificate[_requestId];

        return _requestId <= _latestCertificationRequestId
            && request.approved
            && !request.revoked
            && !_revokedCertificates[certificateId];
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

		for (uint i = 0; i < _requestIds.length; i++) {
            require(_requestNotApprovedOrRevoked(_requestIds[i]), "Issuer::approveCertificationRequestBatch: request already approved or revoked");
		}

        address[] memory owners = new address[](_requestIds.length);
        bytes[] memory data = new bytes[](_requestIds.length);
        bytes[] memory validityData = new bytes[](_requestIds.length);

        for (uint i = 0; i < _requestIds.length; i++) {
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

        for (uint i = 0; i < _requestIds.length; i++) {
            requestToCertificate[_requestIds[i]] = certificateIds[i];
        }

        emit CertificationRequestBatchApproved(owners, _requestIds, certificateIds);

        return certificateIds;
    }

    function issue(address _to, uint256 _value, bytes memory _data) public onlyOwner returns (uint256) {
        uint256 requestId = requestCertificationFor(_data, _to);

        return approveCertificationRequest(
            requestId,
            _value
        );
    }

    function issueBatch(address[] memory _to, uint256[] memory _values, bytes[] memory _data) public onlyOwner returns (uint256[] memory) {
        uint256[] memory requestIds = requestCertificationForBatch(_data, _to);

        return approveCertificationRequestBatch(
            requestIds,
            _values
        );
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
    
	function _authorizeUpgrade(address) internal override onlyOwner {}
}