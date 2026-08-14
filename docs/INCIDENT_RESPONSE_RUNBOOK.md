# ResumeNova — Incident Response Runbook

**Purpose:** Incident severity classification, escalation paths, containment protocols, and post-mortem procedures.

---

## 1. Severity Classification

| Severity Level       | Definition                                                | Response SLA | Examples                                                  |
| -------------------- | --------------------------------------------------------- | ------------ | --------------------------------------------------------- |
| **SEV-1 (Critical)** | Core service completely unavailable or severe data breach | 15 Minutes   | Total site outage, user data leak, database corruption    |
| **SEV-2 (High)**     | Major subsystem degraded with no immediate workaround     | 1 Hour       | AI generations completely failing, export engine broken   |
| **SEV-3 (Medium)**   | Non-critical functionality degraded or cosmetic defects   | 4 Hours      | Notification delivery delays, Bangla font alignment issue |
| **SEV-4 (Low)**      | Minor bug or documentation error                          | 24 Hours     | Non-blocking UI glitch                                    |

---

## 2. Standard Incident Lifecycle

```
[Detect & Alert] ──> [Triage & Classify] ──> [Contain & Mitigate] ──> [Resolve & Verify] ──> [Post-Mortem]
```

### Phase 1: Containment

1. If sensitive credentials or database access is compromised:
   - Immediately rotate database passwords and generate a new `APP_KEY`.
   - Invalidate all active user sessions (`TRUNCATE personal_access_tokens;`).
2. If API abuse or DDoS occurs:
   - Adjust Nginx rate limiting or Cloudflare WAF rules.
   - Restrict registration endpoints temporarily if spam accounts are detected.

### Phase 2: Mitigation

- If Groq provider experiences global outages: Notify users via broadcast banner and advise checking back shortly.
- If storage fills up: Prune expired exports (`php artisan schedule:run` or delete files older than 30 days).

---

## 3. Post-Incident Review & Root Cause Analysis (RCA)

Within 48 hours of any SEV-1 or SEV-2 incident, complete an RCA containing:

1. **Incident Summary & Timeline:** Timestamps of detection, diagnosis, containment, and resolution.
2. **Root Cause:** Fundamental technical failure mode.
3. **Impact:** Number of affected users, failed requests, or downtime duration.
4. **Action Items:** Preventative code, configuration, or monitoring improvements with assigned owners and deadlines.
