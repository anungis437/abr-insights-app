# Production Build Guide

## Windows Build Issue

**Problem**: Production builds fail on Windows with webpack EISDIR error:
```
Error: EISDIR: illegal operation on a directory, readlink 'D:\APPS\abr-insights-app\app\api\admin\ml\*\route.ts'
```

This is a known Windows + webpack + Next.js issue related to how Windows handles directory operations differently from Linux.

## Solution Options

### Option 1: Use CI/CD Pipeline (Recommended)
A GitHub Actions workflow has been configured in [.github/workflows/build.yml](.github/workflows/build.yml) that:
- Runs on Ubuntu (Linux)
- Performs type checking and linting
- Creates production build
- Runs unit tests
- Uploads build artifacts

**To use**:
1. Ensure all required secrets are configured in GitHub repository settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `AZURE_OPENAI_ENDPOINT`
   - `AZURE_OPENAI_API_KEY`
   - `AZURE_OPENAI_EMBEDDINGS_DEPLOYMENT`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`

2. Push to `main` or `develop` branch
3. GitHub Actions will build automatically
4. Download build artifacts from Actions tab if needed

### Option 2: Use WSL2 (Windows Subsystem for Linux)
1. Install WSL2: `wsl --install`
2. Clone repo in WSL2 environment
3. Run `npm install` and `npm run build` from WSL2

### Option 3: Use Docker
```bash
docker build -t abr-insights-app .
```

### Option 4: Deploy Directly to Azure Static Web Apps
Azure Static Web Apps builds in the cloud using Linux runners, bypassing Windows limitations.

## Development on Windows

Development server works fine on Windows:
```bash
npm run dev
```

Only production builds are affected by this webpack/Windows issue.

## Verification

After any build (via CI/CD, WSL2, or Docker):
1. Check build output in `.next/` directory
2. Test with: `npm run start`
3. Verify all routes load correctly
4. Check for any server-side rendering errors

## Related Issues
- Next.js webpack EISDIR on Windows: https://github.com/vercel/next.js/issues/48748
- Webpack symlink handling: https://github.com/webpack/webpack/issues/15662
