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
    P-->|3. Issue with public topic and volume| R(Registry)
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

Note: Since `PrivateIssuer` is an owner of the token (from step 4) ) it can send publicly the request part to the requesting user. Total amount of 

```mermaid
graph TD;
    A(Certificate Owner) -->|1. Request Migration| P(PrivateIssuer)
    I(I-REC) -->|2. Approve Migration| P
    P-->|3. Transfer from P to requesting address| R(Registry)
    P-->|4. Update commitment|P
```
