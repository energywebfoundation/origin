# 9. Use a more complete database type and adjust migrations

Date: 2020-04-02

## Status

Accepted

## Context

So far, Origin has been using a development-friendly SQLite database on the backend to store data. While this has been beneficial in the early stages of development, in order to gain adoption and real-world use we should make it easier for anyone using the Origin SDK to get to production as fast as possible.

## Decision

A decision has been made to move the Origin SDK to a mode production-ready database. We've decided to go with **PostgreSQL** instead of SQLite, as we've seen that this is the database of choice for many users and setups.

## Consequences

### Easier production-readiness
This will remove some unnecessary steps to enable production usage of Origin for users that plan on using the Origin SDK in production.

### More complex initial setup
Some changes will be needed in the way the development environment is set up. The user will have to install the PostgreSQL database on their local machine when developing.

### Change in @energyweb/migrations
Migations should be adjusted to be migrated directly to the database itself, without using the APIs to seed the database.