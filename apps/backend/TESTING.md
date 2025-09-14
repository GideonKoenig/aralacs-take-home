### Testing Plan

This backend exposes accounts, metrics, and transactions over HTTP with Fastify and global validation/exception handling. We will cover unit tests for pure/business logic and e2e tests for routes, validation, and error formatting.

#### Scope and priorities
- **lib/utils**: `calculateBorrowAmount`, `parseElementMaps`, `parseElementMapValue`
- **services**:
  - `TransactionsService`: filtering and mapping
  - `AccountsService`: happy path and validation error propagation
  - `MetricsService`: stored property path, fallback computation, and error propagation
- **controllers/e2e**:
  - `/transactions` list and get; query validation and 404
  - `/accounts` list, list by person, get by iban; validation and 404
  - `/metrics/people/:id/*` net-worth and borrowable; validation
- **global behaviors**:
  - ValidationPipe transformations
  - `HttpExceptionFilter` response shape

#### Test types
- Unit tests: Jest, isolate services by mocking data sources (PostgresService/GremlinService) and utils.
- E2E tests: Supertest + Nest testing module; override external providers to in-memory fakes to avoid real Postgres/Gremlin.

#### How we mock integrations
- Replace `PostgresService.get()` with an in-memory repository shim exposing `createQueryBuilder`, `getMany`, `findOne` as needed.
- Replace `GremlinService.traversal` with a minimal object exposing chainable methods used in services and returning pre-baked iterator results/arrays. For targeted assertions, we provide tiny stubs per test.

#### Coverage targets
- 90%+ statements/branches for utils and services.
- Critical controller paths (200/400/404) covered via e2e.

#### Commands
```bash
yarn test
yarn test:e2e
yarn test:cov
```

