# Codespring API Integration

## Overview

This document describes the Codespring API integration in the ABR Insights application.

## Setup

### 1. Environment Variables

Add your Codespring API key to `.env.local`:

```bash
CODESPRING_API_KEY=api_0ee23d5c-6671-47cd-8e2a-0dc2f3d6da6f
```

### 2. Configuration

The API key is securely stored in environment variables and never exposed to the client.

## Architecture

### Service Layer (`lib/services/codespring.ts`)

Type-safe client for interacting with the Codespring API:

```typescript
import { getCodespringClient } from '@/lib/services/codespring'

const client = getCodespringClient()
const response = await client.analyzeCode(code, language)
```

**Key Features:**

- ✅ Type-safe request/response interfaces
- ✅ Automatic retry and timeout handling
- ✅ Comprehensive error handling
- ✅ Singleton pattern for efficiency
- ✅ Generic request method for custom endpoints

### API Routes

#### `GET /api/codespring/verify`

Verify the API key is valid and working.

**Response:**

```json
{
  "valid": true,
  "message": "Codespring API key is valid and working",
  "timestamp": "2025-01-09T..."
}
```

#### `GET /api/codespring/health`

Check Codespring API health status.

#### `POST /api/codespring/analyze`

Analyze code using Codespring.

**Request:**

```json
{
  "code": "function hello() { ... }",
  "language": "typescript"
}
```

## Usage Examples

### Basic Usage

```typescript
import { getCodespringClient } from '@/lib/services/codespring'

async function analyzeCode(code: string, language: string) {
  const client = getCodespringClient()
  const response = await client.analyzeCode(code, language)

  if (response.success) {
    console.log('Analysis:', response.data)
  } else {
    console.error('Error:', response.error)
  }
}
```

### Custom Endpoint

```typescript
import { getCodespringClient } from '@/lib/services/codespring'

async function customRequest() {
  const client = getCodespringClient()
  const response = await client.request({
    method: 'POST',
    endpoint: '/custom/endpoint',
    body: {
      /* your data */
    },
  })

  return response
}
```

### From API Route

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getCodespringClient } from '@/lib/services/codespring'

export async function POST(request: NextRequest) {
  const client = getCodespringClient()
  const response = await client.analyzeCode(code, language)

  if (!response.success) {
    return NextResponse.json({ error: response.error }, { status: response.statusCode })
  }

  return NextResponse.json(response.data)
}
```

## Testing

### Manual Testing

1. **Start the development server:**

   ```bash
   npm run dev
   ```

2. **Test the verify endpoint:**

   ```bash
   curl http://localhost:3000/api/codespring/verify
   ```

3. **Test the health endpoint:**

   ```bash
   curl http://localhost:3000/api/codespring/health
   ```

4. **Test code analysis:**
   ```bash
   curl -X POST http://localhost:3000/api/codespring/analyze \
     -H "Content-Type: application/json" \
     -d '{"code":"console.log(\"hello\")","language":"javascript"}'
   ```

### Automated Testing

Run the test script:

```bash
npx tsx scripts/test-codespring.ts
```

## API Client Methods

### `healthCheck()`

Check if the API is accessible.

### `verifyApiKey()`

Verify the API key is valid.

### `analyzeCode(code, language)`

Analyze code with Codespring.

**Parameters:**

- `code` (string): The code to analyze
- `language` (string): Programming language (e.g., 'typescript', 'javascript')

**Returns:** `CodespringResponse<CodespringAnalysisResult>`

### `getAnalysisResult(analysisId)`

Get the result of a previous analysis.

### `request<T>(request)`

Make a custom request to any endpoint.

## TypeScript Types

```typescript
interface CodespringConfig {
  apiKey: string
  baseUrl?: string
  timeout?: number
}

interface CodespringRequest {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  endpoint: string
  body?: any
  headers?: Record<string, string>
}

interface CodespringResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  statusCode: number
}

interface CodespringAnalysisResult {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  result?: any
  createdAt: string
  completedAt?: string
}
```

## Error Handling

The client provides comprehensive error handling:

- **Timeout errors** (408): Request took too long
- **Authentication errors** (401): Invalid API key
- **Rate limit errors** (429): Too many requests
- **Server errors** (500+): Codespring API issues
- **Network errors**: Connection failures

Example:

```typescript
const response = await client.analyzeCode(code, language)

if (!response.success) {
  switch (response.statusCode) {
    case 401:
      console.error('Invalid API key')
      break
    case 429:
      console.error('Rate limit exceeded')
      break
    case 408:
      console.error('Request timeout')
      break
    default:
      console.error('Error:', response.error)
  }
}
```

## Security

- ✅ API key stored in environment variables only
- ✅ Never exposed to client-side code
- ✅ All requests go through server-side API routes
- ✅ API key included in Authorization header
- ✅ Secure HTTPS communication

## Configuration

Default configuration:

- **Base URL:** `https://api.codespring.ai` (update as needed)
- **Timeout:** 30 seconds
- **Authentication:** Bearer token

To customize:

```typescript
import { CodespringClient } from '@/lib/services/codespring'

const client = new CodespringClient({
  apiKey: 'your-key',
  baseUrl: 'https://custom.api.url',
  timeout: 60000, // 60 seconds
})
```

## Next Steps

1. **Update API endpoints** based on actual Codespring API documentation
2. **Add more methods** for specific Codespring features
3. **Implement rate limiting** if needed
4. **Add caching** for frequently requested data
5. **Create React hooks** for client-side integration
6. **Add monitoring** and logging for API calls

## Troubleshooting

### "API key not found"

- Ensure `CODESPRING_API_KEY` is in `.env.local`
- Restart the dev server after adding environment variables

### "Fetch failed" or timeout errors

- Check the `baseUrl` in the client configuration
- Verify Codespring API is accessible
- Check network/firewall settings

### "Invalid API key"

- Verify the API key is correct
- Check if the key has expired
- Contact Codespring support

## Support

For Codespring API documentation and support:

- Documentation: [Update with actual URL]
- Support: [Update with support contact]

## Files Created

- `lib/services/codespring.ts` - API client service
- `app/api/codespring/route.ts` - Health and analyze endpoints
- `app/api/codespring/verify/route.ts` - Verification endpoint
- `scripts/test-codespring.ts` - Test script
- `.env.example` - Updated with Codespring variable
- `.env.local` - API key added (not in git)
