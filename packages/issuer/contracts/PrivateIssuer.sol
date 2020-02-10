pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/upgrades/contracts/Initializable.sol";

import "./AbstractIssuer.sol";
import "./Registry.sol";
import "./PublicIssuer.sol";

contract PrivateIssuer is Initializable, AbstractIssuer {
	event CommitmentUpdated(address indexed _owner, uint256 indexed _id, bytes32 _commitment);

	event MigrateToPublicRequest(address indexed _owner, uint256 indexed _id);
	event PrivateTransferRequest(address indexed _owner, uint256 indexed _id);
	event PublicCertificateCreated(uint indexed _from, uint indexed _to);

	PublicIssuer public publicIssuer;

	int public privateCertificateTopic = 1234;

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

	uint public requestMigrateToPublicNonce;
	uint public requestPrivateTransferNonce;

	mapping(uint256 => RequestStateChange) public requestMigrateToPublicStorage;
	mapping(uint256 => RequestStateChange) public requestPrivateTransferStorage;

	mapping(uint256 => bytes32) public commitments;
	mapping(uint256 => bool) public migrations;

	function initialize(address _registry, address _publicIssuer, address owner) public initializer {
		this.initialize(_registry, owner);

		require(_publicIssuer != address(0), "initialize: Cannot use address 0x0 as public issuer.");
		publicIssuer = PublicIssuer(_publicIssuer);
	}

	function updateCommitment(uint _id, bytes32 _previousCommitment, bytes32 _commitment) public {
		require(commitments[_id] == _previousCommitment, "updateCommitment: previous commitment invalid");

		commitments[_id] = _commitment;

		emit CommitmentUpdated(msg.sender, _id, _commitment);
	}

	/*
		Private Issue
	*/
	function approveIssue(address _to, uint _requestId, bytes32 _commitment, bytes calldata _validityData) external onlyOwner returns (uint256) {
		RequestIssue storage request = requestIssueStorage[_requestId];
		require(!request.approved, "Already issued"); //consider checking topic and other params from request

		request.approved = true;

		uint id = registry.issue(_to, _validityData, privateCertificateTopic, 0, request.data);

		updateCommitment(id, 0x0, _commitment);

		return id;
	}

	/*
		Migrate to public certificate (public issue)
	*/
	function requestMigrateToPublic(uint _certificateId, bytes32 _hash) external {
		uint id = ++requestMigrateToPublicNonce;

		requestMigrateToPublicStorage[id] = RequestStateChange({
			owner: msg.sender,
			hash: _hash,
			certificateId: _certificateId,
			approved: false
		});

		emit MigrateToPublicRequest(msg.sender, id);
	}

	function migrateToPublic(uint _requestId, uint _value, string calldata _salt, Proof[] calldata _proof, bytes32 _newCommitment) external {
		RequestStateChange storage request = requestMigrateToPublicStorage[_requestId];

		require(!request.approved, "Request already approved");
		require(request.hash == keccak256(abi.encodePacked(request.owner, _value, _salt)), "Requested hash does not match");
		require(validateProof(request.owner, _value, _salt, commitments[request.certificateId], _proof), "Invalid proof");

		request.approved = true;

		//here delegate both to public issuer
		//or even better move the logic to separate contract that keeps track of public to private and opposite direction
		if (migrations[request.certificateId]) {
			// registry.mint(request.owner, request.certificateId, _value);
			// publicIssuer.mint()
		} else {
			migrations[request.certificateId] = true;
			(,,bytes memory validityData, bytes memory data) = registry.getCertificate(request.certificateId);

			RequestIssue memory privateRequestIssue = getRequestIssueForCertificate(request.certificateId);

			uint requestId = publicIssuer.requestIssueFor(privateRequestIssue.certificateTopic, data, request.owner);
			uint id = publicIssuer.approveIssue(request.owner, requestId, _value, validityData);

			emit PublicCertificateCreated(request.certificateId, id);
		}
	}

	/*
		Transfer volume to public
	*/
	function transferToPublic(uint _requestId, uint _value, string calldata _salt, Proof[] calldata _proof) external {
		RequestStateChange storage request = requestMigrateToPublicStorage[_requestId];

		require(!request.approved, "Request already approved");
		require(request.hash == keccak256(abi.encodePacked(request.owner, _value, _salt)), "Requested hash does not match");
		require(validateProof(request.owner, _value, _salt, commitments[request.certificateId], _proof), "Invalid proof");

		request.approved = true;

		registry.safeTransferFrom(address(this), request.owner, request.certificateId, _value, new bytes(0)); //TODO: do we need a data here?
	}

	/*
		Private transfer
	*/
	function requestPrivateTransfer(uint _certificateId, bytes32 _hash) external {
		uint id = ++requestPrivateTransferNonce;

		requestPrivateTransferStorage[id] = RequestStateChange({
			owner: msg.sender,
			hash: _hash,
			certificateId: _certificateId,
			approved: false
		});

		emit PrivateTransferRequest(msg.sender, id);
	}

	function privateTransfer(uint _requestId, Proof[] calldata _proof, bytes32 _previousCommitment, bytes32 _commitment) external {
		RequestStateChange storage request = requestPrivateTransferStorage[_requestId];

		require(!request.approved, "Request already approved");
		require(validateMerkle(request.hash, _commitment, _proof), "Wrong merkle tree");

		request.approved = true;

		updateCommitment(request.certificateId, _previousCommitment, _commitment);
	}

	/*
		Utils
	*/
	function validateProof(address _key, uint _value, string memory _salt, bytes32 _rootHash, Proof[] memory _proof) private pure returns(bool) {
		bytes32 hash = keccak256(abi.encodePacked(_key, _value, _salt));

		return validateMerkle(hash, _rootHash, _proof);
	}

	function validateMerkle(bytes32 _leaf, bytes32 _rootHash, Proof[] memory _proof) private pure returns(bool) {
		bytes32 hash = _leaf;

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

    function getPublicIssuerAddress() public view returns (address) {
        return address(publicIssuer);
    }

    function version() public view returns (string memory) {
        return "v0.1";
    }
}