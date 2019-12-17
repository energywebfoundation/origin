pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "./ERC1155/ERC1155.sol";
import "./ERC1888/IERC1888.sol";

contract Issuer is ERC1155, ERC1888 {
  event CommitmentUpdated(address indexed _owner, uint256 indexed _id, bytes32 _commitment);

  event IssueRequest(address indexed _owner, uint256 indexed _id);
  event ClaimRequest(address indexed _owner, uint256 indexed _id);
  event VolumeExposeRequest(address indexed _owner, uint256 indexed _id);

  struct Certificate {
    int256 topic;
    address issuer; // msg.sender
    bytes validityData; // call data
    bytes data;
  }

  //consider using bytes only
  struct Request {
    address owner;
    int256 topic;
    bytes data;
    bool approved;
  }

  struct RequestClaim {
    address owner;
    bytes32 inputHash;
    uint certificateId;
    bool approved;
  }

  struct RequestVolumeExpose {
    address owner;
    uint certificateId;
    uint volume;
    bool approved;
  }

  struct Proof {
    bool left;
    bytes32 hash;
  }

  uint public nonce;
  uint public requestIssueNonce;
  uint public requestClaimNonce;
  uint public requestVolumeExposeNonce;

  mapping(uint256 => Certificate) public certificateStorage;
  mapping(uint256 => Request) public requestIssueStorage;
  mapping(uint256 => RequestClaim) public requestClaimStorage;
  mapping(uint256 => RequestVolumeExpose) public requestVolumeExposeStorage;

  mapping(uint256 => bytes32) public commitments;
  mapping(uint256 => mapping(address => uint256)) public claimedBalances;

  function encodeIssue(uint _from, uint _to, string memory _deviceId, uint _requestId, bytes32 _commitment) public pure returns (bytes memory) {
    return abi.encode(_from, _to, _deviceId, _requestId, _commitment);
  }

  function decodeIssue(bytes memory _data) public pure returns (uint, uint, string memory, uint, bytes32) {
    return abi.decode(_data, (uint, uint, string, uint, bytes32));
  }

  function encodeRequestIssue(uint _from, uint _to, string memory _deviceId) public pure returns (bytes memory) {
    return abi.encode(_from, _to, _deviceId);
  }

  function decodeRequestIssue(bytes memory _data) public pure returns (uint, uint, string memory) {
    return abi.decode(_data, (uint, uint, string));
  }

  function encodeClaim(uint _requestId, string memory _salt, Proof[] memory _proof) public pure returns (bytes memory) {
    return abi.encode(_requestId, _salt, _proof);
  }

  function decodeClaim(bytes memory _data) public pure returns (uint, string memory, Proof[] memory) {
    return abi.decode(_data, (uint, string, Proof[]));
  }

  //onlyIssuer
  function updateCommitment(uint _id, bytes32 _commitment) public {
    commitments[_id] = _commitment;

    emit CommitmentUpdated(msg.sender, _id, _commitment);
  }

  function getRequestIssue(uint _id) public returns (Request memory) {
    return requestIssueStorage[_id];
  }

  //everyone
  function requestIssue(int _topic, bytes calldata _data) external {
    uint id = ++requestIssueNonce;

    requestIssueStorage[id] = Request({
      owner: msg.sender,
      topic: _topic,
      data: _data,
      approved: false
    });

    emit IssueRequest(msg.sender, id);
  }

  function getRequestClaim(uint _id) public returns (RequestClaim memory) {
    return requestClaimStorage[_id];
  }

  //everyone
  function requestClaim(uint _certificateId, bytes32 _inputHash) external {
    uint id = ++requestClaimNonce;

    requestClaimStorage[id] = RequestClaim({
      owner: msg.sender,
      inputHash: _inputHash,
      certificateId: _certificateId,
      approved: false
    });

    emit ClaimRequest(msg.sender, id); //add cert if
  }

  function getRequestVolumeExpose(uint _id) public returns (RequestVolumeExpose memory) {
    return requestVolumeExposeStorage[_id];
  }

  function requestVolumeExpose(uint _certificateId, uint _volume) external {
    uint id = ++requestVolumeExposeNonce;

    requestVolumeExposeStorage[id] = RequestVolumeExpose({
      owner: msg.sender,
      volume: _volume,
      certificateId: _certificateId,
      approved: false
    });

    emit VolumeExposeRequest(msg.sender, id);
  }

  function validateProof(address _key, uint _value, string memory _salt, bytes32 _rootHash, Proof[] memory _proof) private returns(bool) {
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

  //onlyIssuer
  function issue(address _to, bytes calldata _validityData, int256 _topic, uint256 _value, bytes calldata _data) external returns (uint256) {
    uint256 id = ++nonce;

    (,,,uint _requestId, bytes32 _commitment) = decodeIssue(_data);

    require(!requestIssueStorage[_requestId].approved, "Already issued"); //consider checking topic and other params from request

    requestIssueStorage[_requestId].approved = true;

    certificateStorage[id] = Certificate({
      topic: _topic,
      issuer: msg.sender,
      validityData: _validityData,
      data: _data
    });

    updateCommitment(id, _commitment);

    ERC1155.safeTransferFrom(address(0x0), _to, id, 0, new bytes(0));

    emit IssuanceSingle(msg.sender, _topic, id);

    // MUST check the validity of the certificate before continuing with the token minting
    // (i.e. issuer.staticcall(validityData) should return (true, ))

    return id;
  }

  //onlyIssuer
  function exposeVolume(address _from, uint256 _id, uint256 _value, bytes calldata _data, uint _requestId, bytes32 _commitment) external {
    require(!requestVolumeExposeStorage[_requestId].approved, "Reqiest request already approved");

    //TODO: zero knowledge proof of _value < real balance

    //mint
    balances[_id][_from] = _value.add(balances[_id][_from]);
    
    //transfer to self
    ERC1155.safeTransferFrom(_from, _from, _id, _value, _data); //TODO: decide wheter mint or transfer from self

    updateCommitment(_id, _commitment);
  }

  //onlyIssuer
  //using bytes -> instead of bytes32 for claimdata
  function safeTransferAndClaimFrom(address _from, address _to, uint256 _id, uint256 _value, bytes calldata _data, bytes calldata _claimData) external {
    //validate proof
    (uint _requestId, string memory _salt, Proof[] memory _proof) = decodeClaim(_claimData);
    
    require(!requestClaimStorage[_requestId].approved, "Claim request already approved");
    require(requestClaimStorage[_requestId].inputHash == keccak256(abi.encodePacked(_from, _value, _salt)), "Requested hash does not match");
    
    (,,,, bytes32 _commitment) = decodeIssue(certificateStorage[_id].data);
    require(validateProof(_from, _value, _salt, _commitment, _proof), "Invalid proof");

    //mint
    balances[_id][_from]   = _value.add(balances[_id][_from]);
    //transfer
    ERC1155.safeTransferFrom(_from, _to, _id, _value, _data);
    //burn
    _burn(_to, _id, _value);

    Certificate memory cert = certificateStorage[_id];

    emit ClaimSingle(cert.issuer, address(0x0), cert.topic, _id, _value, _claimData); //_claimSubject address ??
  }

  function claimedBalanceOf(address _owner, uint256 _id) external view returns (uint256) {
    return claimedBalances[_id][_owner];
  }

  function _burn(address _from, uint256 _id, uint256 _value) internal {
    balances[_id][_from] = balances[_id][_from].sub(_value);
    claimedBalances[_id][_from] = claimedBalances[_id][_from].add(_value);
  }
}