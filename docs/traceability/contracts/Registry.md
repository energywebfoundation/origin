## `Registry`

Also complies to ERC-1155: https://eips.ethereum.org/EIPS/eip-1155.
\*\* Data set to 0 because there is no meaningful check yet to be done on the data

### `constructor(string _uri)` (public)

### `issue(address _to, bytes _validityData, uint256 _topic, uint256 _value, bytes _data) → uint256 id` (external)

See {IERC1888-issue}.

`_to` cannot be the zero address.

### `batchIssue(address _to, bytes[] _validityData, uint256[] _topics, uint256[] _values, bytes[] _data) → uint256[] ids` (external)

See {IERC1888-batchIssue}.

`_to` cannot be the zero address.
`_data`, `_values` and `_validityData` must have the same length.

### `batchIssueMultiple(address[] _to, bytes[] _validityData, uint256[] _topics, uint256[] _values, bytes[] _data) → uint256[] ids` (external)

Similar to {IERC1888-batchIssue}, but not a part of the ERC-1888 standard.

Allows batch issuing to an array of \_to addresses.
`_to` cannot be the zero addresses.
`_to`, `_data`, `_values`, `_topics` and `_validityData` must have the same length.

### `mint(uint256 _id, address _to, uint256 _quantity)` (external)

Allows the issuer to mint more fungible tokens for existing ERC-188 certificates.

Allows batch issuing to an array of \_to addresses.
`_to` cannot be the zero address.

### `safeTransferAndClaimFrom(address _from, address _to, uint256 _id, uint256 _value, bytes _data, bytes _claimData)` (external)

See {IERC1888-safeTransferAndClaimFrom}.

`_to` cannot be the zero address.
`_from` has to have a balance above or equal `_value`.

### `safeBatchTransferAndClaimFrom(address _from, address _to, uint256[] _ids, uint256[] _values, bytes _data, bytes[] _claimData)` (external)

See {IERC1888-safeBatchTransferAndClaimFrom}.

`_to` and `_from` cannot be the zero addresses.
`_from` has to have a balance above 0.

### `getCertificate(uint256 _id) → address issuer, uint256 topic, bytes validityCall, bytes data` (public)

See {IERC1888-getCertificate}.

### `claimedBalanceOf(address _owner, uint256 _id) → uint256` (external)

See {IERC1888-claimedBalanceOf}.

### `claimedBalanceOfBatch(address[] _owners, uint256[] _ids) → uint256[]` (external)

See {IERC1888-claimedBalanceOfBatch}.

### `_burn(address _from, uint256 _id, uint256 _value)` (internal)

Burn certificates after they've been claimed, and increase the claimed balance.

### `_validate(address _verifier, bytes _validityData)` (internal)

Validate if the certificate is valid against an external `_verifier` contract.
