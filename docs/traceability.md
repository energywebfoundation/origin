# Traceability SDK

Traceability SDK is responsible for tracking (tracing) the exchange of Energy Attribute Certificates (EACs).

The main functions that the Traceability SDK deals with are:

1. Issuance
2. Transfer
3. Claiming / Redemption

## Components overview

### Layers

```mermaid
graph RL
    classDef subgraphClass fill:#ffffde,color: black

    subgraph Traceability
        issuer("@energyweb/issuer")
        issuer-api("@energyweb/issuer-api")
        ewc(Energy Web Chain)

        style ewc fill:#a566ff,stroke:#333,stroke-width:4px

        issuer-api --> issuer

        subgraph apiLayer[API Layer]
        issuer-api
        end

        subgraph blockchainLayer[Blockchain Layer]
        issuer --> ewc
        end

        class apiLayer,blockchainLayer subgraphClass;
    end

```

### @energyweb/issuer

Package contains all the facades and entities that concern the on-chain presence of Certificates and Certification Requesting.

```mermaid
graph RL
    classDef descClass fill:#ffffde,color: black,stroke: #333

    cert(Certificates)
    certReq(Certification Requests)

    certDesc[EAC that can be transferred and claimed]
    certReqDesc[Handles the flow of requesting and approving EAC issuances]

    subgraph Issuer
    cert
    certReq
    end

    certDesc --- cert
    certReqDesc --- certReq

    class certDesc,certReqDesc descClass;
```
