# ResumeNova — Production Monitoring Runbook

**Purpose:** Metrics, alerts, log inspection, and system health monitoring for ResumeNova production operations.

---

## 1. Key Performance Indicators & Health Metrics

### 1.1 Application Layer Metrics

- **HTTP 5xx Error Rate:** Target < 0.1%. Alert threshold > 1% over 5 minutes.
- **API Response Latency:** Target p95 < 250ms for CRUD endpoints; p95 < 3500ms for AI generations.
- **AI Failover Rate:** Alert on > 10 failovers/hour (indicates widespread key exhaustion or Groq provider outage).
- **Export Success Rate:** Target > 99.5% for DomPDF and PHPWord generation.

### 1.2 Infrastructure Layer Metrics

- **CPU Utilization:** Alert if sustained > 80% for 10 minutes.
- **Memory Utilization:** Alert if free memory < 15%.
- **Disk Usage:** Alert if `/var/www` or `/var/backups` volume exceeds 85% capacity.
- **MySQL Active Connections:** Alert if active connections exceed 80% of `max_connections`.

---

## 2. Log Monitoring & Analysis

### 2.1 Backend Error Logs

Inspect daily logs:

```bash
tail -f /var/www/resumenova/backend/storage/logs/laravel-$(date +%Y-%m-%d).log
```

Search for unhandled exceptions or critical failures:

```bash
grep -E "(CRITICAL|EMERGENCY|ALERT|ERROR)" /var/www/resumenova/backend/storage/logs/laravel-*.log | tail -n 50
```

### 2.2 Web Server Access & Error Logs

```bash
tail -f /var/log/nginx/access.log | grep " 500 "
tail -f /var/log/nginx/error.log
```

### 2.3 Queue Worker Logs

```bash
tail -f /var/www/resumenova/backend/storage/logs/worker.log
```

---

## 3. Synthetic Health Checks

Configure an external uptime monitor (e.g. UptimeRobot, BetterStack, or Pingdom):

- **Frontend Check:** `GET https://app.resumenova.com` (Expect 200 OK)
- **Backend API Check:** `GET https://api.resumenova.com/api/user` (Expect 401 Unauthorized / Unauthenticated without token)
- **Check Frequency:** Every 60 seconds from multiple geographic regions.
