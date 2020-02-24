pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol";

import "./Registry.sol";

contract Issuer is Initializable, Ownable {
    event NewIssuanceRequest(address indexed _owner, uint256 indexed _id);
    event ApprovedIssuanceRequest(address indexed _owner, uint256 indexed _id, uint indexed _certificateId);

	event CommitmentUpdated(address indexed _owner, uint256 indexed _id, bytes32 _commitment);
	event MigrateToPublicRequest(address indexed _owner, uint256 indexed _id);
	event PrivateTransferRequest(address indexed _owner, uint256 indexed _certificateId, uint256 indexed _id);
	event CertificateMigratedToPublic(uint indexed _certificateId, address indexed _owner, uint256 indexed _amount);

    int public certificateTopic;
    Registry public registry;

    mapping(uint256 => IssuanceRequest) public issuanceRequests;
    mapping(uint256 => uint256) public certificateToRequestStorage;

    // Device Id => IssuanceRequestIds[]
    mapping(string => uint256[]) public requestsPerDevice;

	uint public requestMigrateToPublicNonce;
	uint public requestPrivateTransferNonce;
    uint public issuanceRequestNonce;

	mapping(uint256 => RequestStateChange) public requestMigrateToPublicStorage;
	mapping(uint256 => RequestStateChange) public requestPrivateTransferStorage;

	mapping(uint256 => bool) public migrations;
	mapping(uint256 => bytes32) public commitments;

    struct IssuanceRequest {
        address owner;
        bytes data;
        bool approved;
        bool revoked;
        bool isPrivate;
    }

	struct RequestStateChange {
		address owner;
		uint certificateId;
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
		Issuance requests
	*/

    function getIssuanceRequest(uint _requestId) public returns (IssuanceRequest memory) {
        return issuanceRequests[_requestId];
    }

    function getIssuanceRequestsForDevice(string memory _deviceId) public returns (uint256[] memory) {
        return requestsPerDevice[_deviceId];
    }

    function getIssuanceRequestForCertificate(uint _certificateId) public returns (IssuanceRequest memory) {
        return getIssuanceRequest(certificateToRequestStorage[_certificateId]);
    }

    function requestIssuanceFor(bytes memory _data, address _owner, bool _private) public returns (uint) {
        uint id = ++issuanceRequestNonce;

        issuanceRequests[id] = IssuanceRequest({
            owner: _owner,
            data: _data,
            approved: false,
            revoked: false,
            isPrivate: _private
        });

        (,, string memory deviceId) = decodeData(_data);

        requestsPerDevice[deviceId].push(id);

        emit NewIssuanceRequest(_owner, id);

        return id;
    }

    function requestIssuance(bytes calldata _data, bool _private) external {
        requestIssuanceFor(_data, msg.sender, _private);
    }

    function isRequestValid(uint256 _requestId) external view returns (bool) {
        IssuanceRequest storage request = issuanceRequests[_requestId];

        return _requestId <= issuanceRequestNonce && request.approved && request.revoked == false;
    }

    function revokeRequest(uint256 _requestId) public onlyOwner {
        IssuanceRequest storage request = issuanceRequests[_requestId];
        require(!request.revoked, "revokeRequest(): Already revoked");

        request.revoked = true;
    }

    function revokeCertificate(uint256 _certificateId) public onlyOwner {
        revokeRequest(certificateToRequestStorage[_certificateId]);
    }

    function approveIssuance(
        address _to,
        uint _requestId,
        uint _value,
        bytes memory _validityData
    ) public onlyOwner returns (uint256) {
        IssuanceRequest memory request = issuanceRequests[_requestId];
        require(!request.isPrivate, "approveIssuance(): please use commitments for private issuance");

        _approve(_requestId);

        uint256 certificateId = registry.issue(_to, _validityData, certificateTopic, _value, request.data);
        certificateToRequestStorage[certificateId] = _requestId;

        emit ApprovedIssuanceRequest(_to, _requestId, certificateId);

        return certificateId;
    }

    function issue(address _to, uint _value, bytes memory _data) public onlyOwner returns (uint256) {
        uint256 requestId = requestIssuanceFor(_data, _to, false);

        return approveIssuance(
            _to,
            requestId,
            _value,
            abi.encodeWithSignature("isRequestValid(uint256)", requestId)
        );
    }

    function approveIssuancePrivate(
        address _to,
        uint _requestId,
        bytes32 _commitment,
        bytes memory _validityData
    ) public onlyOwner returns (uint256) {
        IssuanceRequest memory request = issuanceRequests[_requestId];
        require(request.isPrivate, "approveIssuancePrivate: can't approve public certificates using commitments");

        _approve(_requestId);

        uint256 certificateId = registry.issue(_to, _validityData, certificateTopic, 0, request.data);
		_updateCommitment(certificateId, 0x0, _commitment);

        certificateToRequestStorage[certificateId] = _requestId;

        emit ApprovedIssuanceRequest(_to, _requestId, certificateId);

        return certificateId;
    }

    function issuePrivate(address _to, bytes32 _commitment, bytes memory _data) public onlyOwner returns (uint256) {
        uint256 requestId = requestIssuanceFor(_data, _to, true);

        return approveIssuancePrivate(
            _to,
            requestId,
            _commitment,
            abi.encodeWithSignature("isRequestValid(uint256)", requestId)
        );
    }

	/*
		Private transfer
	*/
	function requestPrivateTransfer(uint _certificateId, bytes32 _ownerAddressLeafHash) external returns (uint) {
		uint id = ++requestPrivateTransferNonce;

		requestPrivateTransferStorage[id] = RequestStateChange({
			owner: msg.sender,
			hash: _ownerAddressLeafHash,
			certificateId: _certificateId,
			approved: false
		});

		emit PrivateTransferRequest(msg.sender, _certificateId, id);

        return id;
	}

    // TO-DO: onlyOwner
	function approvePrivateTransfer(uint _requestId, Proof[] calldata _proof, bytes32 _previousCommitment, bytes32 _commitment) external {
		RequestStateChange storage request = requestPrivateTransferStorage[_requestId];

		require(!request.approved, "Request already approved");
		require(validateMerkle(request.hash, _commitment, _proof), "Wrong merkle tree");

		request.approved = true;

		_updateCommitment(request.certificateId, _previousCommitment, _commitment);
	}

	/*
		Migrate to public certificate (public issue)
	*/

	function requestMigrateToPublic(uint _certificateId, bytes32 _ownerAddressLeafHash) external returns (uint256) {
        bool existsAlready = _migrationRequestExists(_certificateId);

        require(!existsAlready, "migration request for this certificate already exists");

		uint id = ++requestMigrateToPublicNonce;

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

	function migrateToPublic(
        uint _requestId,
        uint _value,
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

		for (uint i = 0; i < _proof.length; i++) {
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

    function isCertificatePublic(uint certificateId) external returns (bool) {
        return commitments[certificateId] != 0x0;
    }

    function getRegistryAddress() public view returns (address) {
        return address(registry);
    }

    function version() public view returns (string memory) {
        return "v0.1";
    }

	/*
		Private methods
	*/

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

    function _approve(uint _requestId) private {
        IssuanceRequest storage request = issuanceRequests[_requestId];
        require(!request.approved, "Already issued"); //consider checking topic and other params from request

        request.approved = true;
    }

	function _updateCommitment(uint _id, bytes32 _previousCommitment, bytes32 _commitment) private {
		require(commitments[_id] == _previousCommitment, "updateCommitment: previous commitment invalid");

		commitments[_id] = _commitment;

		emit CommitmentUpdated(msg.sender, _id, _commitment);
	}
}