# Monitoring Setup Guide

This guide explains how to set up uptime and performance monitoring for the JengaHacks Hub application.

## Overview

The application includes:
- **Client-side monitoring**: Built-in performance and health monitoring (see `MONITORING.md`)
- **Health check endpoint**: `/health` route for external monitoring services
- **Sentry integration**: Error tracking and performance monitoring
- **Google Analytics**: Page views and user behavior tracking

## External Uptime Monitoring

For production uptime monitoring, set up an external service to periodically check your application's health endpoint.

### Recommended Services

1. **UptimeRobot** (Free tier: 50 monitors, 5-minute intervals)
   - Website: https://uptimerobot.com
   - Free tier available
   - Email/SMS alerts

2. **Pingdom** (Paid, starts at $10/month)
   - Website: https://www.pingdom.com
   - Advanced features
   - Better reporting

3. **StatusCake** (Free tier: 10 monitors)
   - Website: https://www.statuscake.com
   - Free tier available
   - Good alerting options

4. **Better Uptime** (Free tier available)
   - Website: https://betteruptime.com
   - Modern interface
   - Incident management

### Setup Instructions

#### Using UptimeRobot (Recommended for Free Tier)

1. **Create Account**
   - Go to https://uptimerobot.com
   - Sign up for a free account

2. **Add New Monitor**
   - Click "Add New Monitor"
   - Select "HTTP(s)" as monitor type
   - Enter your website URL: `https://yourdomain.com/health`
   - Set monitoring interval: 5 minutes (free tier minimum)
   - Set alert contacts (email/SMS)

3. **Configure Alert Thresholds**
   - Alert when down: Immediately
   - Alert when up: After 1 check
   - Set up email/SMS notifications

4. **Save Monitor**
   - Click "Create Monitor"
   - Monitor will start checking your site

#### Using Better Uptime

1. **Create Account**
   - Go to https://betteruptime.com
   - Sign up for free account

2. **Add Monitor**
   - Click "Add Monitor"
   - Enter URL: `https://yourdomain.com/health`
   - Set check interval: 1 minute (free tier)
   - Configure alert channels (email, Slack, Discord, etc.)

3. **Set Up Status Page** (Optional)
   - Create a public status page
   - Share with users for transparency

### Health Check Endpoint

The application provides a health check endpoint at `/health` that returns:

- **Status**: Overall health status (ok/degraded/error)
- **Uptime**: Time since page load
- **Version**: Application version
- **Health Checks**: Individual component status
- **Performance Metrics**: Page load time, API response times, error rates, memory usage

**Example Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "health": {
    "overall": "healthy",
    "checks": [
      {
        "name": "memory_usage",
        "status": "healthy",
        "message": "Memory usage: 45.23MB",
        "timestamp": "2025-01-01T00:00:00.000Z"
      }
    ]
  },
  "performance": {
    "pageLoadTime": 1234,
    "avgApiResponseTime": 250,
    "errorRate": 0.01,
    "memoryUsage": 45.23
  }
}
```

### Monitoring Configuration

Configure the following environment variables for production monitoring:

```bash
# Enable monitoring system
VITE_MONITORING_ENABLED=true

# Enable health checks
VITE_MONITORING_HEALTH=true

# Enable alerts
VITE_MONITORING_ALERTS=true

# Webhook URL for alerts (Slack, Discord, etc.)
VITE_MONITORING_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Alert thresholds
VITE_MONITORING_ERROR_RATE_THRESHOLD=0.1        # 10%
VITE_MONITORING_RESPONSE_TIME_THRESHOLD=2000    # 2 seconds
VITE_MONITORING_MEMORY_THRESHOLD=100            # 100MB
VITE_MONITORING_API_ERROR_RATE_THRESHOLD=0.05   # 5%

# Health check interval (milliseconds)
VITE_MONITORING_HEALTH_CHECK_INTERVAL=60000     # 60 seconds

