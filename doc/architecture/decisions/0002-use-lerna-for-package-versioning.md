# 2. Use lerna for package versioning

Date: 2019-11-11

## Status

Accepted

## Context

Origin project consist of multiple packages which are the part of Origin SDK. Complex dependency graph forces us to update dependent packages manually every time dependency has changed.

## Decision

Migrate code base to monorepo structure and use `lerna` for versioning management.

## Consequences

All packages will be migrated to single GIT repository. Development will be based on that repo.