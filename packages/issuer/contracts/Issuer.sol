pragma solidity ^0.5.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol";

import "./Registry.sol";

contract Issuer is Initializable, Ownable {
    event NewCertificationRequest(address indexed _owner, uint256 indexed _id);
    event ApprovedCertificationRequest(address indexed _owner, uint256 indexed _id, uint256 indexed _certificateId);

	event CommitmentUpdated(address indexed _owner, uint256 indexed _id, bytes32 _commitment);
	event MigrateToPublicRequest(address indexed _owner, uint256 indexed _id);
	event PrivateTransferRequest(address indexed _owner, uint256 indexed _certificateId, uint256 indexed _id);
	event CertificateMigratedToPublic(uint256 indexed _certificateId, address indexed _owner, uint256 indexed _amount);

    int public certificateTopic;
    Registry public registry;

    mapping(uint256 => CertificationRequest) private certificationRequests;
    mapping(uint256 => uint256) private certificateToRequestStorage;

    // Device Id => CertificationRequestIds[]
    mapping(string => uint256[]) private requestsPerDevice;

	uint256 private requestMigrateToPublicNonce;
	uint256 private requestPrivateTransferNonce;
    uint256 private certificationRequestNonce;

	mapping(uint256 => RequestStateChange) private requestMigrateToPublicStorage;
	mapping(uint256 => RequestStateChange) private requestPrivateTransferStorage;

	mapping(uint256 => bool) private migrations;
	mapping(uint256 => bytes32) private commitments;

    struct CertificationRequest {
        address owner;
        bytes data;
        bool approved;
        bool revoked;
        bool isPrivate;
        uint256 issuedCertificateId;
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

    function getCertificationRequestsForDevice(string calldata _deviceId) external view returns (uint256[] memory) {
        return requestsPerDevice[_deviceId];
    }

    function getCertificationRequestForCertificate(uint256 _certificateId) external view returns (CertificationRequest memory) {
        return getCertificationRequest(certificateToRequestStorage[_certificateId]);
    }

    function getCertificationRequestIdForCertificate(uint256 _certificateId) external view returns (uint256) {
        return certificateToRequestStorage[_certificateId];
    }

    function getCertificateIdForCertificationRequest(uint256 _requestId) external view returns (uint256) {
        return certificationRequests[_requestId].issuedCertificateId;
    }

    function totalRequests() external view returns (uint256) {
        require(certificationRequestNonce >= 0, "invalid nonce");
        return certificationRequestNonce;
    }

    function requestCertificationFor(bytes memory _data, address _owner, bool _private) public returns (uint256) {
        uint256 id = ++certificationRequestNonce;

        certificationRequests[id] = CertificationRequest({
            owner: _owner,
            data: _data,
            approved: false,
            revoked: false,
            isPrivate: _private,
            issuedCertificateId: 0
        });

        (,, string memory deviceId) = decodeData(_data);

        requestsPerDevice[deviceId].push(id);

        emit NewCertificationRequest(_owner, id);

        return id;
    }

    function requestCertification(bytes calldata _data, bool _private) external {
        requestCertificationFor(_data, msg.sender, _private);
    }

    function isRequestValid(uint256 _requestId) external view returns (bool) {
        CertificationRequest memory request = certificationRequests[_requestId];

        return _requestId <= certificationRequestNonce && request.approved && request.revoked == false;
    }

    function revokeRequest(uint256 _requestId) public onlyOwner {
        CertificationRequest storage request = certificationRequests[_requestId];
        require(!request.revoked, "revokeRequest(): Already revoked");

        request.revoked = true;
    }

    function revokeCertificate(uint256 _certificateId) external onlyOwner {
        revokeRequest(certificateToRequestStorage[_certificateId]);
    }

    function approveCertificationRequest(
        address _to,
        uint256 _requestId,
        uint256 _value,
        bytes memory _validityData
    ) public onlyOwner returns (uint256) {
        CertificationRequest memory request = certificationRequests[_requestId];
        require(!request.isPrivate, "CertificationRequest(): please use commitments for private certification");

        _approve(_requestId);

        uint256 certificateId = registry.issue(_to, _validityData, certificateTopic, _value, request.data);
        _assignCertificate(_requestId, certificateId);
        certificateToRequestStorage[certificateId] = _requestId;

        emit ApprovedCertificationRequest(_to, _requestId, certificateId);

        return certificateId;
    }

    function issue(address _to, uint256 _value, bytes memory _data) public onlyOwner returns (uint256) {
        uint256 requestId = requestCertificationFor(_data, _to, false);

        return approveCertificationRequest(
            _to,
            requestId,
            _value,
            abi.encodeWithSignature("isRequestValid(uint256)", requestId)
        );
    }

    function approveCertificationRequestPrivate(
        address _to,
        uint256 _requestId,
        bytes32 _commitment,
        bytes memory _validityData
    ) public onlyOwner returns (uint256) {
        CertificationRequest memory request = certificationRequests[_requestId];
        require(request.isPrivate, "approve: can't approve public certificates using commitments");

        _approve(_requestId);

        uint256 certificateId = registry.issue(_to, _validityData, certificateTopic, 0, request.data);
        _assignCertificate(_requestId, certificateId);
        _updateCommitment(certificateId, 0x0, _commitment);
        certificateToRequestStorage[certificateId] = _requestId;

        emit ApprovedCertificationRequest(_to, _requestId, certificateId);

        return certificateId;
    }

    function issuePrivate(address _to, bytes32 _commitment, bytes memory _data) public onlyOwner returns (uint256) {
        uint256 requestId = requestCertificationFor(_data, _to, true);

        return approveCertificationRequestPrivate(
            _to,
            requestId,
            _commitment,
            abi.encodeWithSignature("isRequestValid(uint256)", requestId)
        );
    }

	/*
		Private transfer
	*/
	function requestPrivateTransfer(uint256 _certificateId, bytes32 _ownerAddressLeafHash) external returns (uint) {
		uint256 id = ++requestPrivateTransferNonce;

		requestPrivateTransferStorage[id] = RequestStateChange({
			owner: msg.sender,
			hash: _ownerAddressLeafHash,
			certificateId: _certificateId,
			approved: false
		});

		emit PrivateTransferRequest(msg.sender, _certificateId, id);

        return id;
	}

	// TO-DO: only Issuer
	function approvePrivateTransfer(uint256 _requestId, Proof[] calldata _proof, bytes32 _previousCommitment, bytes32 _commitment) external {
		RequestStateChange storage request = requestPrivateTransferStorage[_requestId];

		require(!request.approved, "Request already approved");
		require(validateMerkle(request.hash, _commitment, _proof), "Wrong merkle tree");

		request.approved = true;

		_updateCommitment(request.certificateId, _previousCommitment, _commitment);
	}

	/*
		Migrate to public certificate (public issue)
	*/

	function requestMigrateToPublic(uint256 _certificateId, bytes32 _ownerAddressLeafHash) external returns (uint256) {
        bool exists = _migrationRequestExists(_certificateId);
        require(!exists, "migration request for this certificate already exists");

		uint256 id = ++requestMigrateToPublicNonce;

		requestMigrateToPublicStorage[id] = RequestStateChange({
			owner: msg.sender,
			hash: _ownerAddressLeafHash,
			certificateId: _certificateId,
			approved: false
		});

		emit MigrateToPublicRequest(msg.sender, id);

        return id;
	}

    function getMigrationRequestId(uint _certificateId) external onlyOwner returns (uint256) {
        bool found = false;

		for (uint i = 1; i <= requestMigrateToPublicNonce; i++) {
            if (requestMigrateToPublicStorage[i].certificateId == _certificateId) {
                found = true;
			    return i;
            }
		}

        require(found, "unable to find the migration request");
    }

	// TO-DO: only Issuer
	function migrateToPublic(
        uint256 _requestId,
        uint256 _value,
        string calldata _salt,
        Proof[] calldata _proof
    ) external onlyOwner returns (uint256 publicCertificateId) {
		RequestStateChange storage request = requestMigrateToPublicStorage[_requestId];

		require(!request.approved, "migrateToPublic(): Request already approved");
        require(!migrations[request.certificateId], "migrateToPublic(): certificate already migrated");
        require(validateOwnerProof("ownerAddress", request.owner, _salt, commitments[request.certificateId], _proof), "Invalid proof");
		require(request.hash == keccak256(abi.encodePacked("ownerAddress", request.owner, _salt)), "Requested hash does not match");

		request.approved = true;

        registry.mint(request.certificateId, request.owner, _value);
        migrations[request.certificateId] = true;

        _updateCommitment(request.certificateId, commitments[request.certificateId], 0x0);

        emit CertificateMigratedToPublic(request.certificateId, request.owner, _value);
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

	function validateOwnerProof(
        string memory _key,
        address _ownerAddress,
        string memory _salt,
        bytes32 _rootHash,
        Proof[] memory _proof
    ) private pure returns (bool) {
		bytes32 leafHash = keccak256(abi.encodePacked(_key, _ownerAddress, _salt));

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

    function isCertificatePublic(uint certificateId) external view returns (bool) {
        return commitments[certificateId] != 0x0;
    }

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

    function _assignCertificate(uint256 _requestId, uint256 _certificateId) private {
        CertificationRequest storage request = certificationRequests[_requestId];
        require(request.issuedCertificateId == 0, "Already assigned a certificate to the request");
        require(_certificateId > 0, "Certificate Id has to be higher than 0");

        request.issuedCertificateId = _certificateId;
    }

	function _updateCommitment(uint256 _id, bytes32 _previousCommitment, bytes32 _commitment) private {
		require(commitments[_id] == _previousCommitment, "updateCommitment: previous commitment invalid");

		commitments[_id] = _commitment;

		emit CommitmentUpdated(msg.sender, _id, _commitment);
	}

    function _migrationRequestExists(uint _certificateId) private returns (bool) {
        bool exists = false;

		for (uint i = 1; i <= requestMigrateToPublicNonce; i++) {
            if (requestMigrateToPublicStorage[i].certificateId == _certificateId) {
                exists = true;
                return exists;
            }
		}

        return exists;
    }
}