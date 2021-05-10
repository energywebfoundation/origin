// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "./Issuer.sol";

contract PrivateIssuer is Initializable, OwnableUpgradeable, UUPSUpgradeable {

	Issuer public issuer;
	Registry public registry;

	event PrivateCertificationRequestApproved(address indexed _owner, uint256 indexed _id, uint256 indexed _certificateId);
	event CommitmentUpdated(address indexed _owner, uint256 indexed _id, bytes32 _commitment);
	event MigrateToPublicRequested(address indexed _owner, uint256 indexed _id);
	event PrivateTransferRequested(address indexed _owner, uint256 indexed _certificateId);
	event CertificateMigratedToPublic(uint256 indexed _certificateId, address indexed _owner, uint256 indexed _amount);

	uint256 private _requestMigrateToPublicNonce;
	uint256 private _requestPrivateTransferNonce;

	mapping(uint256 => RequestStateChange) private _requestMigrateToPublicStorage;
	mapping(uint256 => PrivateTransferRequest) private _requestPrivateTransferStorage;
	mapping(uint256 => uint256) private _requestToCertificate;

	mapping(uint256 => bool) private _migrations;
	mapping(uint256 => bytes32) private _commitments;

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

    function initialize(address _issuer) public initializer {
        require(_issuer != address(0), "initialize: Cannot use address 0x0 as Issuer address.");

        issuer = Issuer(_issuer);
		registry = Registry(issuer.getRegistryAddress());

        OwnableUpgradeable.__Ownable_init();
		UUPSUpgradeable.__UUPSUpgradeable_init();
    }

	/*
		Certification requests
	*/

    function getCertificateCommitment(uint certificateId) public view returns (bytes32) {
        return _commitments[certificateId];
    }

    function approveCertificationRequestPrivate(
        uint256 _requestId,
        bytes32 _commitment,
        bytes memory _validityData
    ) public onlyOwner returns (uint256) {
		uint256 certificateId = issuer.approveCertificationRequest(_requestId, 0, _validityData);
        _updateCommitment(certificateId, 0x0, _commitment);

		Issuer.CertificationRequest memory request = issuer.getCertificationRequest(_requestId); // TO-DO: get storage instead of memory

        emit PrivateCertificationRequestApproved(request.owner, _requestId, certificateId);

        return certificateId;
    }

    function issuePrivate(address _to, bytes32 _commitment, bytes memory _data) public onlyOwner returns (uint256) {
        uint256 requestId = issuer.requestCertificationFor(_data, _to);

        return approveCertificationRequestPrivate(
            requestId,
            _commitment,
            abi.encodeWithSignature("isRequestValid(uint256)",requestId)
        );
    }

	/*
		Private transfer
	*/
	function requestPrivateTransfer(uint256 _certificateId, bytes32 _ownerAddressLeafHash) external {
		PrivateTransferRequest storage currentRequest = _requestPrivateTransferStorage[_certificateId];

        require(currentRequest.owner == address(0x0), "Only one private transfer can be requested at a time.");

		_requestPrivateTransferStorage[_certificateId] = PrivateTransferRequest({
			owner: _msgSender(),
			hash: _ownerAddressLeafHash
		});

		emit PrivateTransferRequested(_msgSender(), _certificateId);
	}

	function approvePrivateTransfer(
        uint256 _certificateId,
        Proof[] calldata _proof,
        bytes32 _previousCommitment,
        bytes32 _commitment
    ) external onlyOwner returns (bool) {
		PrivateTransferRequest storage pendingRequest = _requestPrivateTransferStorage[_certificateId];

        require(pendingRequest.owner != address(0x0), "approvePrivateTransfer(): Can't approve a non-existing private transfer.");
		require(validateMerkle(pendingRequest.hash, _commitment, _proof), "approvePrivateTransfer(): Wrong merkle tree");

        _requestPrivateTransferStorage[_certificateId] = PrivateTransferRequest({
			owner: address(0x0),
			hash: ''
		});

		_updateCommitment(_certificateId, _previousCommitment, _commitment);

        return true;
	}

	/*
		Migrate to public certificate (public issue)
	*/

	function requestMigrateToPublicFor(uint256 _certificateId, bytes32 _ownerAddressLeafHash, address _forAddress) external onlyOwner returns (uint256 _migrationRequestId) {
        return _requestMigrateToPublicFor(_certificateId, _ownerAddressLeafHash, _forAddress);
	}

	function requestMigrateToPublic(uint256 _certificateId, bytes32 _ownerAddressLeafHash) external returns (uint256 _migrationRequestId) {
        return _requestMigrateToPublicFor(_certificateId, _ownerAddressLeafHash, _msgSender());
	}

    function getPrivateTransferRequest(uint _certificateId) external view onlyOwner returns (PrivateTransferRequest memory) {
        return _requestPrivateTransferStorage[_certificateId];
    }

    function getMigrationRequest(uint _requestId) external view onlyOwner returns (RequestStateChange memory) {
        return _requestMigrateToPublicStorage[_requestId];
    }

    function getMigrationRequestId(uint _certificateId) external view onlyOwner returns (uint256 _migrationRequestId) {
        bool found = false;

		for (uint i = 1; i <= _requestMigrateToPublicNonce; i++) {
            if (_requestMigrateToPublicStorage[i].certificateId == _certificateId) {
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
		RequestStateChange storage request = _requestMigrateToPublicStorage[_requestId];

		require(!request.approved, "migrateToPublic(): Request already approved");
        require(!_migrations[request.certificateId], "migrateToPublic(): certificate already migrated");
		require(request.hash == keccak256(abi.encodePacked(request.owner, _volume, _salt)), "Requested hash does not match");
        require(validateOwnershipProof(request.owner, _volume, _salt, _commitments[request.certificateId], _proof), "Invalid proof");

		request.approved = true;

        registry.mint(request.certificateId, request.owner, _volume);
        _migrations[request.certificateId] = true;

        _updateCommitment(request.certificateId, _commitments[request.certificateId], 0x0);

        emit CertificateMigratedToPublic(request.certificateId, request.owner, _volume);
	}

	/*
		Utils
	*/

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
		Private methods
	*/

	function _updateCommitment(uint256 _id, bytes32 _previousCommitment, bytes32 _commitment) private {
		require(_commitments[_id] == _previousCommitment, "updateCommitment: previous commitment invalid");

		_commitments[_id] = _commitment;

		emit CommitmentUpdated(_msgSender(), _id, _commitment);
	}

    function _migrationRequestExists(uint _certificateId) private view returns (bool) {
        bool exists = false;

		for (uint i = 1; i <= _requestMigrateToPublicNonce; i++) {
            if (_requestMigrateToPublicStorage[i].certificateId == _certificateId) {
                exists = true;
                return exists;
            }
		}

        return exists;
    }

    function _requestMigrateToPublicFor(uint256 _certificateId, bytes32 _ownerAddressLeafHash, address _forAddress) private returns (uint256 _migrationRequestId) {
        bool exists = _migrationRequestExists(_certificateId);
        require(!exists, "migration request for this certificate already exists");

		uint256 id = ++_requestMigrateToPublicNonce;

		_requestMigrateToPublicStorage[id] = RequestStateChange({
			owner: _forAddress,
			hash: _ownerAddressLeafHash,
			certificateId: _certificateId,
			approved: false
		});

		emit MigrateToPublicRequested(_forAddress, id);

        return id;
	}

	function _authorizeUpgrade(address) internal override onlyOwner {}

	/*
		Info
	*/

    function getIssuerAddress() external view returns (address) {
        return address(issuer);
    }

    function version() external pure returns (string memory) {
        return "v0.1";
    }
}