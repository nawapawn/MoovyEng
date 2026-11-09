# Architecture Notes

<!-- Keep this document short and factual. Record decisions, not guesses. -->

## System Boundaries and Entry Points

- Primary components and services:
- Module boundaries and entry points:
- External systems and third-party APIs:
- Data ownership and storage engines:
- Critical public interfaces and contracts:

## Invariants, Constraints, and Security Rules

- Tenancy & Authorization: Tenant isolation enforced on all queries; RBAC/ABAC at route layer.
- Data Protection & PII: Zero logging of plaintext secrets, tokens, passwords, or PII.
- Failure Modes & Resilience: Timeouts on external I/O, circuit breakers, and exponential backoff retry.
- Database Safety: Zero-downtime expand/contract schema evolution; no blocking exclusive locks.

## Architecture Decisions

| Decision | Context | Trade-off | Consequence | Date |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

## Production Readiness Checklist

- [ ] Health probes: Liveness (`/healthz`) and Readiness (`/readyz`) implemented separately.
- [ ] Graceful shutdown: Cleanly drains connections on SIGTERM/SIGINT before exit.
- [ ] Structured JSON logging with trace/request correlation ID.
- [ ] Reversible database migrations with tested rollback scripts.
- [ ] OWASP Top 10 security audit verified with negative test cases.

## Change Guidance

- Update this document when a change affects boundaries, data flow, public contracts, scale assumptions, or operational behavior.
- Do not fill unknown facts by guessing; mark them as `Unknown` and verify them from the repository or owner.
