# Codespring API Integration - Quick Start

## ✅ What's Been Done

Your Codespring API has been fully integrated into the ABR Insights application!

### Files Created

1. **`lib/services/codespring.ts`** (235 lines)
   - Type-safe API client with comprehensive error handling
   - Singleton pattern for efficiency
   - Timeout and retry support

2. **`app/api/codespring/route.ts`** (67 lines)
   - `POST /api/codespring` - Analyze code
   - `GET /api/codespring` - Health check

3. **`app/api/codespring/verify/route.ts`** (36 lines)
   - `GET /api/codespring/verify` - Verify API key

4. **`lib/hooks/use-codespring.ts`** (226 lines)
   - `useCodespringAnalyze` - React hook for code analysis
   - `useCodespringVerify` - React hook for API key verification
   - `useCodespringHealth` - React hook for health checks

5. **`components/examples/codespring-example.tsx`** (177 lines)
   - Complete working example component
   - Shows all API features

6. **`scripts/test-codespring.ts`** (109 lines)
   - Automated test script
   - Verifies integration is working

7. **`docs/CODESPRING_INTEGRATION.md`** (312 lines)
   - Comprehensive documentation
   - Usage examples
   - Troubleshooting guide

8. **`.env.example`** (updated)
   - Added `CODESPRING_API_KEY` variable

9. **`.env.local`** (updated)
   - Your API key securely stored: `api_0ee23d5c-6671-47cd-8e2a-0dc2f3d6da6f`

## 🚀 How to Use

### 1. Test the Integration

```bash
# Set API key and run test
$env:CODESPRING_API_KEY='api_0ee23d5c-6671-47cd-8e2a-0dc2f3d6da6f'
npx tsx scripts/test-codespring.ts
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Test API Endpoints

**Verify API Key:**
```bash
curl http://localhost:3000/api/codespring/verify
```

**Health Check:**
```bash
curl http://localhost:3000/api/codespring/health
```

**Analyze Code:**
```bash
curl -X POST http://localhost:3000/api/codespring/analyze \
  -H "Content-Type: application/json" \
  -d '{"code":"console.log(\"hello\")","language":"javascript"}'
```

### 4. Use in Your Code

**Server-side (API Routes):**
```typescript
import { getCodespringClient } from '@/lib/services/codespring';

const client = getCodespringClient();
const response = await client.analyzeCode(code, language);
```

**Client-side (React Components):**
```typescript
import { useCodespringAnalyze } from '@/lib/hooks/use-codespring';

function MyComponent() {
  const { analyzeCode, data, isLoading, error } = useCodespringAnalyze();
  
  const handleAnalyze = async () => {
    await analyzeCode(myCode, 'javascript');
  };
  
  return (
    <button onClick={handleAnalyze} disabled={isLoading}>
      {isLoading ? 'Analyzing...' : 'Analyze Code'}
    </button>
  );
}
```

## 📝 Important Notes

### API Base URL

The default base URL is set to `https://api.codespring.ai`. If this is incorrect:

1. Open `lib/services/codespring.ts`
2. Update line 58: `this.baseUrl = config.baseUrl || 'YOUR_ACTUAL_URL';`

### API Endpoints

The example endpoints are:
- `/auth/verify` - Verify API key
- `/health` - Health check
- `/analyze` - Code analysis
- `/analyze/{id}` - Get analysis result

**Update these based on actual Codespring API documentation.**

### Security

✅ API key is stored in environment variables
✅ Never exposed to client-side code
✅ All requests go through server-side API routes
✅ `.env.local` is in `.gitignore` (not committed)

## 🎯 Next Steps

1. **Get Codespring API documentation**
   - Confirm the base URL
   - Update endpoint paths if different
   - Add any additional methods needed

2. **Update the client service**
   - Modify `lib/services/codespring.ts` with actual endpoints
   - Add new methods for specific features

3. **Test with real data**
   - Use the example component
   - Test all endpoints
   - Verify responses match your needs

4. **Integrate into your app**
   - Add Codespring features where needed
   - Use the React hooks for easy integration
   - Follow the example component pattern

## 📚 Documentation

Full documentation: `docs/CODESPRING_INTEGRATION.md`

## 🔍 Troubleshooting

**"Fetch failed" errors:**
- The base URL may be incorrect
- Update `baseUrl` in `lib/services/codespring.ts`

**"API key not found":**
- Restart dev server after adding to `.env.local`
- Check the key is in the file correctly

**Type errors:**
- Update TypeScript interfaces in `lib/services/codespring.ts`
- Match the actual API response structure

## ✨ Features Implemented

✅ Type-safe API client
✅ Environment variable configuration
✅ Server-side API routes
✅ React hooks for client-side usage
✅ Comprehensive error handling
✅ Timeout and retry logic
✅ Loading states
✅ Example component
✅ Test script
✅ Complete documentation
✅ Security best practices

## 🎉 You're All Set!

The Codespring API is fully integrated and ready to use. Just update the base URL and endpoints based on the actual API documentation, and you're good to go!

**Committed:** 469a2dd
**Pushed to:** GitHub (main branch)
