pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "./Registry.sol";

contract PublicIssuer is Initializable {
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

    function initialize(Registry _registry) public initializer {
        registry = _registry;
    }

    function encodeIssue(uint _from, uint _to, string memory _deviceId) public pure returns (bytes memory) {
        return abi.encode(_from, _to, _deviceId);
    }

    function decodeIssue(bytes memory _data) public pure returns (uint, uint, string memory) {
        return abi.decode(_data, (uint, uint, string));
    }

    function getRequestIssue(uint _requestId) external returns (RequestIssue memory) {
        return requestIssueStorage[_requestId];
    }

    function requestIssueFor(bytes memory _data, address _owner) public returns (uint) {
        uint id = ++requestIssueNonce;

        requestIssueStorage[id] = RequestIssue({
            owner: _owner,
            data: _data,
            approved: false
        });

        emit IssueRequest(msg.sender, id);

        return id;
    }

    function requestIssue(bytes calldata _data) external {
        requestIssueFor(_data, msg.sender);
    }

    //onlyOwner (issuer)
    function approveIssue(address _to, uint _requestId, uint _value, bytes calldata _validityData) external returns (uint256) {
        RequestIssue storage request = requestIssueStorage[_requestId];
        require(!request.approved, "Already issued"); //consider checking topic and other params from request

        request.approved = true;

        return registry.issue(_to, _validityData, certificateTopic, _value, request.data);
    }

    function isValid(uint _requestId) external view returns (bool) {
        return true;
    }

    function version() public view returns (string memory) {
        return "v0.1";
    }
}