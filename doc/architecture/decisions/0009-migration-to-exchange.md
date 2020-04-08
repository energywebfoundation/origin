# 9. migration to exchange

Date: 2020-04-02

## Status

Accepted

## Context

Current on-chain approach to handle demands and certificates matching is not scalable enough, prone to front-running and hard to extend with new features.

## Decision

The change provides a new way of trading/matching certificates using off-chain order book matching engine.

## Consequences

-   Demands are now private, there is no on-chain components for that.
-   New off-chain matching engine provides superior throughput and extensibility
-   Transition to order-book makes the matching much easier to reason about
-   Makes the buyer on-boarding easier, as in some cases they don't even to interact with blockchain

End of the active development for packages:

-   market-matcher
-   market-matcher-core
-   market
