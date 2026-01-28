# Docker Build - Quick Start

## TL;DR - One Command Solution

```powershell
# Build production bundle on exFAT drive
.\docker-build.ps1 -Clean -Extract
```

✅ Solves EISDIR webpack error  
✅ Creates production `.next` folder  
✅ Ready for deployment

---

## Prerequisites

✅ Docker Desktop installed and running  
✅ Project on D:\ drive (exFAT)

**Install Docker Desktop**: https://www.docker.com/products/docker-desktop

---

## Commands

### Build Production Bundle

```powershell
# Recommended: Clean build with extraction
.\docker-build.ps1 -Clean -Extract

# Quick rebuild (if files unchanged)
.\docker-build.ps1 -Extract

# Build only (no extraction)
.\docker-build.ps1
```

### Test Production Server

```powershell
# Build and test locally
.\docker-build.ps1 -Clean -Extract -Run

# Access at: http://localhost:3000
```

### Help

```powershell
.\docker-build.ps1 -Help
```

---

## What This Does

1. ✅ Builds Next.js inside Docker (Linux filesystem)
2. ✅ Bypasses Windows exFAT limitations
3. ✅ Extracts `.next` folder to your project
4. ✅ Ready for Azure deployment

---

## Expected Output

```
=== ABR Insights App - Docker Build ===
Date: 2026-01-28 10:30:00

[1/4] Cleaning .next folder...
Successfully cleaned

[2/4] Building Docker image...
[Building... 2-5 minutes first time]
Build complete

[3/4] Extracting build artifacts...
Artifacts extracted to .next folder

[4/4] Skipping server start

=== Build Complete ===

Next steps:
  Extract artifacts: .\docker-build.ps1 -Extract
  Run production:    .\docker-build.ps1 -Run
  Deploy to Azure:   Use extracted .next folder
```

---

## Verify Success

```powershell
# Check that .next folder exists with build artifacts
ls .next

# Expected folders:
# - server/      (server-side code)
# - static/      (static assets)  
# - cache/       (build cache)
# - standalone/  (if configured)
```

---

## Troubleshooting

### Docker Not Running

```powershell
# Error: Cannot connect to Docker daemon
# Solution: Start Docker Desktop
```

### Build Fails

```powershell
# Clean everything and retry
.\docker-build.ps1 -Clean -Extract

# Or clean Docker cache
docker system prune -a
.\docker-build.ps1 -Clean -Extract
```

### Slow Build

**First build**: 5-10 minutes (downloads Node.js, installs packages)  
**Subsequent builds**: 2-3 minutes (uses cached layers)

---

## Next Steps After Build

### Deploy to Azure

```powershell
# The .next folder is ready for deployment
git add .next
git commit -m "Production build via Docker"
git push origin main

# Azure Static Web Apps will deploy automatically
```

### Local Testing

```powershell
# Test production build locally
.\docker-build.ps1 -Run

# Or use docker-compose
docker-compose up app
```

---

## Full Documentation

See [DOCKER_BUILD_GUIDE.md](DOCKER_BUILD_GUIDE.md) for:
- Complete setup instructions
- Advanced configurations
- CI/CD integration
- Troubleshooting guide
- Performance optimization

---

**Bottom Line**: `.\docker-build.ps1 -Clean -Extract` solves the exFAT build issue in one command.
