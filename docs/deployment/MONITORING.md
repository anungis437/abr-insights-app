# Application Monitoring & Observability

## Overview

This document outlines the monitoring, logging, and observability strategy for the ABR Insights application using Azure Application Insights, custom telemetry, and alerting.

## Monitoring Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Application (Next.js + Azure Functions)         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Application Insights SDK                   │  │
│  │  - Auto-instrumentation                              │  │
│  │  - Custom telemetry                                  │  │
│  │  - Distributed tracing                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Azure Application Insights                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Telemetry   │  │     Logs     │  │   Metrics    │     │
│  │  Collection  │  │  Aggregation │  │  Analytics   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Visualization & Alerts                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Dashboards  │  │    Alerts    │  │   Workbooks  │     │
│  │  (Portal)    │  │  (Action     │  │  (Reports)   │     │
│  │              │  │   Groups)    │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Application Insights Setup

### 1. Create Application Insights Resource

```bash
# Create Application Insights
az monitor app-insights component create \
  --app abr-insights-app \
  --location canadacentral \
  --resource-group abr-insights-rg \
  --application-type web

# Get instrumentation key
APPINSIGHTS_KEY=$(az monitor app-insights component show \
  --app abr-insights-app \
  --resource-group abr-insights-rg \
  --query instrumentationKey \
  --output tsv)

# Get connection string
APPINSIGHTS_CONNECTION_STRING=$(az monitor app-insights component show \
  --app abr-insights-app \
  --resource-group abr-insights-rg \
  --query connectionString \
  --output tsv)

echo "Instrumentation Key: $APPINSIGHTS_KEY"
echo "Connection String: $APPINSIGHTS_CONNECTION_STRING"
```

### 2. Configure Application Insights

Add to Azure Static Web Apps configuration:

```bash
az staticwebapp appsettings set \
  --name abr-insights-app \
  --resource-group abr-insights-rg \
  --setting-names \
    APPINSIGHTS_INSTRUMENTATIONKEY="$APPINSIGHTS_KEY" \
    APPLICATIONINSIGHTS_CONNECTION_STRING="$APPINSIGHTS_CONNECTION_STRING"
```

## Client-Side Monitoring

### Next.js Integration

**lib/applicationInsights.ts:**

```typescript
import { ApplicationInsights } from '@microsoft/applicationinsights-web'
import { ReactPlugin } from '@microsoft/applicationinsights-react-js'

let appInsights: ApplicationInsights | null = null
let reactPlugin: ReactPlugin | null = null

export function initApplicationInsights() {
  if (typeof window === 'undefined' || appInsights) {
    return { appInsights, reactPlugin }
  }

  reactPlugin = new ReactPlugin()
  
  appInsights = new ApplicationInsights({
    config: {
      connectionString: process.env.NEXT_PUBLIC_APPINSIGHTS_CONNECTION_STRING,
      enableAutoRouteTracking: true,
      enableCorsCorrelation: true,
      enableRequestHeaderTracking: true,
      enableResponseHeaderTracking: true,
      enableAjaxPerfTracking: true,
      maxAjaxCallsPerView: 500,
      disableFetchTracking: false,
      extensions: [reactPlugin],
      extensionConfig: {
        [reactPlugin.identifier]: {
          history: null, // Pass history for route tracking
        },
      },
    },
  })

  appInsights.loadAppInsights()
  appInsights.trackPageView()

  // Set user context
  appInsights.setAuthenticatedUserContext(
    'user-id-placeholder', // Replace with actual user ID
    'account-id-placeholder', // Replace with actual account ID
    true
  )

  return { appInsights, reactPlugin }
}

export function getAppInsights() {
  return appInsights
}
```

**app/layout.tsx:**

```typescript
'use client'

import { useEffect } from 'react'
import { initApplicationInsights } from '@/lib/applicationInsights'

export default function RootLayout({ children }) {
  useEffect(() => {
    initApplicationInsights()
  }, [])

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

### Custom Telemetry

**Track custom events:**

```typescript
import { getAppInsights } from '@/lib/applicationInsights'

// Track user actions
function trackCourseEnrollment(courseId: string) {
  const appInsights = getAppInsights()
  appInsights?.trackEvent({
    name: 'CourseEnrolled',
    properties: {
      courseId,
      timestamp: new Date().toISOString(),
    },
  })
}

// Track metrics
function trackQuizScore(score: number, quizId: string) {
  const appInsights = getAppInsights()
  appInsights?.trackMetric({
    name: 'QuizScore',
    average: score,
    properties: {
      quizId,
    },
  })
}

// Track exceptions
function trackError(error: Error, context: Record<string, any>) {
  const appInsights = getAppInsights()
  appInsights?.trackException({
    exception: error,
    properties: context,
  })
}

// Track page views
function trackPageView(pageName: string) {
  const appInsights = getAppInsights()
  appInsights?.trackPageView({
    name: pageName,
    properties: {
      referrer: document.referrer,
    },
  })
}
```

## Server-Side Monitoring

### Azure Functions Integration

**api/shared/telemetry.js:**

```javascript
const appInsights = require('applicationinsights')

