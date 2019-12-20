pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "./ERC1888/IERC1888.sol";

contract PrivateIssuer {
  event CommitmentUpdated(address indexed _owner, uint256 indexed _id, bytes32 _commitment);

  event IssueRequest(address indexed _owner, uint256 indexed _id);
  event MigrateToPublicRequest(address indexed _owner, uint256 indexed _id);

  ERC1888 public registry;
  int public privateCertificateTopic = 1234; 
  int public publicCertificateTopic = 1235; 

  struct RequestIssue {
    address owner;
    bytes data;
    bool approved;
  }

  struct RequestMigrateToPublic {
    address owner;
    uint certificateId;
    bytes32 volumeHash;
    bool approved;
  }

  struct Proof {
    bool left;
    bytes32 hash;
  }

  uint public requestIssueNonce;
  uint public requestMigrateToPublicNonce;

  mapping(uint256 => RequestIssue) public requestIssueStorage;
  mapping(uint256 => RequestMigrateToPublic) public requestMigrateToPublicStorage;
  mapping(uint256 => bytes32) public commitments;
  mapping(uint256 => bool) public migrations;

  constructor(ERC1888 _registry) public {
    registry = _registry;
  }

  function updateCommitment(uint _id, bytes32 _commitment) public {
    commitments[_id] = _commitment;

    emit CommitmentUpdated(msg.sender, _id, _commitment);
  }

  /*
    Private Issue
  */

  function encodeIssue(uint _from, uint _to, string memory _deviceId, uint _requestId) public pure returns (bytes memory) {
    return abi.encode(_from, _to, _deviceId, _requestId);
  }

  function decodeIssue(bytes memory _data) public pure returns (uint, uint, string memory, uint) {
    return abi.decode(_data, (uint, uint, string, uint));
  }

  function requestIssue(bytes calldata _data) external {
    uint id = ++requestIssueNonce;

    requestIssueStorage[id] = RequestIssue({
      owner: msg.sender,
      data: _data,
      approved: false
    });

    emit IssueRequest(msg.sender, id);
  }

  //onlyOwner (issuer)
  function approveIssue(address _to, uint _requestId, bytes32 _commitment, bytes calldata _validityData) external returns (uint256) {
    RequestIssue storage request = requestIssueStorage[_requestId];
    require(!request.approved, "Already issued"); //consider checking topic and other params from request

    request.approved = true;

    uint id = registry.issue(_to, _validityData, privateCertificateTopic, 0, request.data);

    updateCommitment(id, _commitment);

    return id;
  }

  /*
    Migrate to public certificate (public issue)  
  */
  function requestMigrateToPublic(uint _certificateId, bytes32 _volumeHash) external {
    uint id = ++requestMigrateToPublicNonce;

    requestMigrateToPublicStorage[id] = RequestMigrateToPublic({
      owner: msg.sender,
      volumeHash: _volumeHash,
      certificateId: _certificateId,
      approved: false
    });

    emit MigrateToPublicRequest(msg.sender, id);
  }

  function migrateToPublic(uint _requestId, uint _value, string calldata _salt, Proof[] calldata _proof) external {
    RequestMigrateToPublic storage request = requestMigrateToPublicStorage[_requestId];

    require(!request.approved, "Request already approved");
    require(!migrations[request.certificateId], "Certificate already exposed");
    require(request.volumeHash == keccak256(abi.encodePacked(request.owner, _value, _salt)), "Requested hash does not match");
    require(validateProof(request.owner, _value, _salt, commitments[request.certificateId], _proof), "Invalid proof");

    request.approved = true;
    migrations[request.certificateId] = true;

    (,,bytes memory validityData, bytes memory data) = registry.getCertificate(request.certificateId);
    
    registry.issue(request.owner, validityData, publicCertificateTopic, _value, data);
  }

  /*
    Private transfer
  */
  function requestTransfer() external;
  function approveTransfer() external;

  /*
    Utils
  */
  function validateProof(address _key, uint _value, string memory _salt, bytes32 _rootHash, Proof[] memory _proof) pure private returns(bool) {
    bytes32 hash = keccak256(abi.encodePacked(_key, _value, _salt));

    for(uint i=0; i<_proof.length; i++) {
        Proof memory p = _proof[i];
        if (p.left) {
            hash = keccak256(abi.encodePacked(p.hash, hash));
        } else {
            hash = keccak256(abi.encodePacked(hash, p.hash));
        }
    }

    return _rootHash == hash;
  }
}