// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./ERC1888/IERC1888.sol";

/**
 * @dev Implementation of the Transferable Certificate standard ERC-1888.
 * See https://github.com/ethereum/EIPs/issues/1888
 *
 * Also complies to ERC-1155: https://eips.ethereum.org/EIPS/eip-1155.
 */
contract Registry is ERC1155, ERC1888 {

	// Storage for the Certificate structs
	mapping(uint256 => Certificate) public certificateStorage;

	// Mapping from token ID to account balances
	mapping(uint256 => mapping(address => uint256)) public claimedBalances;

	// Incrementing nonce, used for generating certificate IDs
    uint256 private _latestCertificateId;

	constructor(string memory _uri) public ERC1155(_uri) {}

    /**
     * @dev See {IERC1888-issue}.
     *
     * Requirements:
     * - `_to` cannot be the zero address.
     */
	function issue(address _to, bytes calldata _validityData, uint256 _topic, uint256 _value, bytes calldata _issuanceData) external override returns (uint256) {
		require(_to != address(0x0), "Registry::issue: to must be non-zero.");
		
		_validate(_msgSender(), _validityData);

		uint256 id = ++_latestCertificateId;
		ERC1155._mint(_to, id, _value, _issuanceData);

		certificateStorage[id] = Certificate({
			topic: _topic,
			issuer: _msgSender(),
			validityData: _validityData,
			data: _issuanceData
		});

		emit IssuanceSingle(_msgSender(), _topic, id, _value);

		return id;
	}

	/**
     * @dev See {IERC1888-batchIssue}.
     *
     * Requirements:
     * - `_to` cannot be the zero address.
     * - `_issuanceData`, `_values` and `_validityCalls` must have the same length.
     */
	function batchIssue(address _to, bytes memory _issuanceData, uint256 _topic, uint256[] memory _values, bytes[] memory _validityCalls) external override returns (uint256[] memory) {
		require(_to != address(0x0), "Registry::issue: to must be non-zero.");
		require(_issuanceData.length == _values.length, "Registry::batchIssueMultiple: _issuanceData and _values arrays have to be the same length");
		require(_values.length == _validityCalls.length, "Registry::batchIssueMultiple: _values and _validityCalls arrays have to be the same length");

		uint256[] memory ids = new uint256[](_values.length);

		address operator = _msgSender();

		for (uint256 i = 0; i <= _values.length; i++) {
			ids[i] = i + _latestCertificateId + 1;
			_validate(operator, _validityCalls[i]);
		}
			
		ERC1155._mintBatch(_to, ids, _values, _issuanceData);

		for (uint256 i = 0; i < ids.length; i++) {
			certificateStorage[ids[i]] = Certificate({
				topic: _topic,
				issuer: operator,
				validityData: _validityCalls[i],
				data: _issuanceData
			});
		}

		emit IssuanceBatch(operator, _topic, ids, _values);

		return ids;
	}

	/**
     * @dev Similar to {IERC1888-batchIssue}, but not a part of the ERC-1888 standard.
	 * Allows batch issuing to an array of _to addresses.
     *
     * Requirements:
     * - `_to` cannot be the zero addresses.
     * - `_to`, `_issuanceData`, `_values` and `_validityCalls` must have the same length.
     */
	function batchIssueMultiple(address[] memory _to, bytes[] memory _issuanceData, uint256 _topic, uint256[] memory _values, bytes[] memory _validityCalls) external returns (uint256[] memory) {
		require(_to.length == _issuanceData.length, "Registry::batchIssueMultiple: _to and _issuanceData arrays have to be the same length");
		require(_issuanceData.length == _values.length, "Registry::batchIssueMultiple: _issuanceData and _values arrays have to be the same length");
		require(_values.length == _validityCalls.length, "Registry::batchIssueMultiple: _values and _validityCalls arrays have to be the same length");

		uint256[] memory ids = new uint256[](_values.length);

		address operator = _msgSender();

		for (uint256 i = 0; i < _values.length; i++) {
			ids[i] = i + _latestCertificateId + 1;
			_validate(operator, _validityCalls[i]);
		}
			
		for (uint256 i = 0; i < ids.length; i++) {
			require(_to[i] != address(0x0), "Registry::issue: to must be non-zero.");
			ERC1155._mint(_to[i], ids[i], _values[i], _issuanceData[i]);

			certificateStorage[ids[i]] = Certificate({
				topic: _topic,
				issuer: operator,
				validityData: _validityCalls[i],
				data: _issuanceData[i]
			});
		}

		_latestCertificateId = ids[ids.length - 1];

		emit IssuanceBatch(operator, _topic, ids, _values);

		return ids;
	}

	/**
     * @dev Allows the issuer to mint more fungible tokens for existing ERC-188 certificates.
     *
     * Requirements:
     * - `_to` cannot be the zero addresses.
     */
	function mint(uint256 _id, address _to, uint256 _quantity) external {
		require(_to != address(0x0), "Registry::issue: to must be non-zero.");
		require(_quantity > 0, "Registry::mint: _quantity must be higher than 0.");

		Certificate memory cert = certificateStorage[_id];
		require(_msgSender() == cert.issuer, "Registry::mint: only the original certificate issuer can mint more tokens");

		ERC1155._mint(_to, _id, _quantity, new bytes(0));
	}

	/**
     * @dev See {IERC1888-safeTransferAndClaimFrom}.
     *
     * Requirements:
     * - `_to` cannot be the zero address.
     * - `_from` has to have a balance above or equal `_value`.
     */
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

        require(_to != address(0x0), "Registry::safeTransferAndClaimFrom: _to must be non-zero.");
		require(_from != address(0x0), "Registry::safeBatchTransferAndClaimFrom: _from address must be non-zero.");

        require(_from == _msgSender() || ERC1155.isApprovedForAll(_from, _msgSender()), "safeTransferAndClaimFrom: Need operator approval for 3rd party claims.");
        require(ERC1155.balanceOf(_from, _id) >= _value, "Registry::safeTransferAndClaimFrom: _from balance has to be higher or equal _value");

		if (_from != _to) {
			safeTransferFrom(_from, _to, _id, _value, _data);
		}

		_burn(_to, _id, _value);

		emit ClaimSingle(_from, _to, cert.topic, _id, _value, _claimData); //_claimSubject address ??
	}

	/**
     * @dev See {IERC1888-safeBatchTransferAndClaimFrom}.
     *
     * Requirements:
     * - `_to` and `_from` cannot be the zero addresses.
     * - `_from` has to have a balance above 0.
     */
	function safeBatchTransferAndClaimFrom(
		address _from,
		address _to,
		uint256[] calldata _ids,
		uint256[] calldata _values,
		bytes calldata _data,
		bytes[] calldata _claimData
	) external override {
		uint256 numberOfClaims = _ids.length;

        require(_to != address(0x0), "Registry::safeBatchTransferAndClaimFrom: _to address must be non-zero.");
		require(_from != address(0x0), "Registry::safeBatchTransferAndClaimFrom: _from address must be non-zero.");

        require(_ids.length == _values.length, "Registry::safeBatchTransferAndClaimFrom: _ids and _values array length must match.");
        require(_from == _msgSender() || ERC1155.isApprovedForAll(_from, _msgSender()), "Registry::safeBatchTransferAndClaimFrom: Need operator approval for 3rd party transfers.");

		require(numberOfClaims > 0, "Registry::safeBatchTransferAndClaimFrom: at least one certificate has to be present.");
		require(
			_values.length == numberOfClaims && _claimData.length == numberOfClaims,
			"Registry::safeBatchTransferAndClaimFrom: not all arrays are of the same length."
		);

		uint256[] memory topics = new uint256[](numberOfClaims);

		for (uint256 i = 0; i < numberOfClaims; i++) {
			Certificate memory cert = certificateStorage[_ids[i]];
			_validate(cert.issuer,  cert.validityData);
			topics[i] = cert.topic;
		}

		if (_from != _to) {
			safeBatchTransferFrom(_from, _to, _ids, _values, _data);
		}

		for (uint256 i = 0; i < numberOfClaims; i++) {
			_burn(_to, _ids[i], _values[i]);
		}

		emit ClaimBatch(_from, _to, topics, _ids, _values, _claimData);
	}

	/**
     * @dev See {IERC1888-getCertificate}.
     */
	function getCertificate(uint256 _id) public view override returns (address issuer, uint256 topic, bytes memory validityCall, bytes memory data) {
		require(_id <= _latestCertificateId, "Registry::getCertificate: _id out of bounds");

		Certificate memory certificate = certificateStorage[_id];
		return (certificate.issuer, certificate.topic, certificate.validityData, certificate.data);
	}

	/**
     * @dev See {IERC1888-claimedBalanceOf}.
     */
	function claimedBalanceOf(address _owner, uint256 _id) external override view returns (uint256) {
		return claimedBalances[_id][_owner];
	}

	/**
     * @dev See {IERC1888-claimedBalanceOfBatch}.
     */
	function claimedBalanceOfBatch(address[] calldata _owners, uint256[] calldata _ids) external override view returns (uint256[] memory) {
        require(_owners.length == _ids.length, "Registry::ERC1155: _owners and ids length mismatch");

        uint256[] memory batchClaimBalances = new uint256[](_owners.length);

        for (uint256 i = 0; i < _owners.length; i++) {
            batchClaimBalances[i] = this.claimedBalanceOf(_owners[i], _ids[i]);
        }

        return batchClaimBalances;
	}

	/**
     * @dev Burn certificates after they've been claimed, and increase the claimed balance.
     */
	function _burn(address _from, uint256 _id, uint256 _value) internal override {
		ERC1155._burn(_from, _id, _value);

		claimedBalances[_id][_from] = claimedBalances[_id][_from] + _value;
	}

	/**
     * @dev Validate if the certificate is valid against an external `_verifier` contract.
     */
	function _validate(address _verifier, bytes memory _validityData) internal view {
		(bool success, bytes memory result) = _verifier.staticcall(_validityData);

		require(
			success && abi.decode(result, (bool)),
			"Registry::_validate: Request/certificate invalid, please check with your issuer."
		);
	}
}
