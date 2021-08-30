## `PrivateIssuer`

A privately issued certificate can later be migrated to be public.

Private certificate issuance differ from the public ones in a way that the fungible volumes that are being transferred/claimed are stored off-chain.



### `initialize(address _issuer)` (public)

Constructor.


Uses the OpenZeppelin `initializer` for upgradeability.
`_issuer` cannot be the zero address.

### `getCertificateCommitment(uint256 certificateId) → bytes32` (public)

Get the commitment (proof) for a specific certificate.



### `approveCertificationRequestPrivate(uint256 _requestId, bytes32 _commitment) → uint256` (public)





### `issuePrivate(address _to, bytes32 _commitment, bytes _data) → uint256` (public)

Directly issue a private certificate.



### `requestPrivateTransfer(uint256 _certificateId, bytes32 _ownerAddressLeafHash)` (external)

Request transferring a certain amount of tokens.




### `approvePrivateTransfer(uint256 _certificateId, struct PrivateIssuer.Proof[] _proof, bytes32 _previousCommitment, bytes32 _commitment) → bool` (external)

Approve a private transfer of certificates.



### `requestMigrateToPublic(uint256 _certificateId, bytes32 _ownerAddressLeafHash) → uint256 _migrationRequestId` (external)

Request the certificate volumes to be migrated from private to public.




### `requestMigrateToPublicFor(uint256 _certificateId, bytes32 _ownerAddressLeafHash, address _forAddress) → uint256 _migrationRequestId` (external)

Request the certificate volumes to be migrated from private to public for someone else.




### `getPrivateTransferRequest(uint256 _certificateId) → struct PrivateIssuer.PrivateTransferRequest` (external)

Get the private transfer request that is currently active for a specific certificate.



### `getMigrationRequest(uint256 _requestId) → struct PrivateIssuer.RequestStateChange` (external)

Get the migration request.



### `getMigrationRequestId(uint256 _certificateId) → uint256 _migrationRequestId` (external)

Get the migration request ID for a specific certificate.



### `migrateToPublic(uint256 _requestId, uint256 _volume, string _salt, struct PrivateIssuer.Proof[] _proof)` (external)

Migrate a private certificate to be public.




### `_authorizeUpgrade(address)` (internal)





### `getIssuerAddress() → address` (external)





### `version() → string` (external)






### `PrivateCertificationRequestApproved(address _owner, uint256 _id, uint256 _certificateId)`





### `CommitmentUpdated(address _owner, uint256 _id, bytes32 _commitment)`





### `MigrateToPublicRequested(address _owner, uint256 _id)`





### `PrivateTransferRequested(address _owner, uint256 _certificateId)`





### `CertificateMigratedToPublic(uint256 _certificateId, address _owner, uint256 _amount)`





