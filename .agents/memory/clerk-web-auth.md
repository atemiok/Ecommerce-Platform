---
name: Clerk web authentication transport
description: Browser-side Clerk authentication for this monorepo uses same-origin session cookies with the Express middleware.
---

Use Clerk's browser session cookie for web API requests; do not add bearer-token plumbing to the React client. Protected API endpoints should read the session through the server middleware and apply authorization separately.

**Why:** The managed Clerk setup owns browser session transport, while explicit token handling is intended for mobile clients without a browser cookie jar.

**How to apply:** When adding protected web routes or admin actions, verify middleware ordering and authorization guards first; only configure an admin allowlist or role policy on top of the authenticated session.