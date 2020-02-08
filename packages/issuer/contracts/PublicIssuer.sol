pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol";

import "./Registry.sol";

contract PublicIssuer is Initializable, Ownable {
    event IssueRequest(address indexed _owner, uint256 indexed _id);

    Registry public registry;
    int public certificateTopic = 1235;

    struct RequestIssue {
        address owner;
        bytes data;
        bool approved;
        bool revoked;
    }

    uint public requestIssueNonce;

    mapping(uint256 => RequestIssue) public requestIssueStorage;
    mapping(uint256 => uint256) public certificateToRequestStorage;

    mapping(string => uint256) private deviceLatestGenerationTimestamp;

    function initialize(address _registry) public initializer {
        require(_registry != address(0), "initialize: Cannot use address 0x0 as registry address.");
        registry = Registry(_registry);

        Ownable.initialize(msg.sender);
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
        (uint256 from,, string memory deviceId) = decodeIssue(_data);
        require(
            from > deviceLatestGenerationTimestamp[deviceId],
            "requested generation period overlaps already approved generation period"
        );

        uint id = ++requestIssueNonce;

        requestIssueStorage[id] = RequestIssue({
            owner: _owner,
            data: _data,
            approved: false,
            revoked: false
        });

        emit IssueRequest(msg.sender, id);

        return id;
    }

    function requestIssue(bytes calldata _data) external {
        requestIssueFor(_data, msg.sender);
    }

    function issue(address _to, uint _value, bytes memory _data) public onlyOwner returns (uint256) {
        uint256 requestId = requestIssueFor(_data, _to);

        return approveIssue(
            _to,
            requestId,
            _value,
            abi.encodeWithSignature("isRequestValid(uint256)", requestId)
        );
    }

    function approveIssue(address _to, uint _requestId, uint _value, bytes memory _validityData) public onlyOwner returns (uint256) {
        RequestIssue storage request = requestIssueStorage[_requestId];
        require(!request.approved, "Already issued"); //consider checking topic and other params from request

        request.approved = true;

        uint256 certificateId = registry.issue(_to, _validityData, certificateTopic, _value, request.data);
        certificateToRequestStorage[certificateId] = _requestId;

        (, uint256 to, string memory deviceId) = decodeIssue(request.data);
        deviceLatestGenerationTimestamp[deviceId] = to;

        return certificateId;
    }

    function revokeRequest(uint256 _requestId) public onlyOwner {
        RequestIssue storage request = requestIssueStorage[_requestId];
        require(!request.revoked, "revokeRequest(): Already revoked");

        request.revoked = true;
    }

    function revokeCertificate(uint256 _certificateId) public onlyOwner {
        revokeRequest(certificateToRequestStorage[_certificateId]);
    }

    function isRequestValid(uint256 _requestId) external view returns (bool) {
        RequestIssue storage request = requestIssueStorage[_requestId];

        return _requestId <= requestIssueNonce
            && request.approved
            && request.revoked == false;
    }

    function getRegistryAddress() public view returns (address) {
        return address(registry);
    }

    function version() public view returns (string memory) {
        return "v0.1";
    }
}