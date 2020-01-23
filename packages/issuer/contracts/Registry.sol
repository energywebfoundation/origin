pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "./ERC1155/ERC1155Mintable.sol";
import "./ERC1888/IERC1888.sol";

contract Registry is ERC1155Mintable, ERC1888 {

	mapping(uint256 => Certificate) public certificateStorage;
	mapping(uint256 => mapping(address => uint256)) public claimedBalances;

	// Array with all certificate ids, used for enumeration
    uint256[] private _allCertificates;
	// Mapping from certificate id to position in the allCertificates array
    mapping(uint256 => uint256) private _allCertificatesIndex;

	function issue(address _to, bytes calldata _validityData, int256 _topic, uint256 _value, bytes calldata _data) external returns (uint256 _id) {
		_validate(msg.sender, _validityData);

		_id = this.create(_value, "Certificate", msg.sender);

		if (_value > 0) {
			safeTransferFrom(msg.sender, _to, _id, _value, _data);
		}

		certificateStorage[_id] = Certificate({
			topic: _topic,
			issuer: msg.sender,
			validityData: _validityData,
			data: _data
		});

		_allCertificatesIndex[_id] = _allCertificates.length;
		_allCertificates.push(_id);

		emit IssuanceSingle(msg.sender, _topic, _id);
	}

	function safeTransferAndClaimFrom(
		address _from,
		address _to,
		uint256 _id,
		uint256 _value,
		bytes calldata _data,
		bytes32 _claimData
	) external {
		Certificate memory cert = certificateStorage[_id];

		_validate(cert.issuer,  cert.validityData);

		safeTransferFrom(_from, _to, _id, _value, _data);
		_burn(_to, _id, _value);

		emit ClaimSingle(cert.issuer, address(0x0), cert.topic, _id, _value, _claimData); //_claimSubject address ??
	}

	function safeBatchTransferAndClaimFrom(
		address _from,
		address _to,
		uint256[] calldata _ids,
		uint256[] calldata _values,
		bytes calldata _data,
		bytes32[] calldata _claimData
	) external {
		uint numberOfClaims = _ids.length;

		require(numberOfClaims > 0, "safeBatchTransferAndClaimFrom: at least one certificate has to be present.");
		require(
			_values.length == numberOfClaims && _claimData.length == numberOfClaims,
			"safeBatchTransferAndClaimFrom: not all arrays are of the same length."
		);

		int256[] memory topics = new int256[](numberOfClaims);
		address issuer = address(0);

		for (uint256 i = 0; i < numberOfClaims; ++i) {
			Certificate memory cert = certificateStorage[_ids[i]];

			_validate(cert.issuer,  cert.validityData);
			if (issuer == address(0)) {
				issuer = cert.issuer;
			}

			topics[i] = cert.topic;
		}

		safeBatchTransferFrom(_from, _to, _ids, _values, _data);

		for (uint256 i = 0; i < numberOfClaims; ++i) {
			_burn(_to, _ids[i], _values[i]);
		}

		emit ClaimBatch(issuer, address(0x0), topics, _ids, _values, _claimData); //_claimSubject address ??
	}

	function getCertificate(uint256 _id) external view returns (address issuer, int256 topic, bytes memory validityData, bytes memory data) {
		require(_id <= totalSupply(), "getCertificate: _id out of bounds");

		Certificate memory certificate = certificateStorage[_id];
		return (certificate.issuer, certificate.topic, certificate.validityData, certificate.data);
	}

	function claimedBalanceOf(address _owner, uint256 _id) external view returns (uint256) {
		return claimedBalances[_id][_owner];
	}

	function _burn(address _from, uint256 _id, uint256 _value) internal {
		balances[_id][_from] = balances[_id][_from].sub(_value);
		claimedBalances[_id][_from] = claimedBalances[_id][_from].add(_value);
	}

	function _validate(address _verifier, bytes memory _validityData) internal {
		if (_verifier.isContract()) {
			(bool success, bytes memory result) = _verifier.staticcall(_validityData);

			require(
				success && abi.decode(result, (bool)),
				"_validate(): Request/certificate invalid, please check with your issuer."
			);
        }
	}

	/**
     * @dev Gets the total amount of certificates stored by the contract.
     * @return uint256 representing the total amount of certificates
     */
    function totalSupply() public view returns (uint256) {
        return _allCertificates.length;
    }

	function allCertificateIds() public view returns (uint256[] memory) {
		return _allCertificates;
    }
}
