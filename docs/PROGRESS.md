# Frontend Progress

For the complete cross-repository progress record, see:

```text
../multigym_back/docs/PROGRESS.md
```

## Latest Deployment

- Commit: `d224b7e`
- Feature: tenant branch management UI.
- Staging frontend container: healthy.
- Staging web endpoint: HTTP 200.

## Branch Management UI

Implemented in `src/features/admin/pages/Branches.tsx`:

- List branches and status.
- Create branch.
- Edit branch.
- Activate/deactivate branch.
- Delete branch with confirmation.
- Protect the main `Matriz` branch from destructive actions.

API functions are in `src/lib/api.ts`.

## Validation

```bash
npm run build
```

The production build passed after the implementation.

## Mercado Pago Descriptor

Tenant admins can configure the order payment name from the Mercado Pago settings page. The value is limited to 13 characters; an empty value falls back to the registered gym name. SaaS renewal descriptor configuration remains a Platform setting.

Checkout now requests the buyer surname and loads Mercado Pago's device fingerprint script before submitting a card payment.
