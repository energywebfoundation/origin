// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.4;

import "./Registry.sol";

/// @title Extension of the Transferable Certificate standard ERC-1888.
contract RegistryExtended is Registry {

    event TransferBatchMultiple(address indexed operator, address[] from, address[] to, uint256[] ids, uint256[] values);
    event ClaimBatchMultiple(address[] _claimIssuer, address[] _claimSubject, uint256[] indexed _topics, uint256[] _ids, uint256[] _values, bytes[] _claimData);

	constructor(string memory _uri) Registry(_uri) {
		// Trigger Registry constructor
	}

	/// @notice Similar to {IERC1888-batchIssue}, but not a part of the ERC-1888 standard.
    /// @dev Allows batch issuing to an array of _to addresses.
    /// @dev `_to` cannot be the zero addresses.
    /// @dev `_to`, `_data`, `_values`, `_topics` and `_validityData` must have the same length.
	function batchIssueMultiple(address[] calldata _to, bytes[] calldata _validityData, uint256[] calldata _topics, uint256[] calldata _values, bytes[] calldata _data) external returns (uint256[] memory ids) {
        require(_values.length > 0, "no values specified");

		require(_to.length == _data.length, "Arrays not same length");
		require(_data.length == _values.length, "Arrays not same length");
		require(_values.length == _validityData.length, "Arrays not same length");
		require(_validityData.length == _topics.length, "Arrays not same length");

		ids = new uint256[](_values.length);

		address operator = _msgSender();

		for (uint256 i = 0; i < _values.length; i++) {
			require(_to[i] != address(0x0), "_to must be non-zero.");
			ids[i] = i + _latestCertificateId + 1;
			_validate(operator, _validityData[i]);
		}
			
		for (uint256 i = 0; i < ids.length; i++) {
			ERC1155._mint(_to[i], ids[i], _values[i], _data[i]); // Check **

			certificateStorage[ids[i]] = Certificate({
				topic: _topics[i],
				issuer: operator,
				validityData: _validityData[i],
				data: _data[i]
			});
		}

		_latestCertificateId = ids[ids.length - 1];

		emit IssuanceBatch(operator, _topics, ids, _values);
	}

	/// @notice Similar to {ERC1155-safeBatchTransferFrom}, but not a part of the ERC-1155 standard.
    /// @dev Allows batch transferring to/from an array of addresses.
    function safeBatchTransferFromMultiple(
        address[] calldata _from,
        address[] calldata _to,
        uint256[] calldata _ids,
        uint256[] calldata _values,
        bytes[] calldata _data
    ) external {
        require(_from.length == _to.length, "Arrays not same length");
        require(_to.length == _ids.length, "Arrays not same length");
        require(_ids.length == _values.length, "Arrays not same length");
		require(_values.length == _data.length, "Arrays not same length.");

		for (uint256 i = 0; i < _ids.length; i++) {
            require(_from[i] != address(0x0), "_from must be non-zero.");
            require(_to[i] != address(0x0), "_to must be non-zero.");
            require(_from[i] == _msgSender() || ERC1155.isApprovedForAll(_from[i], _msgSender()), "No operator approval");
			require(ERC1155.balanceOf(_from[i], _ids[i]) >= _values[i], "Not enough balance to transfer");

            Certificate memory cert = certificateStorage[_ids[i]];

			_validate(cert.issuer,  cert.validityData);
		}

        address operator = _msgSender();

        for (uint256 i = 0; i < _ids.length; ++i) {
            _safeTransferFrom(_from[i], _to[i], _ids[i], _values[i], _data[i]);
        }

        emit TransferBatchMultiple(operator, _from, _to, _ids, _values);
    }

	/// @notice Similar to {IERC1888-safeBatchTransferAndClaimFrom}, but not a part of the ERC-1888 standard.
	/// @dev Allows batch claiming to/from an array of addresses.
	function safeBatchTransferAndClaimFromMultiple(
		address[] calldata _from,
		address[] calldata _to,
		uint256[] calldata _ids,
		uint256[] calldata _values,
		bytes[] calldata _data,
		bytes[] calldata _claimData
	) external {
        require(_ids.length > 0, "no certificates specified");

        require(_from.length == _to.length, "Arrays not same length");
        require(_to.length == _ids.length, "Arrays not same length");
        require(_ids.length == _values.length, "Arrays not same length");
		require(_values.length == _data.length, "Arrays not same length.");
		require(_data.length == _claimData.length, "Arrays not same length.");

		uint256[] memory topics = new uint256[](_ids.length);

		for (uint256 i = 0; i < _ids.length; i++) {
            require(_from[i] != address(0x0), "_from must be non-zero.");
            require(_to[i] != address(0x0), "_to must be non-zero.");
            require(_from[i] == _msgSender() || ERC1155.isApprovedForAll(_from[i], _msgSender()), "No operator approval");
			require(ERC1155.balanceOf(_from[i], _ids[i]) >= _values[i], "Not enough balance to claim");

            Certificate memory cert = certificateStorage[_ids[i]];

			_validate(cert.issuer,  cert.validityData);
		}

		for (uint256 i = 0; i < _ids.length; i++) {
			Certificate memory cert = certificateStorage[_ids[i]];
			topics[i] = cert.topic;

            safeTransferFrom(_from[i], _to[i], _ids[i], _values[i], _data[i]);

			_burn(_to[i], _ids[i], _values[i]);
		}

		emit ClaimBatchMultiple(_from, _to, topics, _ids, _values, _claimData);
	}
}
