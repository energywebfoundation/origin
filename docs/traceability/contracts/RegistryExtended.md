## `RegistryExtended`






### `constructor(string _uri)` (public)





### `batchIssueMultiple(address[] _to, bytes[] _validityData, uint256[] _topics, uint256[] _values, bytes[] _data) → uint256[] ids` (external)

Similar to {IERC1888-batchIssue}, but not a part of the ERC-1888 standard.


Allows batch issuing to an array of _to addresses.
`_to` cannot be the zero addresses.
`_to`, `_data`, `_values`, `_topics` and `_validityData` must have the same length.

### `safeBatchTransferFromMultiple(address[] _from, address[] _to, uint256[] _ids, uint256[] _values, bytes[] _data)` (external)





### `safeBatchTransferAndClaimFromMultiple(address[] _from, address[] _to, uint256[] _ids, uint256[] _values, bytes[] _data, bytes[] _claimData)` (external)

See {IERC1888-safeBatchTransferAndClaimFrom}.


`_to` and `_from` cannot be the zero addresses.
`_from` has to have a balance above 0.


### `TransferBatchMultiple(address operator, address[] from, address[] to, uint256[] ids, uint256[] values)`





### `ClaimBatchMultiple(address[] _claimIssuer, address[] _claimSubject, uint256[] _topics, uint256[] _ids, uint256[] _values, bytes[] _claimData)`





