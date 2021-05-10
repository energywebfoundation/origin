// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./ERC1888/IERC1888.sol";

contract Registry is ERC1155, ERC1888 {

	mapping(uint256 => Certificate) public certificateStorage;
	mapping(uint256 => mapping(address => uint256)) public claimedBalances;

    uint256 private _latestCertificateId;

	constructor(string memory _uri) ERC1155(_uri) {}

	function issue(address _to, bytes calldata _validityData, int256 _topic, uint256 _value, bytes calldata _data) external override returns (uint256 _id) {
		_validate(_msgSender(), _validityData);

		_id = ++_latestCertificateId;
		ERC1155._mint(_to, _id, _value, _data);

		certificateStorage[_id] = Certificate({
			topic: _topic,
			issuer: _msgSender(),
			validityData: _validityData,
			data: _data
		});

		emit IssuanceSingle(_msgSender(), _topic, _id);
	}

	function mint(uint256 _id, address _to, uint256 _quantity) external {
		require(_quantity > 0, "issue(): _value must be higher than 0.");

		Certificate memory cert = certificateStorage[_id];
		require(_msgSender() == cert.issuer, "mint(): only the original certificate issuer can mint more tokens");

		ERC1155._mint(_to, _id, _quantity, new bytes(0));
	}

	function safeTransferAndClaimFrom(
		address _from,
		address _to,
		uint256 _id,
		uint256 _value,
		bytes calldata _data,
		bytes calldata _claimData
	) external override {
		Certificate memory cert = certificateStorage[_id];

		_validate(cert.issuer,  cert.validityData);

        require(_to != address(0x0), "safeTransferAndClaimFrom: _to must be non-zero.");
        require(_from == _msgSender() || ERC1155.isApprovedForAll(_from, _msgSender()), "safeTransferAndClaimFrom: Need operator approval for 3rd party claims.");
        require(ERC1155.balanceOf(_from, _id) > 0, "safeTransferAndClaimFrom: _from balance has to be higher than 0");

		if (_from != _to) {
			safeTransferFrom(_from, _to, _id, _value, _data);
		}

		_burn(_to, _id, _value);

		emit ClaimSingle(_from, _to, cert.topic, _id, _value, _claimData); //_claimSubject address ??
	}

	function safeBatchTransferAndClaimFrom(
		address _from,
		address _to,
		uint256[] calldata _ids,
		uint256[] calldata _values,
		bytes calldata _data,
		bytes[] calldata _claimData
	) external override {
		uint numberOfClaims = _ids.length;

        require(_to != address(0x0), "safeBatchTransferAndClaimFrom: _to address must be non-zero.");
        require(_ids.length == _values.length, "safeBatchTransferAndClaimFrom: _ids and _values array length must match.");
        require(_from == _msgSender() || ERC1155.isApprovedForAll(_from, _msgSender()), "safeBatchTransferAndClaimFrom: Need operator approval for 3rd party transfers.");

		require(numberOfClaims > 0, "safeBatchTransferAndClaimFrom: at least one certificate has to be present.");
		require(
			_values.length == numberOfClaims && _claimData.length == numberOfClaims,
			"safeBatchTransferAndClaimFrom: not all arrays are of the same length."
		);

		int256[] memory topics = new int256[](numberOfClaims);

		for (uint256 i = 0; i < numberOfClaims; ++i) {
			Certificate memory cert = certificateStorage[_ids[i]];
			_validate(cert.issuer,  cert.validityData);
			topics[i] = cert.topic;
		}

		if (_from != _to) {
			safeBatchTransferFrom(_from, _to, _ids, _values, _data);
		}

		for (uint256 i = 0; i < numberOfClaims; ++i) {
			_burn(_to, _ids[i], _values[i]);
		}

		emit ClaimBatch(_from, _to, topics, _ids, _values, _claimData);
	}

	function getCertificate(uint256 _id) external override view returns (address issuer, int256 topic, bytes memory validityData, bytes memory data) {
		require(_id <= _latestCertificateId, "getCertificate: _id out of bounds");

		Certificate memory certificate = certificateStorage[_id];
		return (certificate.issuer, certificate.topic, certificate.validityData, certificate.data);
	}

	function claimedBalanceOf(address _owner, uint256 _id) external override view returns (uint256) {
		return claimedBalances[_id][_owner];
	}

	function claimedBalanceOfBatch(address[] calldata _owners, uint256[] calldata _ids) external override view returns (uint256[] memory) {
        require(_owners.length == _ids.length, "ERC1155: _owners and ids length mismatch");

        uint256[] memory batchClaimBalances = new uint256[](_owners.length);

        for (uint256 i = 0; i < _owners.length; ++i) {
            batchClaimBalances[i] = this.claimedBalanceOf(_owners[i], _ids[i]);
        }

        return batchClaimBalances;
	}

	function _burn(address _from, uint256 _id, uint256 _value) internal override {
		ERC1155._burn(_from, _id, _value);

		claimedBalances[_id][_from] = claimedBalances[_id][_from] + _value;
	}

	function _validate(address _verifier, bytes memory _validityData) internal view {
		(bool success, bytes memory result) = _verifier.staticcall(_validityData);

		require(
			success && abi.decode(result, (bool)),
			"_validate(): Request/certificate invalid, please check with your issuer."
		);
	}
}
