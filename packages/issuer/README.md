# Issuer

## Registry

`Registry.sol` is ERC 1888 compatible registry for certificates issued by various issuers over various topics.

## Issuers

`PrivateIssuer.sol` is an implementation of privacy focused issuer which hides the volume for newly created certificates until the `ERC1888` claiming event.

Migration process equals to a swap from private certificate to public certificate and is (currently) a one-way process. For certificate owner 

Issuer uses specific topic to issue:
- private certificates
- public certificates (used when migrating from private to public certificate)


### Examples

1) Requesting and issuance
```mermaid
graph TD;
    A(Device Owner) -->|1. Request Issue| P(PrivateIssuer.sol)
    I(I-REC) -->|2. Approve Issue| P
    P-->|3. Issue with private topic| R(Registry.sol)
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

Implementation:
- Certificate owner A has 1000kWh of energy on certificate id = 1 (C1)
- A requesting private transfer of 500kWh from C1 to B
  - A calls API with (id, value, newOwner) in our case (1, 500000, B)
  - if API approves the transfer (enough balance, maybe other API checks)
    - API returns (updatedBalanceOfA, salt) in our case (500000, 'randomsalt')
    - A creates onChain request where hash = hash(address, updatedBalanceOfA, salt) in our case hash(A, 5000000, salt)
    - Issuer - approves by sending new commitment that is verified against the request.hash 