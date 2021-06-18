## `Issuer`

Used to manage the request/approve workflow for issuing ERC-1888 certificates.




### `initialize(uint256 _certificateTopic, address _registry)` (public)

Contructor.


Uses the OpenZeppelin `initializer` for upgradeability.
`_registry` cannot be the zero address.

### `setPrivateIssuer(address _privateIssuer)` (public)

Attaches a private issuance contract to this issuance contract.


`_privateIssuer` cannot be the zero address.

### `getCertificationRequest(uint256 _requestId) → struct Issuer.CertificationRequest` (public)





### `requestCertificationFor(bytes _data, address _owner) → uint256` (public)





### `requestCertificationForBatch(bytes[] _data, address[] _owners) → uint256[]` (public)





### `requestCertification(bytes _data) → uint256` (external)





### `revokeRequest(uint256 _requestId)` (external)





### `revokeCertificate(uint256 _certificateId)` (external)





### `approveCertificationRequest(uint256 _requestId, uint256 _value) → uint256` (public)





### `approveCertificationRequestBatch(uint256[] _requestIds, uint256[] _values) → uint256[]` (public)





### `issue(address _to, uint256 _value, bytes _data) → uint256` (public)

Directly issue a certificate without going through the request/approve procedure manually.



### `issueBatch(address[] _to, uint256[] _values, bytes[] _data) → uint256[]` (public)

Directly issue a batch of certificates without going through the request/approve procedure manually.



### `isRequestValid(uint256 _requestId) → bool` (external)

Validation for certification requests.


Used by other contracts to validate the token.
`_requestId` has to be an existing ID.

### `getRegistryAddress() → address` (external)





### `getPrivateIssuerAddress() → address` (external)





### `version() → string` (external)





### `_requestNotApprovedOrRevoked(uint256 _requestId) → bool` (internal)





### `_authorizeUpgrade(address)` (internal)

Needed for OpenZeppelin contract upgradeability.


Allow only to the owner of the contract.


### `CertificationRequested(address _owner, uint256 _id)`





### `CertificationRequestedBatch(address[] _owners, uint256[] _id)`





### `CertificationRequestApproved(address _owner, uint256 _id, uint256 _certificateId)`





### `CertificationRequestBatchApproved(address[] _owners, uint256[] _ids, uint256[] _certificateIds)`





### `CertificationRequestRevoked(address _owner, uint256 _id)`





### `CertificateRevoked(uint256 _certificateId)`





