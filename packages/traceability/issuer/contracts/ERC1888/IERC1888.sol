// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

interface ERC1888 is IERC1155  {

    struct Certificate {
        int256 topic;
        address issuer; // msg.sender
        bytes validityData; // call data
        bytes data;
    }

    event IssuanceSingle(address indexed _issuer, int256 indexed _topic, uint256 _id);
    event IssuanceBatch(address indexed _issuer, int256[] indexed _topics, uint256[] _ids);

    event ClaimSingle(address indexed _claimIssuer, address indexed _claimSubject, int256 indexed _topic, uint256 _id, uint256 _value, bytes _claimData);
    event ClaimBatch(address indexed _claimIssuer, address indexed _claimSubject, int256[] indexed _topics, uint256[] _ids, uint256[] _values, bytes[] _claimData);

    function issue(address _to, bytes calldata _validityData, int256 _topic, uint256 _value, bytes calldata _data) external returns (uint256);
    // function batchIssue(bytes[] _data, uint256[] _topics, uint256[] _value, bytes32[] _signatures) external returns(uint256[]);

    function safeTransferAndClaimFrom(address _from, address _to, uint256 _id, uint256 _value, bytes calldata _data, bytes calldata _claimData) external;
    function safeBatchTransferAndClaimFrom(address _from, address _to, uint256[] calldata _ids, uint256[] calldata _values, bytes calldata _data, bytes[] calldata _claimData) external;

    function getCertificate(uint256 _id) external view returns (address issuer, int256 topic, bytes calldata validityCall, bytes calldata data);
    function claimedBalanceOf(address _owner, uint256 _id) external view returns (uint256);
    function claimedBalanceOfBatch(address[] calldata _owners, uint256[] calldata _ids) external view returns (uint256[] memory);
}