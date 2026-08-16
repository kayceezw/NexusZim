# NexusZim — Move `nexuszim.co.zw` to Cloudflare (simple path)

**Context:** No email in use and no site worth keeping on the domain today. So this is a simple
DNS move, not a delicate migration. Goal: get the Cloudflare Worker (`nexuszim`, already deployed
at `nexuszim.nexuszim.workers.dev`) serving `www.nexuszim.co.zw` + apex.

> App auth emails (Supabase signup/reset) are sent by Supabase, not from `@nexuszim.co.zw`, so
> they're unaffected by this move. The only thing NS change touches is `@nexuszim.co.zw` mail,
> which isn't in use.

---

## Steps

### 1. Add the domain to Cloudflare  *(you)*
- Cloudflare dashboard → **Add a site** → `nexuszim.co.zw` → **Free** plan.
- Cloudflare auto-scans and imports the existing DNS records. You can leave them or delete the old
  LiteSpeed/mail records (`74.50.89.41`, `mail/smtp/pop/ftp`) — they're unused. Not required now.

### 2. Grab your assigned nameservers  *(you)*
After adding the site, Cloudflare shows **two nameservers unique to your account**, e.g.:
```
xxxx.ns.cloudflare.com
yyyy.ns.cloudflare.com
```
They look like first-name hostnames (e.g. `dana.ns.cloudflare.com`, `rob.ns.cloudflare.com`).
Copy the exact two Cloudflare shows you — those are the values for the registrar.

### 3. Change nameservers at the registrar  *(you)*
Where the domain is registered (or Vertico's registrar panel), replace:
```
ns1.vertico.one, ns2.vertico.one
```
with the two Cloudflare nameservers from Step 2. Save.
Cloudflare emails you "**Active**" once propagated (minutes–~1h).

### 4. Bind the worker to the domain  *(me — in this repo)*
Once the zone is Active on Cloudflare, I:
- add `custom_domain` routes to `wrangler.jsonc`:
  ```jsonc
  "routes": [
    { "pattern": "www.nexuszim.co.zw", "custom_domain": true },
    { "pattern": "nexuszim.co.zw",     "custom_domain": true }
  ]
  ```
- `bun run build` → `npx wrangler deploy` (Cloudflare auto-issues the TLS cert).
- verify `https://www.nexuszim.co.zw/` + apex serve the new UI with a valid cert and dark mode.

### 5. Optional polish  *(me)*
- Redirect apex → www (or vice-versa) via a Cloudflare Redirect Rule.
- Confirm HTTPS + www/apex both resolve to the worker.

---

## Rollback
Switch the registrar nameservers back to `ns1/ns2.vertico.one`. Reverts within DNS propagation
time. Nothing is deleted at Vertico.

## Hand-off
- **You:** Steps 1–3 (add to Cloudflare, get NS, change NS at registrar).
- **Me:** Step 4–5 (bind worker, deploy, verify) — ping me when Cloudflare says the zone is Active.
