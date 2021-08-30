# Traceability SDK

Traceability SDK is responsible for tracking (tracing) the exchange of Energy Attribute Certificates (EACs).

The main functions that the Traceability SDK deals with are:

1. Issuance
2. Transfer
3. Claiming / Redemption

## Components overview

### Layers

![Traceability](images/traceability.png)

### @energyweb/issuer

Package contains all the facades and entities that concern the on-chain presence of Certificates and Certification Requesting.

![@energyweb/issuer](images/issuer.png)

### Smart contracts

-   [ERC-1888](traceability/contracts/ERC1888/ERC1888.md)
-   [Registry](traceability/contracts/Registry.md)
-   [Issuer](traceability/contracts/Issuer.md)
-   [PrivateIssuer](traceability/contracts/PrivateIssuer.md)
