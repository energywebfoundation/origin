# EnergyWeb Issuer

## Registry

`Registry.sol` is ERC 1888 compatible registry for certificates issued by various issuers over various topics.

## Issuer

`Issuer.sol` is an implementation of an I-REC compliant issuer which has the option to hide the volume for newly created certificates.

### Recipes

1) Private issuance and private trading
  - issue using `requestIssuance()` with the `isPrivate` flag set to `true`
  - transfer using `approvePrivateTransfer()`

2) Private issuance and public trading
  - issue using `requestIssuance()` with the `isPrivate` flag set to `true`
  - migrate to public using `migrateToPublic()`
  - transfer / trade public volumes

### Technical documentation

1) Private requesting and issuance

```mermaid
graph TD;
    A(Device Owner) -->|1. Request Private Issuance| P(Issuer.sol)
    I(I-REC) -->|2. Approve Issuance| P
    P-->|3. Issue with volume set to 0| R(Registry.sol)
```

```mermaid
sequenceDiagram
  participant U as Device Owner
  participant IS as Issuer
  participant I as Issuer Contract
  participant R as Registry Contract
  participant A as I-REC API
  participant DB as Database

  U->>+I: encodeData(from, to, deviceId)
  I-->>-U: (bytes)data

  U->>+I: requestIssuance(data)
  I-->-U: emit NewIssuanceRequest(msg.sender, id)

  IS->>+I: getIssuanceRequest(id)
  I-->-IS: IssuanceRequest

  IS->>+A: validate(relevant request data)
  A-->-IS: (boolean)result
  IS->>+IS: createProof(to, balance)
  IS->>+DB: storeProof()
  DB-->-IS: ok
  IS->>+I: approveIssuancePrivate(to, requestId, commitment, validityData)
  Note over IS,I: commitment = rootHash of the proof
  I->>+R: issue(to, validityData, privateTopic,0, data)
  R-->-I: (uint)id
  I-->-IS: emit CommitmentUpdated
```

---
2) Migrating certificate to public certificate

```mermaid
graph TD;
    A(Certificate Owner) -->|1. Request Migration| P(Issuer.sol)
    I(I-REC) -->|2. Approve Migration| P
    P-->|3. Was already migrated?|P
    P-->|6. Mint volume from private commitment to public value |R(Registry)
```

```mermaid
sequenceDiagram
  participant U as Device/Certificate Owner
  participant IS as Issuer
  participant I as Issuer Contract
  participant R as Registry Contract
  participant A as I-REC API
  participant DB as Database

  U->>+IS: requestProofForBalance()
  IS-->>-U: (address, value, salt, proof)
  U->>U: hash = sha3(address, value, salt)

  U->>+I: requestMigrateToPublic(id, hash)
  I-->-U: emit MigrateToPublicRequest(msg.sender, id)

  IS->>+I: getIssuanceRequestMigrateToPublic(id)
  I-->-IS: RequestStateChange

  IS->>+I: migrateToPublic(id, value, salt, proof, newCommitment)
  I-->-IS: emit CertificateMigratedToPublic(id)
```

---
3) Claiming

Claiming is supported only by public issued certificates. Private certificates have to be migrated to public before being claimed.

```mermaid
graph TD;
  A(Device Owner) -->|1. Claim| R(Registry)
```

---
4) Private transfers

This is a case where volume can be transferred privately inside the private registry. 

As an example, this can be used to transfer given volume to exchange or other account.

```mermaid
graph TD;
    A(Certificate Owner) -->|1. Request private transfer| X(API)
    A(Certificate Owner) -->|2. Request Private transfer| P(Issuer)
    I(I-REC) -->|2. Approve| P
    P-->|3. Validate new commitment| P
    P-->|4. Update commitment|P
```

```mermaid
sequenceDiagram
  participant U as Device/Certificate Owner
  participant IS as Issuer
  participant I as Issuer Contract
  participant R as Registry Contract
  participant A as I-REC API
  participant DB as Database

  U->>+IS: requestPrivateTransfer(id, value, newOwner)
  IS->>DB: store updated proof tree, linked to requested 
  IS-->>-U: (address, value, salt, proof)
  Note over IS,U: address = sender address, value = remaining balance
  U->>U: hash = sha3(address, value, salt)

  U->>+I: requestPrivateTransfer(id, hash)
  I-->-U: emit PrivateTransferRequest(msg.sender, id)

  IS->>+I: getIssuanceRequestPrivateTransfer(id)
  I-->-IS: RequestStateChange

  IS->>+I: privateTransfer(requestId, proof, prevCommitment, newCommitment)
  Note over IS,I: newCommitment = private balance update
  I->>I: updateCommitment(id, prevCommitment, newCommitment)
  I-->-IS: emit CommitmentUpdated
```

Notes:
`prevCommitment` is required to prevent state corruption, transition to new commitment based on other state that's currently on-chain will result in error.

Implementation:
- Certificate owner A has 1000kWh of energy on certificate id = 1 (C1)
- A requesting private transfer of 500kWh from C1 to B
  - A calls API with (id, value, newOwner) in our case (1, 500000, B)
  - if API approves the transfer (enough balance, maybe other API checks)
    - API returns (updatedBalanceOfA, salt) in our case (500000, 'randomsalt')
    - A creates onChain request where hash = hash(address, updatedBalanceOfA, salt) in our case hash(A, 5000000, salt)
    - Issuer - approves by sending new commitment that is verified against the request.hash 