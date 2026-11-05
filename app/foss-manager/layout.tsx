import type { ReactNode } from 'react';

// The admin CSP uses a per-request nonce. The nonce is only available during
// dynamic rendering, so keep this requirement scoped to the admin routes.
export const dynamic = 'force-dynamic';

export default function FossManagerLayout({ children }: { children: ReactNode }) {
    return children;
}
