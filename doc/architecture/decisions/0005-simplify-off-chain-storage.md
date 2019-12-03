# 5. Simplify off-chain storage

Date: 2019-12-03

## Status

Accepted

## Context

Storing data in hybrid storage (off-chain and on-chain) presented problems with data inconsistency when some data was written off-chain but it's on-chain reference hasn't been committed yet. This would cause some data being corrupted under certain conditions.

## Decision

We decided to store off-chain data in a way which doesn't reference the ID of any of the entities, but purely stores the precise proof data under the hash of the off-chain data.

## Consequences

Implementing this approach has led us to store all historical off-chain data for the purposes, but has fixed data corruption issues that have plagued the previous approach.
