pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "./Registry.sol";

contract PublicIssuer {
  event IssueRequest(address indexed _owner, uint256 indexed _id);

  Registry public registry;
  int public certificateTopic = 1235; 

  struct RequestIssue {
    address owner;
    bytes data;
    bool approved;
  }

  uint public requestIssueNonce;

  mapping(uint256 => RequestIssue) public requestIssueStorage;

  constructor(Registry _registry) public {
    registry = _registry;
  }

  function encodeIssue(uint _from, uint _to, string memory _deviceId) public pure returns (bytes memory) {
    return abi.encode(_from, _to, _deviceId);
  }

  function decodeIssue(bytes memory _data) public pure returns (uint, uint, string memory) {
    return abi.decode(_data, (uint, uint, string));
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

  function requestIssueFor(address _owner, bytes calldata _data) external returns (uint) {
    uint id = ++requestIssueNonce;

    requestIssueStorage[id] = RequestIssue({
      owner: _owner,
      data: _data,
      approved: false
    });

    emit IssueRequest(msg.sender, id);

    return id;
  }

  //onlyOwner (issuer)
  function approveIssue(address _to, uint _requestId, uint _value, bytes calldata _validityData) external returns (uint256) {
    RequestIssue storage request = requestIssueStorage[_requestId];
    require(!request.approved, "Already issued"); //consider checking topic and other params from request

    request.approved = true;

    return registry.issue(_to, _validityData, certificateTopic, _value, request.data);
  }
}