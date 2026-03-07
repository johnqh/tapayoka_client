# @sudobility/tapayoka_client

React client library for the Tapayoka API with TanStack Query hooks.

## Installation

```bash
bun add @sudobility/tapayoka_client
```

## Usage

```typescript
import { useDevices, useOrders, useBuyerDevices } from '@sudobility/tapayoka_client';

const { data, isLoading, error, refresh, clearError } = useDevices(
  networkClient, baseUrl, entitySlug, token
);
```

## Hooks

| Hook | Purpose | Role |
|------|---------|------|
| `useDevices` | Device CRUD | Vendor |
| `useServices` | Service CRUD | Vendor |
| `useOrders` | Order management | Both |
| `useAuthorizations` | Authorization create/get | Buyer |
| `useBuyerDevices` | Device verification | Buyer |
| `useAnalytics` | Dashboard stats | Vendor |
| `useQr` | QR code generation | Vendor |
| `useEntities` | Entity management | Vendor |

## Development

```bash
bun run build        # Build to dist/
bun run test         # Run Vitest
bun run typecheck    # TypeScript check
bun run lint         # ESLint
```

## Related Packages

- `@sudobility/tapayoka_types` -- Type definitions (peer dependency)
- `@sudobility/tapayoka_lib` -- Zustand stores wrapping these hooks
- `tapayoka_vendor_app` / `tapayoka_buyer_app_rn` -- Consumer apps

## License

BUSL-1.1
