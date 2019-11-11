# 3. create backend client lib

Date: 2019-11-11

## Status

Accepted

## Context

Off-chain data is accessible via REST API. Currently all system components uses direct REST calls in various places making unit test hard.

## Decision

Create client library and use it as dependency in components that want to read the off-chain data. Include the mocked version of the service so unit-tests does not have to rely on the implementation.

## Consequences

Client will be added as separate package, tests will utilise mocked version.

