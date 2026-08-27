# tapayoka_client

> **Git policy — never auto-commit or auto-push.** Leave your work in the working tree.
> Run `git commit`, `git push`, `gh pr create`, or `scripts/push_all.sh` **only when the user
> explicitly asks in that turn**. Approval for an earlier change does not carry forward, and
> finishing a task is not permission to commit it.

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

## Git Workflow

- Do not use feature branches for code changes. Always stay on the current branch.
