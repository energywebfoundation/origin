# Issuer

## Registry

`Registry.sol` is ERC 1888 compatible registry for certificates issued by various issuers over various topics.

## Issuers

1) `PrivateIssuer.sol` is an implementation of privacy focused issuer which hides the volume for newly created certificates until the `ERC1888` claiming event.

Migration process equals to a swap from private certificate to public certificate and is (currently) a one-way process. For certificate owner 

Issuer uses specific topic to issue:
- private certificates
- public certificates (used when migrating from private to public certificate)

2) `PublicIssuer.sol` is an implementation of public I-REC compliant issuer

### Recipes

1) Private issuance and private trading
  - issue using PrivateIssuer.requestIssue / PrivateIssuer.approveIssue
  - transfer using  PrivateIssuer.privateTransfer

2) Private issuance and public trading
  - issue using PrivateIssuer.requestIssue / PrivateIssuer.approveIssue
  - migrate to public using PrivateIssuer.migrateToPublic
  - transfer / trade public volumes

3) Public issuance and private trading
  - issue using PublicIssuer
  - deposit volume to PrivateIssuer
  - transfer using  PrivateIssuer.privateTransfer

### Technical documentation

1) Private requesting and issuance
```mermaid
graph TD;
    A(Device Owner) -->|1. Request Issue| P(PrivateIssuer.sol)
    I(I-REC) -->|2. Approve Issue| P
    P-->|3. Issue with private topic| R(Registry.sol)
```

```mermaid
sequenceDiagram
  participant U as Device Owner
  participant IS as Issuer
  participant I as Issuer Contract
  participant R as Registry Contract
  participant A as I-REC API
  participant DB as Database

  U->>+I: encodeIssue(from, to, deviceId)
  I-->>-U: (bytes)data

  U->>+I: requestIssue(data)
  I-->-U: emit IssueRequest(msg.sender, id)

  IS->>+I: getRequest(id)
  I-->-IS: RequestIssue

  IS->>+A: validate(relevant request data)
  A-->-IS: (boolean)result
  IS->>+IS: createProof(to, balance)
  IS->>+DB: storeProof()
  DB-->-IS: ok
  IS->>+I: approveIssue(to, requestId, commitment, validityData)
  Note over IS,I: commitment = rootHash of the proof
  I->>+R: issue(to, validityData, privateTopic,0, data)
  R-->-I: (uint)id
  I-->-IS: emit IssueSingle, emit CommitmentUpdated
```

2) Migrating certificate to public certificate
```mermaid
graph TD;
    A(Certificate Owner) -->|1. Request Migration| P(PrivateIssuer.sol)
    I(I-REC) -->|2. Approve Migration| P
    P-->|3. Was partially issued?|P
    P-->|4. NO: Issue with public topic and volume| R(Registry)
    P-->|5. YES: Mint volume| R(Registry)
```

```mermaid
sequenceDiagram
  participant U as Device/Certificate Owner
  participant IS as Issuer
  participant PUB as Public Issuer Contract
  participant I as Private Issuer Contract
  participant R as Registry Contract
  participant A as I-REC API
  participant DB as Database

  U->>+IS: requestProofForBalance()
  IS-->>-U: (address, value, salt, proof)
  U->>U: hash = sha3(address, value, salt)

  U->>+I: requestMigrateToPublic(id, hash)
  I-->-U: emit MigrateToPublicRequest(msg.sender, id)

  IS->>+I: getRequestMigrateToPublic(id)
  I-->-IS: RequestStateChange

  IS->>+I: migrateToPublic(id, value, salt, proof, newCommitment)
  Note over IS,I: newCommitment = private balance update
  I->>+PUB: requestIssueFor(request.owner, data)
  PUB->>-I: returns requestId
  I->>+PUB: approveIssue()
  PUB->>-I: returns id
  I-->-IS: emit PublicCertificateCreated(privateId, id)
```

Note: alternatively we define a request / approve migration from private to public. So instead of private issuer calling `mint or issue` we call public issuer "issue" function, this also means that public issuer becomes a issuer address for public certificates.

3) Claiming

Claiming is supported only by public issued certificates. Private certificates has to be migrated to public before being claimed.

```mermaid
graph TD;
  A(Device Owner) -->|1. Claim| R(Registry)
```

4) Transferring from public to private

```mermaid
graph TD;
  C(Certificate Owner)-->|1. 1155.Transfer| R(PrivateIssuer)
  R --> |2. Update commitment| R
```

5) Migrating volume to public certificate

This is a case where private certificate was migrated to public, then part of the volume was again transferred to a private certificate.

An example is where buyer buys a public certificate but wishes to perform private trading activities before final migration to public and claiming

Note: Since `PrivateIssuer` is an owner of the token (from step 4) ) it can send publicly the request part to the requesting user. Total amount of tokens locked to smart contract won't change. 

```mermaid
graph TD;
    A(Certificate Owner) -->|1. Request Migration| P(PrivateIssuer)
    I(I-REC) -->|2. Approve Migration| P
    P-->|3. Transfer from P to requesting address| R(Registry)
    P-->|4. Update commitment|P
```

Note: alternatively we can implement it as burn/mint flow. Tokens deposited to PrivateIssuer contract will be burnt immediately. Then transfer from private to public will use `Migrating certificate to public certificate` flow.

6) Private transfers

This is a case where volume can be transferred privately inside the private registry. 

As an example, this can be used to transfer given volume to exchange or other account.

```mermaid
graph TD;
    A(Certificate Owner) -->|1. Request private transfer| X(API)
    A(Certificate Owner) -->|2. Request Private transfer| P(PrivateIssuer)
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

  IS->>+I: getRequestPrivateTransfer(id)
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