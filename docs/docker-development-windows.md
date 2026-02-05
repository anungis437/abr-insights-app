# Docker Development on Windows

This guide explains how to develop ABR Insights using Docker on Windows, which is necessary due to Next.js 16 Turbopack compatibility issues.

## Why Docker Development?

Next.js 16 has a critical bug on Windows where Turbopack fails to create junction points in `node_modules`, preventing both `npm run dev` and `npm run build` from working. Docker bypasses this issue by using webpack in a Linux container.

**Related Issue:** https://github.com/vercel/next.js/issues/56114

## Prerequisites

- Docker Desktop installed and running
- `.env.docker` file configured (see below)

## Quick Start

### 1. Configure Environment Variables

Ensure `.env.docker` exists with required variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secure-random-secret
```

### 2. Build and Start

Using the helper script (recommended):

```powershell
# Build the Docker image
.\docker-dev.ps1 build

# Start the application
.\docker-dev.ps1 start

# View logs
.\docker-dev.ps1 logs
```

Or manually:

```powershell
# Build
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="your-url" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="your-key" \
  --build-arg SUPABASE_SERVICE_ROLE_KEY="your-key" \
  -t abr-insights-app:dev \
  -f Dockerfile .

# Start
docker run --rm -d -p 3000:3000 --env-file .env.docker --name abr-dev abr-insights-app:dev
```

### 3. Access the Application

Open your browser to: **http://localhost:3000**

## Helper Script Commands

The `docker-dev.ps1` script simplifies Docker operations:

| Command                    | Description                     |
| -------------------------- | ------------------------------- |
| `.\docker-dev.ps1 build`   | Build the Docker image          |
| `.\docker-dev.ps1 start`   | Start the container             |
| `.\docker-dev.ps1 stop`    | Stop the container              |
| `.\docker-dev.ps1 restart` | Restart the container           |
| `.\docker-dev.ps1 logs`    | Show live logs (Ctrl+C to exit) |
| `.\docker-dev.ps1 status`  | Show container status           |
| `.\docker-dev.ps1 clean`   | Stop and remove container       |
| `.\docker-dev.ps1 rebuild` | Full rebuild and restart        |

## Development Workflow

### Making Code Changes

1. Make changes to your code files
2. Rebuild the Docker image:
   ```powershell
   .\docker-dev.ps1 rebuild
   ```
3. The application will restart with your changes

**Note:** Unlike `npm run dev`, Docker development doesn't have hot-reload. You must rebuild after changes.

### Viewing Logs

```powershell
# Live logs (Ctrl+C to exit)
.\docker-dev.ps1 logs

# Or manually
docker logs -f abr-dev
```

### Checking Status

```powershell
.\docker-dev.ps1 status

# Or manually
docker ps
```

### Stopping the Application

```powershell
.\docker-dev.ps1 stop

# Or manually
docker stop abr-dev
```

## Troubleshooting

### Port 3000 Already in Use

Stop any other services using port 3000:

```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <process-id> /F
```

### Environment Variables Not Working

Ensure `.env.docker` is properly formatted:

- No spaces around `=`
- No quotes unless value contains spaces
- One variable per line

### Build Failures

Check Docker logs:

```powershell
docker logs abr-dev
```

Common issues:

- Missing environment variables in `.env.docker`
- Insufficient Docker memory (increase in Docker Desktop settings)
- Network issues during `npm install`

### Supabase Connection Errors

The application requires valid Supabase credentials. Verify:

1. `NEXT_PUBLIC_SUPABASE_URL` points to your Supabase project
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
3. `SUPABASE_SERVICE_ROLE_KEY` is correct

Get these from: https://supabase.com/dashboard/project/_/settings/api

### Server Initialization Failures

If you see "Environment Variable Validation Failed":

- In **production** mode (NODE_ENV=production), the server requires all critical environment variables
- In **development** mode, missing optional variables only show warnings

Generate a secure `NEXTAUTH_SECRET`:

```powershell
$secret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 48 | ForEach-Object {[char]$_})
Write-Host $secret
```

## Environment Variable Validation

The application validates environment variables at startup:

**Required Variables:**

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

**Optional Variables** (warnings only):

- `RESEND_API_KEY`
- `STRIPE_SECRET_KEY`
- `OPENAI_API_KEY`
- `AZURE_OPENAI_API_KEY`
- `UPSTASH_REDIS_REST_URL`

### Fail-Fast Behavior

In production mode, the server will refuse to start if:

- Required variables are missing
- `NEXTAUTH_SECRET` appears to be a default/insecure value

This prevents deployment with invalid configuration.

## Performance Considerations

### Initial Build Time

First build takes 3-5 minutes due to:

- Downloading Node.js base image
- Installing npm dependencies
- Compiling Next.js application

### Subsequent Builds

Faster (30-60 seconds) thanks to Docker layer caching.

### Runtime Performance

Docker adds minimal overhead (~5-10ms latency). Performance is similar to native execution.

## Alternatives to Docker Development

If Docker development is too slow for your workflow:

### Option 1: Downgrade Next.js (Not Recommended)

```powershell
npm install next@15.1.0
```

**Warning:** May break other features. Only use if absolutely necessary.

### Option 2: Use Production Build

```powershell
# This won't work on Windows due to the same Turbopack bug
npm run build && npm run start
```

Unfortunately, this also fails due to the Windows Turbopack bug.

### Option 3: WSL2 (Windows Subsystem for Linux)

Run development inside WSL2 where Turbopack works:

```bash
# In WSL2 terminal
cd /mnt/d/APPS/abr-insights-app
npm run dev
```

This is the best alternative if you need hot-reload.

## Production Deployment

Docker images built for development work for production deployment with proper environment variables. See the main deployment documentation for details.

## Additional Resources

- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
- [Next.js 16 Turbopack Issue](https://github.com/vercel/next.js/issues/56114)

## Getting Help

If you encounter issues:

1. Check Docker Desktop is running
2. Verify `.env.docker` is configured correctly
3. Check Docker logs: `.\docker-dev.ps1 logs`
4. Try a clean rebuild: `.\docker-dev.ps1 rebuild`
5. Consult the main project README.md
