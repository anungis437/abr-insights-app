# Docker Build Guide - exFAT Filesystem Workaround

**Purpose**: Build Next.js production bundle using Docker to bypass Windows exFAT filesystem limitations

**Issue**: Direct builds fail with `EISDIR` error on exFAT drives  
**Solution**: Build inside Docker container (Linux filesystem)

---

## Quick Start

### Windows PowerShell

```powershell
# 1. Build production bundle
.\docker-build.ps1 -Clean -Extract

# 2. Test production server (optional)
.\docker-build.ps1 -Run

# 3. Deploy - .next folder is now ready for Azure
```

### Linux/macOS/WSL

```bash
# 1. Make script executable
chmod +x docker-build.sh

# 2. Build production bundle
./docker-build.sh --clean --extract

# 3. Test production server (optional)
./docker-build.sh --run
```

---

## Prerequisites

### Install Docker Desktop

**Windows**: Download from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)

**Installation Steps**:
1. Download Docker Desktop for Windows
2. Run installer
3. Restart computer
4. Start Docker Desktop
5. Verify: `docker --version`

**System Requirements**:
- Windows 10/11 64-bit Pro, Enterprise, or Education
- WSL 2 enabled (installer will set this up)
- Virtualization enabled in BIOS
- 4GB RAM minimum

---

## Build Commands

### PowerShell Script Options

```powershell
# Clean build (recommended)
.\docker-build.ps1 -Clean -Extract

# Quick rebuild (if files unchanged)
.\docker-build.ps1 -Extract

# Build and run production server
.\docker-build.ps1 -Clean -Extract -Run

# Build only (no extraction)
.\docker-build.ps1

# Show help
.\docker-build.ps1 -Help
```

### Manual Docker Commands

```powershell
# Build image
docker build -f Dockerfile.build -t abr-insights-app:build --target builder .

# Create container and extract .next folder
$containerId = docker create abr-insights-app:build
docker cp "${containerId}:/app/.next" .
docker rm $containerId

# Run production server
docker-compose up app
```

---

## Docker Compose Commands

### Production Build & Run

```powershell
# Build and start production server
docker-compose up app

# Build in background
docker-compose up -d app

# View logs
docker-compose logs -f app

# Stop server
docker-compose down
```

### Development Server

```powershell
# Run development server in Docker
docker-compose up dev

# With live reload
docker-compose up dev --watch
```

---

## Build Process Explained

### What Happens

1. **Docker creates Linux container** (Alpine Linux)
2. **Installs Node.js 20** and dependencies
3. **Copies source code** into container
4. **Runs `npm run build`** inside Linux filesystem (no exFAT issues)
5. **Generates `.next` folder** with production bundle
6. **Extracts artifacts** to your local drive

### Build Stages

```dockerfile
# Stage 1: Dependencies
- Installs all npm packages
- Uses npm ci for faster, reliable installs

# Stage 2: Builder
- Copies dependencies from Stage 1
- Copies source code
- Runs npm run build
- Creates optimized production bundle

# Stage 3: Runner (Production)
- Minimal image with only runtime dependencies
- Copies built .next folder
- Sets up non-root user for security
- Configures health checks
```

---

## Environment Variables

### For docker-compose.yml

Create `.env` file in project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_EMBEDDING_DEPLOYMENT=text-embedding-3-large

# App
NEXT_PUBLIC_SITE_URL=https://yourapp.azurestaticapps.net
NODE_ENV=production
```

Docker Compose will automatically load these variables.

---

## Troubleshooting

### Docker Desktop Not Starting

**Issue**: Docker Desktop fails to start  
**Solutions**:
```powershell
# 1. Enable WSL 2
wsl --install
wsl --set-default-version 2

# 2. Enable virtualization in BIOS
# Restart PC → Enter BIOS → Enable VT-x/AMD-V

# 3. Reinstall Docker Desktop
# Uninstall → Restart → Reinstall
```

### Build Fails with "Cannot find module"

**Issue**: Missing dependencies  
**Solution**:
```powershell
# Clear Docker cache and rebuild
docker builder prune -af
.\docker-build.ps1 -Clean -Extract
```

### Slow Build Times

**Issue**: First build takes 5-10 minutes  
**Solutions**:
```powershell
# 1. Increase Docker memory (Docker Desktop Settings → Resources)
# Recommended: 4GB minimum, 8GB ideal

# 2. Use BuildKit for faster builds
$env:DOCKER_BUILDKIT=1
.\docker-build.ps1 -Extract

# 3. Subsequent builds are faster (cached layers)
```

### "No space left on device"

**Issue**: Docker ran out of disk space  
**Solution**:
```powershell
# Clean up Docker
docker system prune -a --volumes

# Free up space in Docker Desktop settings
# Settings → Resources → Disk image size
```

### Container Exits Immediately

**Issue**: Production container stops after starting  
**Diagnosis**:
```powershell
# Check logs
docker-compose logs app

