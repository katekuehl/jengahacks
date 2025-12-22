# Log Aggregation Setup

Comprehensive guide for setting up centralized log aggregation for JengaHacks Hub.

## Overview

The log aggregation system collects logs from:
- **Client-side application** (React app)
- **Edge Functions** (Supabase Functions)
- **Server-side operations** (via Edge Function forwarder)

And forwards them to external aggregation services for:
- Centralized log storage
- Real-time log search and filtering
- Alerting and monitoring
- Log analytics and insights

## Supported Providers

### 1. Logtail (Better Stack) - Recommended

**Features:**
- Free tier: 1GB/month, 7-day retention
- Real-time log streaming
- Powerful search and filtering
- Alerting and notifications
- Simple setup

**Setup:**
1. Sign up at [logtail.com](https://logtail.com)
2. Create a new source
3. Copy the endpoint URL and API key
4. Configure environment variables (see below)

### 2. Datadog

**Features:**
- Enterprise-grade logging
- Advanced analytics
- Integration with monitoring
- Higher cost, more features

**Setup:**
1. Sign up at [datadoghq.com](https://www.datadoghq.com)
2. Navigate to Logs → Configuration
3. Get API key and endpoint
4. Configure environment variables

### 3. LogDNA

**Features:**
- Simple log management
- Good for smaller teams
- Reasonable pricing

**Setup:**
1. Sign up at [logdna.com](https://www.logdna.com)
2. Create ingestion key
3. Configure endpoint and API key

### 4. Custom Endpoint

Use your own log aggregation service by providing a custom endpoint.

## Configuration

### Client-Side (React App)

Add these environment variables to `.env`:

```bash
# Enable log aggregation
VITE_LOG_AGGREGATION_ENABLED=true

# Provider: logtail, datadog, logdna, custom, none
VITE_LOG_AGGREGATION_PROVIDER=logtail

# Provider-specific configuration
VITE_LOG_AGGREGATION_ENDPOINT=https://in.logtail.com
VITE_LOG_AGGREGATION_API_KEY=your_api_key_here

# Optional: Customize source name
VITE_LOG_AGGREGATION_SOURCE=jengahacks-hub

# Optional: Batching configuration
VITE_LOG_AGGREGATION_BATCH_SIZE=10
VITE_LOG_AGGREGATION_FLUSH_INTERVAL=5000
VITE_LOG_AGGREGATION_BATCHING=true
```

### Edge Function (Server-Side Forwarder)

Set Edge Function secrets:

```bash
# Using Supabase CLI
supabase secrets set LOG_AGGREGATION_PROVIDER=logtail
supabase secrets set LOGTAIL_ENDPOINT=https://in.logtail.com
supabase secrets set LOGTAIL_API_KEY=your_api_key_here

# Or for Datadog
supabase secrets set DATADOG_ENDPOINT=https://http-intake.logs.datadoghq.com/api/v2/logs
supabase secrets set DATADOG_API_KEY=your_api_key_here
supabase secrets set ENVIRONMENT=production
```

Or via Supabase Dashboard:
1. Go to **Project Settings → Edge Functions**
2. Navigate to **Secrets**
3. Add the secrets listed above

## Usage

### Automatic Integration

Logs are automatically forwarded when aggregation is enabled. The existing `logger` is integrated:

```typescript
import { logger } from '@/lib/logger';

// These logs are automatically forwarded to aggregation service
logger.info('User registered', { userId: '123' });
logger.error('Registration failed', error, { context });
```

### Manual Usage

You can also use the aggregator directly:

```typescript
import { logAggregator } from '@/lib/logAggregation';

logAggregator.info('Custom log message', { customData: 'value' });
logAggregator.error('Error occurred', error, { context });
```

### Edge Function Logging

Edge Functions can forward logs via the log-forwarder function:

```typescript
// In your Edge Function
const logResponse = await supabase.functions.invoke('log-forwarder', {
  body: {
    level: 'error',
    message: 'Something went wrong',
    timestamp: new Date().toISOString(),
    context: { functionName: 'my-function' },
  },
});
```

## Log Structure

All logs follow this structure:

```json
{
  "level": "info|warn|error|debug",
  "message": "Log message",
  "timestamp": "2025-01-01T12:00:00.000Z",
  "context": {
    "userId": "123",
    "customField": "value"
  },
  "error": {
    "name": "Error",
    "message": "Error message",
    "stack": "Error stack trace"
  },
  "metadata": {
    "userAgent": "Mozilla/5.0...",
    "url": "https://example.com/page",
    "userId": "123",
    "sessionId": "session_123",
    "requestId": "req_456"
  }
}
```

## Features

### Batching

Logs are batched by default to reduce API calls:
- **Batch size**: 10 logs (configurable)
- **Flush interval**: 5 seconds (configurable)
- **Auto-flush**: On page unload

### Sanitization

Sensitive data is automatically redacted:
- Passwords
- Tokens
- API keys
- Secrets
- Credentials

### Session Tracking

Each user session gets a unique ID for log correlation:
- Stored in `sessionStorage`
- Included in all log entries
- Helps track user journeys

### Request Tracking

Each request gets a unique ID:
- Helps correlate logs across services
- Useful for debugging distributed systems

## Monitoring and Alerting

### Logtail Alerts

1. Go to Logtail Dashboard
2. Navigate to **Alerts**
3. Create alert rules:
   - Error rate > threshold
   - Specific error messages
   - Log volume anomalies

### Datadog Alerts

1. Go to Datadog Dashboard
2. Navigate to **Monitors → New Monitor**
3. Create log-based monitors:
   - Error count
   - Log patterns
   - Anomaly detection

## Best Practices

### 1. Log Levels

Use appropriate log levels:
- **debug**: Development-only detailed information
- **info**: General information (user actions, system events)
- **warn**: Warning conditions (deprecations, rate limits)
- **error**: Error conditions (exceptions, failures)

### 2. Context

Always include relevant context:
```typescript
logger.error('Registration failed', error, {
  userId: user.id,
  email: user.email,
  formData: sanitizedFormData,
});
```

### 3. Avoid Logging Sensitive Data

The system automatically redacts common sensitive fields, but be careful:
```typescript
// ❌ Bad
logger.info('User logged in', { password: user.password });

// ✅ Good
logger.info('User logged in', { userId: user.id, email: user.email });
```

### 4. Structured Logging

Use structured context objects:
```typescript
// ❌ Bad
logger.info(`User ${userId} registered with email ${email}`);

// ✅ Good
logger.info('User registered', { userId, email, timestamp: Date.now() });
```

### 5. Error Logging

Always include the error object:
```typescript
try {
  // code
} catch (error) {
  logger.error('Operation failed', error as Error, { context });
}
```

## Troubleshooting

### Logs Not Appearing

1. **Check configuration:**
   ```bash
   # Verify environment variables are set
   echo $VITE_LOG_AGGREGATION_ENABLED
   echo $VITE_LOG_AGGREGATION_PROVIDER
   ```

2. **Check browser console:**
   - Look for aggregation errors
   - Verify API calls are being made

3. **Check aggregation service:**
   - Verify API key is correct
   - Check service status page
   - Review service logs

### High API Usage

1. **Enable batching:**
   ```bash
   VITE_LOG_AGGREGATION_BATCHING=true
   VITE_LOG_AGGREGATION_BATCH_SIZE=20
   ```

2. **Increase flush interval:**
   ```bash
   VITE_LOG_AGGREGATION_FLUSH_INTERVAL=10000
   ```

3. **Filter logs:**
   - Only log errors in production
   - Use log levels appropriately

### Performance Impact

Log aggregation is designed to be non-blocking:
- Logs are sent asynchronously
- Batching reduces API calls
- Failed sends don't block the application

If you notice performance issues:
1. Disable aggregation in development
2. Reduce batch size
3. Increase flush interval
4. Use log levels to filter

## Cost Considerations

### Logtail
- **Free**: 1GB/month, 7-day retention
- **Paid**: $20/month for 10GB, 30-day retention

### Datadog
- **Free**: Limited (14-day retention)
- **Paid**: $0.10/GB ingested

### Recommendations

1. **Start with Logtail free tier** for development
2. **Monitor log volume** in production
3. **Use log levels** to reduce volume
4. **Set up alerts** for high volume
5. **Review and optimize** regularly

## Security

### API Keys

- ⚠️ **Never commit API keys to Git**
- ✅ Use environment variables
- ✅ Rotate keys regularly
- ✅ Use different keys for dev/staging/prod

### Data Privacy

- Logs are automatically sanitized
- Sensitive fields are redacted
- User data is included only when necessary
- Comply with GDPR/privacy regulations

### Access Control

- Limit access to log aggregation dashboard
- Use read-only access for most team members
- Audit log access regularly

## Related Documentation

- [Logger Documentation](./src/lib/logger.ts) - Core logging system
- [Monitoring Setup](./MONITORING_SETUP.md) - Application monitoring
- [Environment Variables](./ENVIRONMENT_VARIABLES.md) - All environment variables

