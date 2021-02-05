pragma solidity ^0.5.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol";

import "./Registry.sol";

contract Issuer is Initializable, Ownable {
    event CertificationRequested(address indexed _owner, uint256 indexed _id, string indexed _deviceId);
    event CertificationRequestApproved(address indexed _owner, uint256 indexed _id, uint256 indexed _certificateId);
    event CertificationRequestRevoked(address indexed _owner, uint256 indexed _id);

	event CommitmentUpdated(address indexed _owner, uint256 indexed _id, bytes32 _commitment);
	event MigrateToPublicRequested(address indexed _owner, uint256 indexed _id);
	event PrivateTransferRequested(address indexed _owner, uint256 indexed _certificateId);
	event CertificateMigratedToPublic(uint256 indexed _certificateId, address indexed _owner, uint256 indexed _amount);
    event CertificateRevoked(uint256 indexed _certificateId);

    int public certificateTopic;
    Registry public registry;

    mapping(uint256 => CertificationRequest) private certificationRequests;
    mapping(uint256 => uint256) private requestToCertificate;

	uint256 private requestMigrateToPublicNonce;
	uint256 private requestPrivateTransferNonce;
    uint256 private certificationRequestNonce;

	mapping(uint256 => RequestStateChange) private requestMigrateToPublicStorage;
	mapping(uint256 => PrivateTransferRequest) private requestPrivateTransferStorage;

	mapping(uint256 => bool) private migrations;
    mapping(uint256 => bool) private revokedCertificates;
	mapping(uint256 => bytes32) private commitments;

    struct CertificationRequest {
        address owner;
        bytes data;
        bool approved;
        bool revoked;
        bool isPrivate;
        address sender;
    }

    struct PrivateTransferRequest {
		address owner;
		bytes32 hash;
	}

	struct RequestStateChange {
		address owner;
		uint256 certificateId;
		bytes32 hash;
		bool approved;
	}

	struct Proof {
		bool left;
		bytes32 hash;
	}

    function initialize(int _certificateTopic, address _registry, address _owner) public initializer {
        require(_registry != address(0), "initialize: Cannot use address 0x0 as registry address.");
        require(_owner != address(0), "initialize: Cannot use address 0x0 as the owner.");

        certificateTopic = _certificateTopic;

        registry = Registry(_registry);
        Ownable.initialize(_owner);
    }

	/*
		Certification requests
	*/

    function getCertificationRequest(uint256 _requestId) public view returns (CertificationRequest memory) {
        return certificationRequests[_requestId];
    }

    function getCertificateCommitment(uint certificateId) public view returns (bytes32) {
        return commitments[certificateId];
    }

    function requestCertificationFor(bytes memory _data, address _owner, bool _private) public returns (uint256) {
        uint256 id = ++certificationRequestNonce;

        certificationRequests[id] = CertificationRequest({
            owner: _owner,
            data: _data,
            approved: false,
            revoked: false,
            isPrivate: _private,
            sender: msg.sender
        });

        (,, string memory deviceId) = decodeData(_data);

        emit CertificationRequested(_owner, id, deviceId);

        return id;
    }

    function requestCertification(bytes calldata _data, bool _private) external {
        requestCertificationFor(_data, msg.sender, _private);
    }

    function isRequestValid(uint256 _requestId) external view returns (bool) {
        CertificationRequest memory request = certificationRequests[_requestId];
        uint certificateId = requestToCertificate[_requestId];

        return _requestId <= certificationRequestNonce
            && request.approved
            && !request.revoked
            && !revokedCertificates[certificateId];
    }

    function revokeRequest(uint256 _requestId) external {
        CertificationRequest storage request = certificationRequests[_requestId];

        require(msg.sender == request.owner || msg.sender == Ownable.owner(), "revokeRequest(): Only the request creator can revoke the request.");
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
    ) public onlyOwner returns (uint256) {
        require(_requestNotApprovedOrRevoked(_requestId), "approveCertificationRequest(): request already approved or revoked");

        CertificationRequest memory request = certificationRequests[_requestId];
        require(!request.isPrivate, "CertificationRequest(): please use commitments for private certification");

        _approve(_requestId);

        uint256 certificateId = registry.issue(request.owner, _validityData, certificateTopic, _value, request.data);
        requestToCertificate[_requestId] = certificateId;

        emit CertificationRequestApproved(request.owner, _requestId, certificateId);

        return certificateId;
    }

    function issue(address _to, uint256 _value, bytes memory _data) public onlyOwner returns (uint256) {
        uint256 requestId = requestCertificationFor(_data, _to, false);

        return approveCertificationRequest(
            requestId,
            _value,
            abi.encodeWithSignature("isRequestValid(uint256)", requestId)
        );
    }

    function approveCertificationRequestPrivate(
        uint256 _requestId,
        bytes32 _commitment,
        bytes memory _validityData
    ) public onlyOwner returns (uint256) {
        require(_requestNotApprovedOrRevoked(_requestId), "approveCertificationRequest(): request already approved or revoked");

        CertificationRequest memory request = certificationRequests[_requestId];
        require(request.isPrivate, "approve: can't approve public certificates using commitments");

        _approve(_requestId);

        uint256 certificateId = registry.issue(request.owner, _validityData, certificateTopic, 0, request.data);
        _updateCommitment(certificateId, 0x0, _commitment);
        requestToCertificate[_requestId] = certificateId;

        emit CertificationRequestApproved(request.owner, _requestId, certificateId);

        return certificateId;
    }

    function issuePrivate(address _to, bytes32 _commitment, bytes memory _data) public onlyOwner returns (uint256) {
        uint256 requestId = requestCertificationFor(_data, _to, true);

        return approveCertificationRequestPrivate(
            requestId,
            _commitment,
            abi.encodeWithSignature("isRequestValid(uint256)", requestId)
        );
    }

	/*
		Private transfer
	*/
	function requestPrivateTransfer(uint256 _certificateId, bytes32 _ownerAddressLeafHash) external {
		PrivateTransferRequest storage currentRequest = requestPrivateTransferStorage[_certificateId];

        require(currentRequest.owner == address(0x0), "Only one private transfer can be requested at a time.");

		requestPrivateTransferStorage[_certificateId] = PrivateTransferRequest({
			owner: msg.sender,
			hash: _ownerAddressLeafHash
		});

		emit PrivateTransferRequested(msg.sender, _certificateId);
	}

	function approvePrivateTransfer(
        uint256 _certificateId,
        Proof[] calldata _proof,
        bytes32 _previousCommitment,
        bytes32 _commitment
    ) external onlyOwner returns (bool) {
		PrivateTransferRequest storage pendingRequest = requestPrivateTransferStorage[_certificateId];

        require(pendingRequest.owner != address(0x0), "approvePrivateTransfer(): Can't approve a non-existing private transfer.");
		require(validateMerkle(pendingRequest.hash, _commitment, _proof), "approvePrivateTransfer(): Wrong merkle tree");

        requestPrivateTransferStorage[_certificateId] = PrivateTransferRequest({
			owner: address(0x0),
			hash: ''
		});

		_updateCommitment(_certificateId, _previousCommitment, _commitment);

        return true;
	}

	/*
		Migrate to public certificate (public issue)
	*/

	function requestMigrateToPublicFor(uint256 _certificateId, bytes32 _ownerAddressLeafHash, address _forAddress) external onlyOwner returns (uint256) {
        _requestMigrateToPublicFor(_certificateId, _ownerAddressLeafHash, _forAddress);
	}

	function requestMigrateToPublic(uint256 _certificateId, bytes32 _ownerAddressLeafHash) external returns (uint256) {
        _requestMigrateToPublicFor(_certificateId, _ownerAddressLeafHash, msg.sender);
	}

    function getPrivateTransferRequest(uint _certificateId) external view onlyOwner returns (PrivateTransferRequest memory) {
        return requestPrivateTransferStorage[_certificateId];
    }

    function getMigrationRequest(uint _requestId) external view onlyOwner returns (RequestStateChange memory) {
        return requestMigrateToPublicStorage[_requestId];
    }

    function getMigrationRequestId(uint _certificateId) external view onlyOwner returns (uint256) {
        bool found = false;

		for (uint i = 1; i <= requestMigrateToPublicNonce; i++) {
            if (requestMigrateToPublicStorage[i].certificateId == _certificateId) {
                found = true;
			    return i;
            }
		}

        require(found, "unable to find the migration request");
    }

	function migrateToPublic(
        uint256 _requestId,
        uint256 _volume,
        string calldata _salt,
        Proof[] calldata _proof
    ) external onlyOwner {
		RequestStateChange storage request = requestMigrateToPublicStorage[_requestId];

		require(!request.approved, "migrateToPublic(): Request already approved");
        require(!migrations[request.certificateId], "migrateToPublic(): certificate already migrated");
		require(request.hash == keccak256(abi.encodePacked(request.owner, _volume, _salt)), "Requested hash does not match");
        require(validateOwnershipProof(request.owner, _volume, _salt, commitments[request.certificateId], _proof), "Invalid proof");

		request.approved = true;

        registry.mint(request.certificateId, request.owner, _volume);
        migrations[request.certificateId] = true;

        _updateCommitment(request.certificateId, commitments[request.certificateId], 0x0);

        emit CertificateMigratedToPublic(request.certificateId, request.owner, _volume);
	}

	/*
		Utils
	*/

	function encodeData(uint _from, uint _to, string memory _deviceId) public pure returns (bytes memory) {
		return abi.encode(_from, _to, _deviceId);
	}

	function decodeData(bytes memory _data) public pure returns (uint, uint, string memory) {
		return abi.decode(_data, (uint, uint, string));
	}

	function validateOwnershipProof(
        address _ownerAddress,
        uint _volume,
        string memory _salt,
        bytes32 _rootHash,
        Proof[] memory _proof
    ) private pure returns (bool) {
		bytes32 leafHash = keccak256(abi.encodePacked(_ownerAddress, _volume, _salt));

		return validateMerkle(leafHash, _rootHash, _proof);
	}

	function validateMerkle(bytes32 _leafHash, bytes32 _rootHash, Proof[] memory _proof) private pure returns (bool) {
		bytes32 hash = _leafHash;

		for (uint256 i = 0; i < _proof.length; i++) {
			Proof memory p = _proof[i];
			if (p.left) {
				hash = keccak256(abi.encodePacked(p.hash, hash));
			} else {
				hash = keccak256(abi.encodePacked(hash, p.hash));
			}
		}

		return _rootHash == hash;
	}

	/*
		Info
	*/

    function getRegistryAddress() external view returns (address) {
        return address(registry);
    }

    function version() external pure returns (string memory) {
        return "v0.1";
    }

	/*
		Private methods
	*/

    function _approve(uint256 _requestId) private {
        CertificationRequest storage request = certificationRequests[_requestId];
        require(!request.approved, "Already issued"); //consider checking topic and other params from request

        request.approved = true;
    }

	function _updateCommitment(uint256 _id, bytes32 _previousCommitment, bytes32 _commitment) private {
		require(commitments[_id] == _previousCommitment, "updateCommitment: previous commitment invalid");

		commitments[_id] = _commitment;

		emit CommitmentUpdated(msg.sender, _id, _commitment);
	}

    function _migrationRequestExists(uint _certificateId) private view returns (bool) {
        bool exists = false;

		for (uint i = 1; i <= requestMigrateToPublicNonce; i++) {
            if (requestMigrateToPublicStorage[i].certificateId == _certificateId) {
                exists = true;
                return exists;
            }
		}

        return exists;
    }

    function _requestNotApprovedOrRevoked(uint256 _requestId) private view returns (bool) {
        CertificationRequest memory request = certificationRequests[_requestId];

        return !request.approved && !request.revoked;
    }

    function _requestMigrateToPublicFor(uint256 _certificateId, bytes32 _ownerAddressLeafHash, address _forAddress) private returns (uint256) {
        bool exists = _migrationRequestExists(_certificateId);
        require(!exists, "migration request for this certificate already exists");

		uint256 id = ++requestMigrateToPublicNonce;

		requestMigrateToPublicStorage[id] = RequestStateChange({
			owner: _forAddress,
			hash: _ownerAddressLeafHash,
			certificateId: _certificateId,
			approved: false
		});

		emit MigrateToPublicRequested(_forAddress, id);

        return id;
	}

	/*
		Utils
	*/

	function encodeClaimData(
		string memory _beneficiary,
		string memory _address,
		string memory _region,
		string memory _zipCode,
		string memory _countryCode
	) public pure returns (bytes memory _claimData) {
		return abi.encode(_beneficiary, _address, _region, _zipCode, _countryCode);
	}

	function decodeClaimData(bytes memory _claimData) public pure returns (
		string memory _beneficiary,
		string memory _address,
		string memory _region,
		string memory _zipCode,
		string memory _countryCode
	) {
		return abi.decode(_claimData, (string, string, string, string, string));
	}
}