// Initialize Application Insights
appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
  .setAutoDependencyCorrelation(true)
  .setAutoCollectRequests(true)
  .setAutoCollectPerformance(true, true)
  .setAutoCollectExceptions(true)
  .setAutoCollectDependencies(true)
  .setAutoCollectConsole(true, true)
  .setUseDiskRetryCaching(true)
  .setSendLiveMetrics(true)
  .start()

const client = appInsights.defaultClient

// Custom tracking functions
function trackEvent(name, properties = {}) {
  client.trackEvent({
    name,
    properties: {
      ...properties,
      timestamp: new Date().toISOString(),
    },
  })
}

function trackMetric(name, value, properties = {}) {
  client.trackMetric({
    name,
    value,
    properties,
  })
}

function trackDependency(name, data, duration, success) {
  client.trackDependency({
    name,
    data,
    duration,
    success,
    resultCode: success ? 200 : 500,
  })
}

function trackException(exception, properties = {}) {
  client.trackException({
    exception,
    properties,
  })
}

module.exports = {
  client,
  trackEvent,
  trackMetric,
  trackDependency,
  trackException,
}
```

**Example Function with Telemetry:**

```javascript
const { trackEvent, trackMetric, trackException, trackDependency } = require('../shared/telemetry')

module.exports = async function (context, req) {
  const startTime = Date.now()
  
  try {
    // Track function invocation
    trackEvent('ScrapeTribunalCases', {
      tribunal: req.body.tribunal,
      environment: process.env.ENVIRONMENT,
    })

    // Simulate dependency call
    const dependencyStart = Date.now()
    const result = await fetchTribunalCases(req.body.tribunal)
    const dependencyDuration = Date.now() - dependencyStart

    // Track dependency
    trackDependency(
      'FetchTribunalCases',
      req.body.tribunal,
      dependencyDuration,
      true
    )

    // Track metrics
    trackMetric('TribunalCasesScraped', result.count)

    const duration = Date.now() - startTime
    context.log(`Function completed in ${duration}ms`)

    return {
      status: 200,
      body: result,
    }
  } catch (error) {
    // Track exception
    trackException(error, {
      functionName: 'ScrapeTribunalCases',
      tribunal: req.body.tribunal,
    })

    const duration = Date.now() - startTime
    context.log.error(`Function failed after ${duration}ms: ${error.message}`)

    return {
      status: 500,
      body: { error: error.message },
    }
  }
}
```

## Kusto Query Language (KQL)

### Common Queries

**1. Request Performance:**

```kql
requests
| where timestamp > ago(24h)
| summarize 
    count(),
    avg(duration),
    percentile(duration, 95),
    percentile(duration, 99)
    by name
| order by count_ desc
```

**2. Error Rate:**

```kql
requests
| where timestamp > ago(7d)
| summarize 
    total = count(),
    errors = countif(success == false)
    by bin(timestamp, 1h)
| extend errorRate = errors * 100.0 / total
| render timechart
```

**3. Custom Events:**

```kql
customEvents
| where timestamp > ago(24h)
| where name == "CourseEnrolled"
| summarize enrollments = count() by tostring(customDimensions.courseId)
| order by enrollments desc
| take 10
```

**4. Exception Analysis:**

```kql
exceptions
| where timestamp > ago(7d)
| summarize count() by type, outerMessage
| order by count_ desc
| take 20
```

**5. User Journey:**

```kql
pageViews
| where timestamp > ago(1h)
| where user_Id == "USER_ID_HERE"
| project timestamp, name, url, duration
| order by timestamp asc
```

**6. Dependency Performance:**

```kql
dependencies
| where timestamp > ago(24h)
| summarize 
    count(),
    avg(duration),
    percentile(duration, 95)
    by name, type
| order by avg_duration desc
```

**7. Quiz Performance:**

```kql
customMetrics
| where timestamp > ago(7d)
| where name == "QuizScore"
| summarize 
    avgScore = avg(value),
    minScore = min(value),
    maxScore = max(value)
    by tostring(customDimensions.quizId)
| order by avgScore desc
```

## Dashboards

### Create Custom Dashboard

1. **Navigate to Azure Portal** → Application Insights → Dashboards
2. **Click "New Dashboard"**
3. **Add Tiles:**

**Performance Tile:**
```kql
requests
| where timestamp > ago(24h)
| summarize 
    avg(duration),
    percentile(duration, 95)
    by bin(timestamp, 5m)
| render timechart
```

**User Engagement Tile:**
```kql
customEvents
| where timestamp > ago(24h)
| where name in ("CourseEnrolled", "LessonCompleted", "QuizCompleted")
| summarize count() by name, bin(timestamp, 1h)
| render columnchart
```

**Error Rate Tile:**
```kql
exceptions
| where timestamp > ago(24h)
| summarize count() by bin(timestamp, 15m)
| render timechart
```

## Alerts

### 1. High Error Rate Alert

```bash
az monitor metrics alert create \
  --name "High Error Rate" \
  --resource-group abr-insights-rg \
  --scopes "/subscriptions/{subscription-id}/resourceGroups/abr-insights-rg/providers/microsoft.insights/components/abr-insights-app" \
  --condition "count requests/failed > 10" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action-group "devops-team-action-group"
