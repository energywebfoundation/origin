// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.4;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "./Issuer.sol";

/// @title Contract for private issuances.
/// @dev Private certificate issuance differ from the public ones in a way that the fungible volumes that are being transferred/claimed are stored off-chain.
/// @notice A privately issued certificate can later be migrated to be public.
contract PrivateIssuer is Initializable, OwnableUpgradeable, UUPSUpgradeable {

	// Public issuance contract
	Issuer public issuer;

    // ERC-1888 contract to issue certificates to
	Registry public registry;

	event PrivateCertificationRequestApproved(address indexed _owner, uint256 indexed _id, uint256 indexed _certificateId);
	event CommitmentUpdated(address indexed _owner, uint256 indexed _id, bytes32 _commitment);
	event MigrateToPublicRequested(address indexed _owner, uint256 indexed _id);
	event PrivateTransferRequested(address indexed _owner, uint256 indexed _certificateId);
	event CertificateMigratedToPublic(uint256 indexed _certificateId, address indexed _owner, uint256 indexed _amount);

	// Storage for RequestStateChange
	mapping(uint256 => RequestStateChange) private _requestMigrateToPublicStorage;

	// Storage for PrivateTransferRequest
	mapping(uint256 => PrivateTransferRequest) private _requestPrivateTransferStorage;

	// Mapping to keep track if a certification request has been migrated to public
	mapping(uint256 => bool) private _migrations;

	// Storing a commitment (proof) per certification request ID
	mapping(uint256 => bytes32) private _commitments;

	// Nonce for generating RequestStateChange IDs
	uint256 private _requestMigrateToPublicNonce;

	// Nonce for generating PrivateTransferRequest IDs
	uint256 private _requestPrivateTransferNonce;

    struct PrivateTransferRequest {
		address owner; // Address that requested a migration to public certificate
		bytes32 hash; // Commitment proof that
	}

	struct RequestStateChange {
		address owner; // Owner of the certificate
		uint256 certificateId; // ID of the issued certificate
		bytes32 hash; // Commitment (proof)
		bool approved;
	}

	struct Proof {
		bool left;
		bytes32 hash;
	}
	
    /// @notice Constructor.
    /// @dev Uses the OpenZeppelin `initializer` for upgradeability.
	/// @dev `_issuer` cannot be the zero address.
    function initialize(address _issuer) public initializer {
        require(_issuer != address(0), "PrivateIssuer::initialize: Cannot use address 0x0 as Issuer address.");

        issuer = Issuer(_issuer);
		registry = Registry(issuer.getRegistryAddress());

        OwnableUpgradeable.__Ownable_init();
		UUPSUpgradeable.__UUPSUpgradeable_init();
    }

	/*
		Certification requests
	*/

    /// @notice Get the commitment (proof) for a specific certificate.
    function getCertificateCommitment(uint256 certificateId) public view returns (bytes32) {
        return _commitments[certificateId];
    }

    function approveCertificationRequestPrivate(
        uint256 _requestId,
        bytes32 _commitment
    ) public onlyOwner returns (uint256) {
		uint256 certificateId = issuer.approveCertificationRequest(_requestId, 0);
        _updateCommitment(certificateId, 0x0, _commitment);

		Issuer.CertificationRequest memory request = issuer.getCertificationRequest(_requestId);

        emit PrivateCertificationRequestApproved(request.owner, _requestId, certificateId);

        return certificateId;
    }

	/// @notice Directly issue a private certificate.
    function issuePrivate(address _to, bytes32 _commitment, bytes memory _data) public onlyOwner returns (uint256) {
        require(_to != address(0x0), "PrivateIssuer::issuePrivate: Cannot use address 0x0 as _to address.");

        uint256 requestId = issuer.requestCertificationFor(_data, _to);

        return approveCertificationRequestPrivate(
            requestId,
            _commitment
        );
    }

	/// @notice Request transferring a certain amount of tokens.
	/// @param _certificateId Certificate that you want to change the balances of.
	/// @param _ownerAddressLeafHash New updated proof (balances per address).
	function requestPrivateTransfer(uint256 _certificateId, bytes32 _ownerAddressLeafHash) external {
		PrivateTransferRequest storage currentRequest = _requestPrivateTransferStorage[_certificateId];

		/*
		//RESTRICTION: There can only be one private transfer request at a time per certificate.
		 */
        require(currentRequest.owner == address(0x0), "PrivateIssuer::requestPrivateTransfer:Only one private transfer can be requested at a time.");

		_requestPrivateTransferStorage[_certificateId] = PrivateTransferRequest({
			owner: _msgSender(),
			hash: _ownerAddressLeafHash
		});

		emit PrivateTransferRequested(_msgSender(), _certificateId);
	}

	/// @notice Approve a private transfer of certificates.
	function approvePrivateTransfer(
        uint256 _certificateId,
        Proof[] calldata _proof,
        bytes32 _previousCommitment,
        bytes32 _commitment
    ) external onlyOwner returns (bool) {
		PrivateTransferRequest storage pendingRequest = _requestPrivateTransferStorage[_certificateId];

        require(pendingRequest.owner != address(0x0), "PrivateIssuer::approvePrivateTransfer: Can't approve a non-existing private transfer.");
		require(validateMerkle(pendingRequest.hash, _commitment, _proof), "PrivateIssuer::approvePrivateTransfer: Wrong merkle tree");

        _requestPrivateTransferStorage[_certificateId] = PrivateTransferRequest({
			owner: address(0x0),
			hash: ""
		});

		_updateCommitment(_certificateId, _previousCommitment, _commitment);

        return true;
	}

	/// @notice Request the certificate volumes to be migrated from private to public.
	/// @param _certificateId Certificate that you want to migrate to public.
	/// @param _ownerAddressLeafHash Final balance proof.
	function requestMigrateToPublic(uint256 _certificateId, bytes32 _ownerAddressLeafHash) external returns (uint256 _migrationRequestId) {
        return _requestMigrateToPublicFor(_certificateId, _ownerAddressLeafHash, _msgSender());
	}

	/// @notice Request the certificate volumes to be migrated from private to public for someone else.
	/// @param _certificateId Certificate that you want to migrate to public.
	/// @param _ownerAddressLeafHash Final balance proof.
	/// @param _forAddress Owner.
	function requestMigrateToPublicFor(uint256 _certificateId, bytes32 _ownerAddressLeafHash, address _forAddress) external onlyOwner returns (uint256 _migrationRequestId) {
        return _requestMigrateToPublicFor(_certificateId, _ownerAddressLeafHash, _forAddress);
	}

	/// @notice Get the private transfer request that is currently active for a specific certificate.
    function getPrivateTransferRequest(uint256 _certificateId) external view onlyOwner returns (PrivateTransferRequest memory) {
        return _requestPrivateTransferStorage[_certificateId];
    }

	/// @notice Get the migration request.
    function getMigrationRequest(uint256 _requestId) external view onlyOwner returns (RequestStateChange memory) {
        return _requestMigrateToPublicStorage[_requestId];
    }

	/// @notice Get the migration request ID for a specific certificate.
    function getMigrationRequestId(uint256 _certificateId) external view onlyOwner returns (uint256 _migrationRequestId) {
        bool found = false;

		for (uint256 i = 1; i <= _requestMigrateToPublicNonce; i++) {
            if (_requestMigrateToPublicStorage[i].certificateId == _certificateId) {
                found = true;
			    return i;
            }
		}

        require(found, "unable to find the migration request");
    }

	/// @notice Migrate a private certificate to be public.
	/// @param _requestId Migration Request ID.
	/// @param _volume Volume that should be minted.
	/// @param _salt Precise Proof salt.
	/// @param _proof Precise Proof.
	function migrateToPublic(
        uint256 _requestId,
        uint256 _volume,
        string calldata _salt,
        Proof[] calldata _proof
    ) external onlyOwner {
		RequestStateChange storage request = _requestMigrateToPublicStorage[_requestId];

		require(!request.approved, "PrivateIssuer::migrateToPublic: Request already approved");
        require(!_migrations[request.certificateId], "PrivateIssuer::migrateToPublic: certificate already migrated");
		require(request.hash == keccak256(abi.encodePacked(request.owner, _volume, _salt)), "PrivateIssuer::migrateToPublic: Requested hash does not match");
        require(validateOwnershipProof(request.owner, _volume, _salt, _commitments[request.certificateId], _proof), "PrivateIssuer::migrateToPublic: Invalid proof");

		request.approved = true;

        registry.mint(request.certificateId, request.owner, _volume);
        _migrations[request.certificateId] = true;

        _updateCommitment(request.certificateId, _commitments[request.certificateId], 0x0);

        emit CertificateMigratedToPublic(request.certificateId, request.owner, _volume);
	}

	/*
		Utils
	*/

	/// @notice Validates that a `_ownerAddress` actually owns `_volume` in a precise proof.
	/// @param _ownerAddress Owner blockchain address.
	/// @param _volume Volume that the owner should have.
	/// @param _salt Precise Proof salt.
	/// @param _rootHash Hash of the merkle tree root.
	/// @param _proof Full Precise Proof.
	function validateOwnershipProof(
        address _ownerAddress,
        uint256 _volume,
        string memory _salt,
        bytes32 _rootHash,
        Proof[] memory _proof
    ) private pure returns (bool) {
		bytes32 leafHash = keccak256(abi.encodePacked(_ownerAddress, _volume, _salt));

		return validateMerkle(leafHash, _rootHash, _proof);
	}

	/// @notice Validates that a `_leafHash` is a leaf in the `_proof` with a merkle root hash `_rootHash`.
	/// @param _leafHash Hash of the leaf in the merkle tree.
	/// @param _rootHash Hash of the merkle tree root.
	/// @param _proof Full Precise Proof.
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
		require(_commitments[_id] == _previousCommitment, "PrivateIssuer::updateCommitment: previous commitment invalid");

		_commitments[_id] = _commitment;

		emit CommitmentUpdated(_msgSender(), _id, _commitment);
	}

    function _migrationRequestExists(uint256 _certificateId) private view returns (bool) {
        bool exists = false;

		for (uint256 i = 1; i <= _requestMigrateToPublicNonce; i++) {
            if (_requestMigrateToPublicStorage[i].certificateId == _certificateId) {
                exists = true;
                return exists;
            }
		}

        return exists;
    }

    function _requestMigrateToPublicFor(uint256 _certificateId, bytes32 _ownerAddressLeafHash, address _forAddress) private returns (uint256 _migrationRequestId) {
        bool exists = _migrationRequestExists(_certificateId);
        require(!exists, "PrivateIssuer::_requestMigrateToPublicFor: migration request for this certificate already exists");

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