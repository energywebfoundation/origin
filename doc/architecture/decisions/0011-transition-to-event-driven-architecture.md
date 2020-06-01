# 11. transition-to-event-driven-architecture

Date: 2020-06-01

## Status

Accepted

## Context

Origin as an open-source platform should stay open for custom modules. This should not come with a cost of forking core projects but should be allowed from the topmost application layer.

A good example is features like WebSockets, reporting services, or analytics. While this is not a core concern of the Origin domain, it is definitely important from the operations point of view. Additionally, given the number of specialized solutions, it is virtually impossible for Origin to provide solutions for them.

## Decision

We decided to start the transition to event-based architecture for core components. Currently leveraging `@nestjs/cqrs` component of Nest.JS framework for Event emitting and handling parts.

This approach allows developers to create custom event handlers and provide them in the runner projects for e.g @energyweb/origin-backend-app.

## Consequences

As a consequence, the Origin platform becomes open for additional modules that can listen to core events.