# Common issues:
# - Missing environment variables
# - Port 3000 already in use
# - Build artifacts not found
```

**Solutions**:
```powershell
# Stop any process using port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Ensure .env file exists with all required variables
# Rebuild with extraction
.\docker-build.ps1 -Clean -Extract -Run
```

---

## CI/CD Integration

### GitHub Actions

Add to `.github/workflows/build.yml`:

```yaml
name: Docker Build

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  docker-build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Build production bundle
        run: |
          docker build -f Dockerfile.build \
            -t abr-insights-app:build \
            --target builder \
            .
      
      - name: Extract artifacts
        run: |
          docker create --name builder abr-insights-app:build
          docker cp builder:/app/.next ./.next
          docker rm builder
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: next-build
          path: .next
```

### Azure DevOps

Add to `azure-pipelines.yml`:

```yaml
trigger:
  - main
  - develop

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: Docker@2
    displayName: 'Build Docker Image'
    inputs:
      command: build
      dockerfile: Dockerfile.build
      arguments: '--target builder -t abr-insights-app:build'
  
  - script: |
      docker create --name builder abr-insights-app:build
      docker cp builder:/app/.next ./.next
      docker rm builder
    displayName: 'Extract Build Artifacts'
  
  - task: PublishBuildArtifacts@1
    inputs:
      pathToPublish: '.next'
      artifactName: 'next-build'
```

---

## Performance Optimization

### Faster Builds

```dockerfile
# Use layer caching effectively
# Dockerfile.build already optimized with:
# 1. Dependencies layer (changes rarely)
# 2. Source code layer (changes frequently)
# 3. Build layer (runs when code changes)
```

### Multi-platform Builds

```powershell
# Build for multiple platforms (production deployment)
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -f Dockerfile.build \
  -t abr-insights-app:build \
  --target builder \
  .
```

### Build Cache

```powershell
# Enable persistent cache
docker buildx build \
  --cache-from type=local,src=.docker-cache \
  --cache-to type=local,dest=.docker-cache \
  -f Dockerfile.build \
  -t abr-insights-app:build \
  .
```

---

## Deployment Workflow

### Local Build → Azure Deployment

```powershell
# 1. Build production bundle
.\docker-build.ps1 -Clean -Extract

# 2. Verify build
ls .next  # Should show: server/, static/, cache/, etc.

# 3. Deploy to Azure Static Web Apps
# The .next folder is now ready for deployment
# Azure will use these pre-built artifacts

# 4. Push to GitHub (CI/CD will deploy)
git add .
git commit -m "Production build ready"
git push origin main
```

### Testing Before Deployment

```powershell
# 1. Build and run locally
.\docker-build.ps1 -Clean -Extract -Run

# 2. Test at http://localhost:3000

# 3. Run tests
docker-compose run --rm app npm test

# 4. Stop server
docker-compose down
```

---

## File Structure

```
abr-insights-app/
├── Dockerfile                 # Multi-stage production Dockerfile
├── Dockerfile.build          # Build-only Dockerfile (extracts .next)
├── Dockerfile.dev            # Development Dockerfile
├── docker-compose.yml        # Orchestrates all services
├── .dockerignore             # Files to exclude from Docker context
├── docker-build.ps1          # Windows build script
├── docker-build.sh           # Linux/macOS build script
├── DOCKER_BUILD_GUIDE.md     # This file
└── .next/                    # Extracted build artifacts (after build)
```

---

## Comparison with Other Solutions

### Docker vs Moving to NTFS

| Aspect | Docker | Move to NTFS |
|--------|--------|--------------|
| **Setup Time** | 15-30 min | 5 min |
| **Build Speed** | Slower (first time) | Faster |
| **Disk Space** | Requires ~2GB | No extra space |
| **Consistency** | ✅ Matches production | ⚠️ Dev environment only |
| **CI/CD Match** | ✅ Identical to GitHub Actions | ❌ Different environment |
| **Learning Curve** | Medium | Easy |
| **Long-term** | ✅ Best practice | ✅ Also valid |

**Recommendation**: 
- **Quick fix**: Move to NTFS (C: drive)
- **Production-ready**: Use Docker (matches deployment environment)
- **Best approach**: Both (NTFS for dev, Docker for builds)

---

## Next Steps

### After Successful Build

1. ✅ **Verify `.next` folder exists** with build artifacts
2. ✅ **Test production server**: `.\docker-build.ps1 -Run`
3. ✅ **Update CI/CD** to use Docker builds
4. ✅ **Deploy to Azure** with confidence

### Long-term Recommendations

1. **Keep project on D: drive** (exFAT) - Docker handles builds
2. **Use Docker for all builds** - Consistent with production
3. **Run dev server natively** - `npm run dev` works fine
4. **Consider WSL 2** for development - Best of both worlds

---

## Support

### Documentation
- [Docker Documentation](https://docs.docker.com/)
- [Next.js Docker Guide](https://nextjs.org/docs/deployment#docker-image)
- [Docker Compose Reference](https://docs.docker.com/compose/)

### Troubleshooting
See [CRITICAL_ASSESSMENT_FILESYSTEM_ISSUE.md](CRITICAL_ASSESSMENT_FILESYSTEM_ISSUE.md) for full context on the exFAT issue.

---

**Summary**: Docker provides a reliable, production-consistent build environment that bypasses Windows exFAT filesystem limitations entirely. Use `docker-build.ps1 -Clean -Extract` for one-command production builds.
