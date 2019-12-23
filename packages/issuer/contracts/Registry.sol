pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "./ERC1155/ERC1155.sol";
import "./ERC1888/IERC1888.sol";

contract Registry is ERC1155, ERC1888 {
  uint public nonce;
  mapping(uint256 => Certificate) public certificateStorage;
  mapping(uint256 => mapping(address => uint256)) public claimedBalances;

  function issue(address _to, bytes calldata _validityData, int256 _topic, uint256 _value, bytes calldata _data) external returns (uint256) {
    _validate(msg.sender, _validityData);

    uint256 id = ++nonce;

    certificateStorage[id] = Certificate({
      topic: _topic,
      issuer: msg.sender,
      validityData: _validityData,
      data: _data
    });

    ERC1155.safeTransferFrom(address(0x0), _to, id, _value, new bytes(0));

    emit IssuanceSingle(msg.sender, _topic, id);

    return id;
  }

  function safeTransferAndClaimFrom(address _from, address _to, uint256 _id, uint256 _value, bytes calldata _data, bytes32 _claimData) external {
    Certificate memory cert = certificateStorage[_id];

    _validate(cert.issuer,  cert.validityData);

    //transfer
    ERC1155.safeTransferFrom(_from, _to, _id, _value, _data);
    //burn
    _burn(_to, _id, _value);

    emit ClaimSingle(cert.issuer, address(0x0), cert.topic, _id, _value, _claimData); //_claimSubject address ??
  }

  function getCertificate(uint256 _id) external view returns (address issuer, int256 topic, bytes memory validityData, bytes memory data) {
    Certificate memory certificate = certificateStorage[_id];
    return (certificate.issuer, certificate.topic, certificate.validityData, certificate.data);
  }

  function mint(address _to, uint256 _id, uint256 _value) external {
    require(certificateStorage[_id].issuer == msg.sender); // this also implicity checks if certificate has been issued before mint
    
    ERC1155.safeTransferFrom(address(0x0), _to, _id, _value, new bytes(0));
  }

  function claimedBalanceOf(address _owner, uint256 _id) external view returns (uint256) {
    return claimedBalances[_id][_owner];
  }

  function _burn(address _from, uint256 _id, uint256 _value) internal {
    balances[_id][_from] = balances[_id][_from].sub(_value);
    claimedBalances[_id][_from] = claimedBalances[_id][_from].add(_value);
  }

  function _validate(address _verifier, bytes memory _validityData) internal {
    (bool success, bytes memory result) = _verifier.staticcall(_validityData);
    require(success && abi.decode(result, (bool)), "Invalid request");
  }
}