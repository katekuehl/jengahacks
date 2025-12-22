# Monitoring and Alerting System

Comprehensive monitoring and alerting system for the JengaHacks Hub application.

## Overview

The monitoring system provides:

- **Custom Metrics Tracking**: Track application-specific metrics
- **Performance Monitoring**: Monitor Core Web Vitals, API response times, memory usage
- **Health Checks**: Periodic health checks for system components
- **Alerting**: Automatic alerts when thresholds are exceeded
- **Integration**: Works with Sentry and webhooks

## Features

### Metrics Tracking

Track custom metrics throughout your application:

```typescript
import { monitor } from '@/lib/monitoring';

// Track a metric
monitor.trackMetric('user_registrations', 1, { source: 'web' });

// Track API response time
monitor.trackApiResponseTime('/api/register', 150, true);

// Track errors
monitor.trackError(error, { context: 'registration' });
```

### Performance Monitoring

Automatically tracks:

- **Page Load Time**: Time to load the page
- **Core Web Vitals**:
  - **LCP** (Largest Contentful Paint): Loading performance
  - **FID** (First Input Delay): Interactivity
  - **CLS** (Cumulative Layout Shift): Visual stability
- **API Response Times**: Average response times for API calls
- **Memory Usage**: JavaScript heap memory usage
- **Error Rates**: Application and API error rates

### Health Checks

Periodic health checks monitor:

- Memory usage
- Error rates
- API response times
- Overall system health

Health status levels:
- **Healthy**: All systems operating normally
- **Degraded**: Some systems showing issues but still functional
- **Unhealthy**: Critical issues detected

### Alerting

Automatic alerts are triggered when thresholds are exceeded:

- **Error Rate**: Exceeds configured threshold
- **Response Time**: API responses exceed threshold
- **Memory Usage**: Memory usage exceeds threshold
- **API Error Rate**: API error rate exceeds threshold

Alert severities:
- **Low**: Informational alerts
- **Medium**: Warning-level alerts
- **High**: Important alerts requiring attention
- **Critical**: Urgent alerts requiring immediate action

## Configuration

### Environment Variables

See `ENVIRONMENT_VARIABLES.md` for complete documentation.

Key variables:

- `VITE_MONITORING_ENABLED`: Enable/disable monitoring (default: `true` in dev, `false` in prod)
- `VITE_MONITORING_ALERTS`: Enable alerting (default: `false`)
- `VITE_MONITORING_WEBHOOK_URL`: Webhook URL for alerts
- `VITE_MONITORING_ERROR_RATE_THRESHOLD`: Error rate threshold (default: `0.1` = 10%)
- `VITE_MONITORING_RESPONSE_TIME_THRESHOLD`: Response time threshold in ms (default: `2000`)
- `VITE_MONITORING_MEMORY_THRESHOLD`: Memory threshold in MB (default: `100`)

### Programmatic Configuration

```typescript
import { monitor } from '@/lib/monitoring';

monitor.configure({
  enableAlerts: true,
  alertThresholds: {
    errorRate: 0.15, // 15%
    responseTime: 3000, // 3 seconds
    memoryUsage: 150, // 150MB
    apiErrorRate: 0.1, // 10%
  },
});
```

## Usage

### Basic Usage

```typescript
import { monitor } from '@/lib/monitoring';

// Track a metric
monitor.trackMetric('custom_metric', 42, { tag: 'value' });

// Track API call
monitor.trackApiResponseTime('/api/endpoint', 250, true);

// Track error
monitor.trackError(new Error('Something went wrong'), {
  userId: '123',
  action: 'registration',
});

// Manual alert
monitor.alert('custom_alert', 'high', 'Something important happened', {
  context: 'additional info',
});
```

### Accessing Data

```typescript
// Get metrics
const metrics = monitor.getMetrics({ name: 'api_response_time' });
const recentMetrics = monitor.getMetrics({ since: new Date(Date.now() - 3600000) });

// Get alerts
const activeAlerts = monitor.getAlerts(false);
const allAlerts = monitor.getAlerts();

// Get health checks
const healthChecks = monitor.getHealthChecks();
const healthStatus = monitor.getHealthStatus();

// Get performance summary
const summary = monitor.getPerformanceSummary();
```

### Resolving Alerts

```typescript
// Resolve an alert
monitor.resolveAlert('alert_id');
```

## Integration

### Sentry Integration

Alerts are automatically sent to Sentry when:
- Alert severity is `high` or `critical`
- `VITE_SENTRY_ENABLED=true`
- Sentry is properly configured