```

### 2. Slow Response Time Alert

```bash
az monitor metrics alert create \
  --name "Slow Response Time" \
  --resource-group abr-insights-rg \
  --scopes "/subscriptions/{subscription-id}/resourceGroups/abr-insights-rg/providers/microsoft.insights/components/abr-insights-app" \
  --condition "avg requests/duration > 3000" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action-group "devops-team-action-group"
```

### 3. Custom Event Alert (Low Engagement)

```kql
// Create alert rule with this query
customEvents
| where timestamp > ago(1h)
| where name == "CourseEnrolled"
| summarize count()
| where count_ < 5
```

### Action Groups

Create action group for notifications:

```bash
az monitor action-group create \
  --name "devops-team-action-group" \
  --resource-group abr-insights-rg \
  --short-name "DevOps" \
  --email-receiver \
    name="DevOps Team" \
    email-address="devops@abrinsights.ca" \
  --sms-receiver \
    name="On-Call" \
    country-code="1" \
    phone-number="4165551234"
```

## Service Level Objectives (SLOs)

### Define SLOs

```yaml
slos:
  availability:
    target: 99.9%
    measurement: Percentage of successful requests
    query: |
      requests
      | summarize success_rate = countif(success == true) * 100.0 / count()
  
  latency:
    target: 95% of requests under 2 seconds
    measurement: 95th percentile response time
    query: |
      requests
      | summarize p95 = percentile(duration, 95)
  
  error_rate:
    target: Less than 1% error rate
    measurement: Percentage of failed requests
    query: |
      requests
      | summarize error_rate = countif(success == false) * 100.0 / count()
```

### Monitor SLO Compliance

Create scheduled KQL query:

```kql
let availability = requests
  | where timestamp > ago(24h)
  | summarize success_rate = countif(success == true) * 100.0 / count();
let latency = requests
  | where timestamp > ago(24h)
  | summarize p95 = percentile(duration, 95);
let error_rate = requests
  | where timestamp > ago(24h)
  | summarize error_rate = countif(success == false) * 100.0 / count();
union availability, latency, error_rate
```

## Log Analytics Workspace

### Link to Log Analytics

```bash
# Create Log Analytics Workspace
az monitor log-analytics workspace create \
  --resource-group abr-insights-rg \
  --workspace-name abr-insights-workspace \
  --location canadacentral

# Link Application Insights to Log Analytics
az monitor app-insights component update \
  --app abr-insights-app \
  --resource-group abr-insights-rg \
  --workspace "/subscriptions/{subscription-id}/resourceGroups/abr-insights-rg/providers/Microsoft.OperationalInsights/workspaces/abr-insights-workspace"
```

## Best Practices

1. **Correlation IDs:** Track requests across services
2. **Sampling:** Use adaptive sampling for high-volume apps
3. **PII Protection:** Never log sensitive user data
4. **Custom Dimensions:** Add context to all events
5. **Meaningful Names:** Use consistent event naming
6. **Alert Fatigue:** Set appropriate thresholds
7. **Dashboard Review:** Review dashboards weekly
8. **SLO Tracking:** Monitor SLOs continuously
9. **Log Retention:** Set appropriate retention (90-730 days)
10. **Cost Management:** Monitor Application Insights costs

## Cost Optimization

### Configure Data Sampling

```typescript
appInsights.config.samplingPercentage = 10 // Sample 10% of telemetry
```

### Configure Data Retention

```bash
az monitor app-insights component update \
  --app abr-insights-app \
  --resource-group abr-insights-rg \
  --retention-time 90
```

### Estimate Costs

- **Data Ingestion:** $2.30 per GB
- **Free Tier:** First 5 GB/month free
- **Expected Usage:** ~20 GB/month (production)
- **Monthly Cost:** ~$35/month

## Troubleshooting

### Missing Telemetry

**Check instrumentation key:**
```bash
az monitor app-insights component show \
  --app abr-insights-app \
  --resource-group abr-insights-rg \
  --query instrumentationKey
```

**Verify data ingestion:**
```kql
requests
| where timestamp > ago(5m)
| take 10
```

### High Latency

**Identify slow requests:**
```kql
requests
| where duration > 5000
| project timestamp, name, url, duration
| order by duration desc
```

### Alert Not Firing

**Check alert rule:**
```bash
az monitor metrics alert show \
  --name "High Error Rate" \
  --resource-group abr-insights-rg
```

## Additional Resources

- [Application Insights Documentation](https://docs.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview)
- [KQL Quick Reference](https://docs.microsoft.com/en-us/azure/data-explorer/kql-quick-reference)
- [Application Insights Sampling](https://docs.microsoft.com/en-us/azure/azure-monitor/app/sampling)
- [Kusto Query Language Tutorial](https://docs.microsoft.com/en-us/azure/data-explorer/kusto/query/)

---

**Last Updated:** 2025-11-05
**Maintainer:** Development Team
**Review Cycle:** Quarterly
