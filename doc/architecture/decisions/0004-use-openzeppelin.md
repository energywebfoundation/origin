# 4. Use OpenZeppelin

Date: 2019-11-11

## Status

Accepted

## Context

Origin SDK contracts are designed to be upgradable by abstracting proxy, logic and storage to separate contracts. This approach leads to maintaining 3 separate Solidity files per contract.

## Decision

Use OpenZeppelin implementation based on generalized proxy, logic and storage to remove the need of keeping 3 separate custom implemented contracts.

## Consequences

Improves security by delegating part of the functionality to community standard libraries. Allows us to use OpenZeppelin cli tools for deployment and migrations.