### Webhook Integration

Alerts can be sent to webhooks (Slack, Discord, custom endpoints):

1. Set `VITE_MONITORING_WEBHOOK_URL` to your webhook URL
2. Set `VITE_MONITORING_ALERTS=true`
3. Alerts will be sent as POST requests with JSON payload

**Webhook Payload Format:**

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

### Supabase Integration

The monitoring system automatically tracks:
- Edge Function invocations
- API response times
- Errors from Supabase operations

No additional configuration needed.

## Health Check Component

Use the `HealthCheck` component to display system health:

```typescript
import HealthCheck from '@/components/HealthCheck';

<HealthCheck />
```

The component displays:
- Overall system health status
- Performance summary (page load, API response times, error rate, memory)
- Individual health check statuses

## Browser Console Access

In development mode, the monitoring system is exposed to `window.monitor`:

```javascript
// Access in browser console
window.monitor.getMetrics();
window.monitor.getAlerts();
window.monitor.getHealthStatus();
window.monitor.getPerformanceSummary();
```

## Best Practices

1. **Set Appropriate Thresholds**: Configure thresholds based on your application's requirements
2. **Monitor Key Metrics**: Track metrics that matter for your application
3. **Review Alerts Regularly**: Set up alerting for critical issues
4. **Use Health Checks**: Monitor system health proactively
5. **Integrate with Sentry**: Use Sentry for error tracking and alerting
6. **Set Up Webhooks**: Configure webhooks for team notifications

## Performance Impact

The monitoring system is designed to have minimal performance impact:

- Metrics are stored in memory (configurable retention)
- Health checks run periodically (configurable interval)
- Core Web Vitals tracking uses PerformanceObserver (native browser API)
- All operations are asynchronous

## Troubleshooting

### Monitoring Not Working

1. Check `VITE_MONITORING_ENABLED` is set to `true`
2. Verify environment variables are set correctly
3. Check browser console for errors
4. Ensure monitoring is initialized in `main.tsx`

### Alerts Not Sending

1. Verify `VITE_MONITORING_ALERTS=true`
2. Check webhook URL is correct (if using webhooks)
3. Verify Sentry is configured (if using Sentry)
4. Check browser console for errors

### Health Checks Not Running

1. Verify `VITE_MONITORING_HEALTH=true`
2. Check `VITE_MONITORING_HEALTH_CHECK_INTERVAL` is set
3. Ensure monitoring is initialized

## API Reference

### Methods

- `trackMetric(name, value, tags?)`: Track a custom metric
- `trackApiResponseTime(endpoint, duration, success)`: Track API response time
- `trackError(error, context?)`: Track an error
- `alert(id, severity, message, context?)`: Create an alert
- `resolveAlert(id)`: Resolve an alert
- `checkHealth()`: Perform health checks
- `getHealthStatus()`: Get overall health status
- `getMetrics(filter?)`: Get metrics
- `getAlerts(resolved?)`: Get alerts
- `getHealthChecks()`: Get health checks
- `getPerformanceSummary()`: Get performance summary
- `configure(config)`: Update configuration
- `destroy()`: Cleanup monitoring

## Examples

### Track Registration Success

```typescript
import { monitor } from '@/lib/monitoring';

async function registerUser(data: RegistrationData) {
  const startTime = performance.now();
  try {
    const result = await supabase.functions.invoke('register-with-ip', { body: data });
    const duration = performance.now() - startTime;
    
    monitor.trackApiResponseTime('register', duration, true);
    monitor.trackMetric('user_registered', 1, { source: 'web' });
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    monitor.trackApiResponseTime('register', duration, false);
    monitor.trackError(error as Error, { action: 'registration' });
    throw error;
  }
}
```

### Custom Alert

```typescript
import { monitor } from '@/lib/monitoring';

function checkRegistrationCapacity() {
  const capacity = getRegistrationCapacity();
  const registered = getRegisteredCount();
  const percentage = (registered / capacity) * 100;
  
  if (percentage > 90) {
    monitor.alert('capacity_warning', 'high', 
      `Registration capacity at ${percentage.toFixed(1)}%`, {
        capacity,
        registered,
        percentage,
      }
    );
  }
}
```

## Related Documentation

- [Environment Variables](./ENVIRONMENT_VARIABLES.md)
- [Logging System](./src/lib/logger.ts)
- [Sentry Integration](./src/lib/sentry.ts)
- [Performance Testing](./PERFORMANCE.md)

