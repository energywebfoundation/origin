pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol";

import "./Registry.sol";

contract AbstractIssuer is Initializable, Ownable {
    event IssueRequest(address indexed _owner, uint256 indexed _id);

    struct RequestIssue {
        address owner;
        bytes data;
        bool approved;
        bool revoked;
    }

    struct GenerationPeriod {
        uint from;
        uint to;
    }

    int public certificateTopic;
    Registry public registry;

    uint public requestIssueNonce;

    mapping(uint256 => RequestIssue) public requestIssueStorage;
    mapping(uint256 => uint256) public certificateToRequestStorage;
    // Device Id => Latest Generation Timestamp
    mapping(string => uint256) public deviceLatestGenerationTimestamp;

    function initialize(int _certificateTopic, address _registry, address _owner) public initializer {
        require(_registry != address(0), "initialize: Cannot use address 0x0 as registry address.");
        require(_owner != address(0), "initialize: Cannot use address 0x0 as the owner.");

        certificateTopic = _certificateTopic;

        registry = Registry(_registry);
        Ownable.initialize(_owner);
    }

	function encodeIssue(uint _from, uint _to, string memory _deviceId) public pure returns (bytes memory) {
		return abi.encode(_from, _to, _deviceId);
	}

	function decodeIssue(bytes memory _data) public pure returns (uint, uint, string memory) {
		return abi.decode(_data, (uint, uint, string));
	}

    function getRequestIssue(uint _requestId) public returns (RequestIssue memory) {
        return requestIssueStorage[_requestId];
    }

    function getRequestIssueForCertificate(uint _certificateId) public returns (RequestIssue memory) {
        return getRequestIssue(certificateToRequestStorage[_certificateId]);
    }

    function requestIssueFor(bytes memory _data, address _owner) public returns (uint) {
        (uint256 from, uint256 to, string memory deviceId) = decodeIssue(_data);
        require(to > from, "Generation period invalid. 'to' is lower than 'from'");
        require(to <= block.timestamp, "Generation period invalid. 'to' is higher than now");
        require(
            from >= deviceLatestGenerationTimestamp[deviceId],
            "requested 'from' and 'to' overlap already approved generation period"
        );

        uint id = ++requestIssueNonce;

        requestIssueStorage[id] = RequestIssue({
            owner: _owner,
            data: _data,
            approved: false,
            revoked: false
        });

        deviceLatestGenerationTimestamp[deviceId] = to;

        emit IssueRequest(msg.sender, id);

        return id;
    }

    function requestIssue(bytes calldata _data) external {
        requestIssueFor(_data, msg.sender);
    }

    function isRequestValid(uint256 _requestId) external view returns (bool) {
        RequestIssue storage request = requestIssueStorage[_requestId];

        return _requestId <= requestIssueNonce && request.approved && request.revoked == false;
    }

    function revokeRequest(uint256 _requestId) public onlyOwner {
        RequestIssue storage request = requestIssueStorage[_requestId];
        require(!request.revoked, "revokeRequest(): Already revoked");

        request.revoked = true;
    }

    function revokeCertificate(uint256 _certificateId) public onlyOwner {
        revokeRequest(certificateToRequestStorage[_certificateId]);
    }

    function getRegistryAddress() public view returns (address) {
        return address(registry);
    }

    function version() public view returns (string memory);
}