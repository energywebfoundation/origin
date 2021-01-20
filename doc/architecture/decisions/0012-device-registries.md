# 12. device-registries

Date: 2021-01-20

## Status

Accepted

## Context

Handling external device registries like for e.g I-REC registry become impossible due to current code and API structure.

## Decision

We took a decision to deliver separate API for Origin part and leave the external device registry part not opinionated and tailored to exact external registry requirements.

Origin Device Registry responsibilities:

-   record external device registry id and smart meter id
-   record platform enhancement content like: story, images and other information

Each External Device Registry data will be held in a separate package for e.g `@energyweb/origin-device-registry-irec-local-api` and respectively `@energyweb/origin-device-registry-irec-local-api-client` for mock version of the I-REC registry.

Since in most of the cases the External Registry is not consistent across the registries, each external registry api would require specific UI component implementation.

## Consequences

Implementing external device registry become easier and will not require change to core Origin Device Registry.
