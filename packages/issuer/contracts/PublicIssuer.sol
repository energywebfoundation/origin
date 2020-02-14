pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "./AbstractIssuer.sol";
import "./Registry.sol";

contract PublicIssuer is AbstractIssuer {
    function approveIssue(address _to, uint _requestId, uint _value, bytes memory _validityData) public onlyOwner returns (uint256) {
        RequestIssue storage request = requestIssueStorage[_requestId];
        require(!request.approved, "Already issued"); //consider checking topic and other params from request

        request.approved = true;

        uint256 certificateId = registry.issue(_to, _validityData, certificateTopic, _value, request.data);
        certificateToRequestStorage[certificateId] = _requestId;

        return certificateId;
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

    function version() public view returns (string memory) {
        return "v0.1";
    }
}