# Metrics retention (number of metrics to keep)
VITE_MONITORING_METRICS_RETENTION=1000
```

## Performance Monitoring

### Google Analytics

Already configured for page view and event tracking. See `src/lib/analytics.ts` for details.

**Setup:**
1. Create Google Analytics 4 property
2. Get Measurement ID (format: `G-XXXXXXXXXX`)
3. Set environment variable: `VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX`

### Sentry Performance Monitoring

Sentry provides error tracking and performance monitoring.

**Setup:**
1. Create Sentry account at https://sentry.io
2. Create a new project (React)
3. Get DSN from project settings
4. Set environment variables:
   ```bash
   VITE_SENTRY_ENABLED=true
   VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
   VITE_SENTRY_ENVIRONMENT=production
   ```

**Features:**
- Error tracking with stack traces
- Performance monitoring (transaction tracking)
- Release tracking
- User context
- Breadcrumbs for debugging

### Core Web Vitals

The built-in monitoring system automatically tracks Core Web Vitals:
- **LCP** (Largest Contentful Paint)
- **FID** (First Input Delay)
- **CLS** (Cumulative Layout Shift)

These metrics are available via:
```typescript
import { monitor } from '@/lib/monitoring';
const summary = monitor.getPerformanceSummary();
```

## Alerting Setup

### Email Alerts

Most uptime monitoring services support email alerts out of the box. Configure in the service dashboard.

### Slack/Discord Webhooks

1. **Create Webhook**
   - Slack: https://api.slack.com/messaging/webhooks
   - Discord: Server Settings → Integrations → Webhooks → New Webhook

2. **Configure Environment Variable**
   ```bash
   VITE_MONITORING_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   ```

3. **Enable Alerts**
   ```bash
   VITE_MONITORING_ALERTS=true
   ```

### Alert Payload Format

Alerts are sent as POST requests with JSON payload:

```json
{
  "alert": {
    "id": "high_error_rate",
    "severity": "critical",
    "message": "Error rate exceeded threshold: 15.00%",
    "timestamp": "2025-01-01T00:00:00.000Z",
    "context": {
      "errorRate": 0.15,
      "threshold": 0.1
    }
  },
  "source": "jengahacks-monitoring"
}
```

## Monitoring Checklist

- [ ] Set up external uptime monitoring service (UptimeRobot/Pingdom/etc.)
- [ ] Configure health check endpoint monitoring (`/health`)
- [ ] Set up email/SMS alerts for downtime
- [ ] Configure Slack/Discord webhooks for alerts
- [ ] Enable Sentry for error tracking
- [ ] Configure Google Analytics
- [ ] Set production environment variables
- [ ] Test alert notifications
- [ ] Document monitoring setup for team
- [ ] Set up status page (optional but recommended)

## Best Practices

1. **Monitor Multiple Endpoints**
   - Main site: `https://yourdomain.com`
   - Health endpoint: `https://yourdomain.com/health`
   - API endpoints (if applicable)

2. **Set Appropriate Intervals**
   - Production: 1-5 minutes
   - Staging: 5-15 minutes
   - Development: Monitor manually

3. **Configure Alert Escalation**
   - Immediate alerts for critical issues
   - Delayed alerts for warnings
   - Multiple notification channels

4. **Regular Review**
   - Review alerts weekly
   - Analyze performance trends
   - Adjust thresholds as needed

5. **Status Page**
   - Create public status page
   - Update during incidents
   - Share with users

## Troubleshooting

### Health Check Not Responding

1. Verify the `/health` route is accessible
2. Check browser console for errors
3. Verify monitoring is enabled: `VITE_MONITORING_ENABLED=true`
4. Check network connectivity

### Alerts Not Sending

1. Verify `VITE_MONITORING_ALERTS=true`
2. Check webhook URL is correct
3. Test webhook manually with curl:
   ```bash
   curl -X POST https://your-webhook-url \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```

### Performance Metrics Missing

1. Ensure monitoring is initialized in `main.tsx`
2. Check browser console for errors
3. Verify `VITE_MONITORING_ENABLED=true`
4. Check that Performance API is available in browser

## Related Documentation

- [Monitoring System](./MONITORING.md) - Detailed monitoring system documentation
- [Environment Variables](./ENVIRONMENT_VARIABLES.md) - Complete environment variable reference
- [Sentry Setup](./src/lib/sentry.ts) - Sentry integration details
- [Analytics](./src/lib/analytics.ts) - Google Analytics integration

