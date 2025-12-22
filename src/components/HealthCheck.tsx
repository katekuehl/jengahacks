/**
 * Health Check Component
 * Displays system health status and monitoring metrics
 */

import { useEffect, useState } from 'react';
import { Activity, AlertCircle, CheckCircle, XCircle, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { monitor, HealthStatus, HealthCheck as HealthCheckType } from '@/lib/monitoring';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const HealthCheck = () => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>('healthy');
  const [healthChecks, setHealthChecks] = useState<HealthCheckType[]>([]);
  const [performanceSummary, setPerformanceSummary] = useState<ReturnType<typeof monitor.getPerformanceSummary>>();

  useEffect(() => {
    // Initial health check
    const checks = monitor.checkHealth();
    setHealthChecks(checks);
    setHealthStatus(monitor.getHealthStatus());
    setPerformanceSummary(monitor.getPerformanceSummary());

    // Update every 30 seconds
    const interval = setInterval(() => {
      const newChecks = monitor.checkHealth();
      setHealthChecks(newChecks);
      setHealthStatus(monitor.getHealthStatus());
      setPerformanceSummary(monitor.getPerformanceSummary());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: HealthStatus) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'unhealthy':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: HealthStatus) => {
    const variants: Record<HealthStatus, { variant: 'default' | 'secondary' | 'destructive'; className: string }> = {
      healthy: { variant: 'default', className: 'bg-green-500/10 text-green-500 border-green-500/20' },
      degraded: { variant: 'secondary', className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
      unhealthy: { variant: 'destructive', className: 'bg-red-500/10 text-red-500 border-red-500/20' },
    };
    const config = variants[status];
    return (
      <Badge variant={config.variant} className={cn('font-semibold', config.className)}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Overall Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-primary" />
              <CardTitle>System Health</CardTitle>
            </div>
            {getStatusIcon(healthStatus)}
          </div>
          <CardDescription>Current system health status and monitoring metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Overall Status</span>
            {getStatusBadge(healthStatus)}
          </div>

          {/* Performance Summary */}
          {performanceSummary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {performanceSummary.pageLoadTime !== undefined && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Page Load</span>
                  </div>
                  <p className="text-lg font-semibold">
                    {(performanceSummary.pageLoadTime / 1000).toFixed(2)}s
                  </p>
                </div>
              )}
              {performanceSummary.avgApiResponseTime !== undefined && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    <span>Avg API</span>
                  </div>
                  <p className="text-lg font-semibold">
                    {performanceSummary.avgApiResponseTime.toFixed(0)}ms
                  </p>
                </div>
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="w-4 h-4" />
                  <span>Error Rate</span>
                </div>
                <p className="text-lg font-semibold">
                  {(performanceSummary.errorRate * 100).toFixed(2)}%
                </p>
              </div>
              {performanceSummary.memoryUsage !== undefined && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Activity className="w-4 h-4" />
                    <span>Memory</span>
                  </div>
                  <p className="text-lg font-semibold">
                    {performanceSummary.memoryUsage.toFixed(0)}MB
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual Health Checks */}
      <Card>
        <CardHeader>
          <CardTitle>Health Checks</CardTitle>
          <CardDescription>Individual component health status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {healthChecks.map((check) => (
              <div
                key={check.name}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(check.status)}
                  <div>
                    <p className="font-medium capitalize">{check.name.replace(/_/g, ' ')}</p>
                    {check.message && (
                      <p className="text-sm text-muted-foreground">{check.message}</p>
                    )}
                  </div>
                </div>
                {getStatusBadge(check.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthCheck;

