// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "./Registry.sol";

contract Issuer is Initializable, OwnableUpgradeable {
    event CertificationRequested(address indexed _owner, uint256 indexed _id);
    event CertificationRequestApproved(address indexed _owner, uint256 indexed _id, uint256 indexed _certificateId);
    event CertificationRequestRevoked(address indexed _owner, uint256 indexed _id);

    event CertificateRevoked(uint256 indexed _certificateId);

    int public certificateTopic;
    Registry public registry;
    address public privateIssuer;

    mapping(uint256 => CertificationRequest) private certificationRequests;
    mapping(uint256 => uint256) private requestToCertificate;

    uint256 private latestCertificationRequestId;

    mapping(uint256 => bool) private revokedCertificates;

    struct CertificationRequest {
        address owner;
        bytes data;
        bool approved;
        bool revoked;
        address sender;
    }

    function initialize(int _certificateTopic, address _registry) public initializer {
        require(_registry != address(0), "initialize: Cannot use address 0x0 as registry address.");

        certificateTopic = _certificateTopic;

        registry = Registry(_registry);
        OwnableUpgradeable.__Ownable_init();
    }

    function setPrivateIssuer(address _privateIssuer) public onlyOwner {
        require(_privateIssuer != address(0), "setPrivateIssuer(): Cannot use address 0x0 as the private issuer address.");
        require(privateIssuer == address(0), "setPrivateIssuer(): private issuance contract already set.");

        privateIssuer = _privateIssuer;
    }

	/*
		Certification requests
	*/

    function getCertificationRequest(uint256 _requestId) public view returns (CertificationRequest memory) {
        return certificationRequests[_requestId];
    }

    function requestCertificationFor(bytes memory _data, address _owner) public returns (uint256) {
        uint256 id = ++latestCertificationRequestId;

        certificationRequests[id] = CertificationRequest({
            owner: _owner,
            data: _data,
            approved: false,
            revoked: false,
            sender: _msgSender()
        });

        emit CertificationRequested(_owner, id);

        return id;
    }

    function requestCertification(bytes calldata _data) external returns (uint256) {
        return requestCertificationFor(_data, _msgSender());
    }

    function isRequestValid(uint256 _requestId) external view returns (bool) {
        CertificationRequest memory request = certificationRequests[_requestId];
        uint certificateId = requestToCertificate[_requestId];

        return _requestId <= latestCertificationRequestId
            && request.approved
            && !request.revoked
            && !revokedCertificates[certificateId];
    }

    function revokeRequest(uint256 _requestId) external {
        CertificationRequest storage request = certificationRequests[_requestId];

        require(_msgSender() == request.owner || _msgSender() == OwnableUpgradeable.owner(), "revokeRequest(): Only the request creator can revoke the request.");
        require(!request.revoked, "revokeRequest(): Already revoked");
        require(!request.approved, "revokeRequest(): You can't revoke approved requests");

        request.revoked = true;

        emit CertificationRequestRevoked(request.owner, _requestId);
    }

    function revokeCertificate(uint256 _certificateId) external onlyOwner {
        require(!revokedCertificates[_certificateId], "revokeCertificate(): Already revoked");
        revokedCertificates[_certificateId] = true;

        emit CertificateRevoked(_certificateId);
    }

    function approveCertificationRequest(
        uint256 _requestId,
        uint256 _value,
        bytes memory _validityData
    ) public returns (uint256) {
        require(_msgSender() == owner() || _msgSender() == privateIssuer, "approveCertificationRequest(): caller is not the owner or private issuer contract");
        require(_requestNotApprovedOrRevoked(_requestId), "approveCertificationRequest(): request already approved or revoked");

        CertificationRequest storage request = certificationRequests[_requestId];
        request.approved = true;

        uint256 certificateId = registry.issue(request.owner, _validityData, certificateTopic, _value, request.data);
        requestToCertificate[_requestId] = certificateId;

        emit CertificationRequestApproved(request.owner, _requestId, certificateId);

        return certificateId;
    }

    function issue(address _to, uint256 _value, bytes memory _data) public onlyOwner returns (uint256) {
        uint256 requestId = requestCertificationFor(_data, _to);

        return approveCertificationRequest(
            requestId,
            _value,
            abi.encodeWithSignature("isRequestValid(uint256)",requestId)
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
        CertificationRequest memory request = certificationRequests[_requestId];

        return !request.approved && !request.revoked;
    }
}