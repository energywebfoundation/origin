# 8. Migrate certificate structure to conform to ERC-1888

Date: 2020-01-17

## Status

Accepted

## Context

Our current certificate structure is based on ERC-721 non-fungible tokens. This presents an issue when a part of a certificate's volume has to be transferred to another owner.
In cases like these, we currently "split" the certificate into 2 smaller certificates, and then transfer one of the certificates to the new owner, and leave the original certificate to the original owner - deprecating the old certificate.
This approach is not ideal, so we started looking into better ways of changing owners for smaller parts of the certificates.

## Decision

We decided to use the [ERC-1888](https://github.com/ethereum/EIPs/issues/1888) Certificate structure so that we can comply and work on standardizing Certificates.

## Consequences

We would no longer need to split certificates and lose the certificate history whenever we want to transfer a part of the certificate to a new owner.
