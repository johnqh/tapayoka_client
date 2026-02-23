# tapayoka_client

React client library for Tapayoka API with TanStack Query hooks.

## Package: `@sudobility/tapayoka_client` (restricted)

## Hooks

| Hook | Purpose | Role |
|------|---------|------|
| useDevices | Device CRUD | Vendor |
| useServices | Service CRUD | Vendor |
| useOrders | Order management | Both |
| useAuthorizations | Authorization create/get | Buyer |
| useBuyerDevices | Device verification | Buyer |
| useAnalytics | Dashboard stats | Vendor |
| useQr | QR code generation | Vendor |
| useEntities | Entity management | Vendor |

## Hook Pattern

```typescript
const { data, isLoading, error, refresh, clearError } = useHook(
  networkClient, baseUrl, entitySlug, token, options
);
```

## Commands

```bash
bun run build       # Build to dist/
bun run typecheck   # Type check
bun run lint        # ESLint
bun run test        # Vitest
```

## Peer Dependencies

- @sudobility/tapayoka_types, @sudobility/types
- @tanstack/react-query >=5, react >=18
