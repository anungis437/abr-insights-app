#!/bin/bash
# Docker Build Script for Linux/macOS/WSL
# Builds Next.js app inside Docker to avoid filesystem issues

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Flags
CLEAN=false
EXTRACT=false
RUN=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --clean|-c)
            CLEAN=true
            shift
            ;;
        --extract|-e)
            EXTRACT=true
            shift
            ;;
        --run|-r)
            RUN=true
            shift
            ;;
        --help|-h)
            echo -e "${CYAN}ABR Insights App - Docker Build Script${NC}"
            echo ""
            echo "Usage: ./docker-build.sh [options]"
            echo ""
            echo "Options:"
            echo "  -c, --clean    Clean .next folder before building"
            echo "  -e, --extract  Extract build artifacts from container"
            echo "  -r, --run      Run production server after building"
            echo "  -h, --help     Show this help message"
            echo ""
            echo "Examples:"
            echo "  ./docker-build.sh                    # Build only"
            echo "  ./docker-build.sh --clean            # Clean and build"
            echo "  ./docker-build.sh --extract          # Build and extract"
            echo "  ./docker-build.sh -c -e              # Clean, build, extract"
            echo "  ./docker-build.sh --run              # Build and run"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

echo -e "\n${GREEN}=== ABR Insights App - Docker Build ===${NC}"
echo -e "${NC}Date: $(date '+%Y-%m-%d %H:%M:%S')\n"

# Clean .next folder if requested
if [ "$CLEAN" = true ]; then
    echo -e "${YELLOW}[1/4] Cleaning .next folder...${NC}"
    rm -rf .next
    echo -e "${GREEN}✓ Cleaned\n${NC}"
else
    echo -e "${NC}[1/4] Skipping clean (use --clean to clean)\n"
fi

# Build Docker image
echo -e "${YELLOW}[2/4] Building Docker image...${NC}"
docker build -f Dockerfile.build -t abr-insights-app:build --target builder .

if [ $? -ne 0 ]; then
    echo -e "\n${RED}✗ Build failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Build complete\n${NC}"

# Extract artifacts if requested
if [ "$EXTRACT" = true ]; then
    echo -e "${YELLOW}[3/4] Extracting build artifacts...${NC}"
    
    # Create container
    container_id=$(docker create abr-insights-app:build)
    
    # Copy .next folder from container
    docker cp "${container_id}:/app/.next" .
    
    # Remove container
    docker rm "$container_id" > /dev/null
    
    echo -e "${GREEN}✓ Artifacts extracted to .next folder\n${NC}"
else
    echo -e "${NC}[3/4] Skipping artifact extraction (use --extract to extract)\n"
fi

# Run production server if requested
if [ "$RUN" = true ]; then
    echo -e "${YELLOW}[4/4] Starting production server...${NC}"
    docker-compose up app
else
    echo -e "${NC}[4/4] Skipping server start (use --run to start)\n"
fi

echo -e "\n${GREEN}=== Build Complete ===${NC}"
echo -e "${CYAN}"
echo "Next steps:"
echo "  - Extract artifacts: ./docker-build.sh --extract"
echo "  - Run production:    ./docker-build.sh --run"
echo "  - Deploy to Azure:   Use extracted .next folder"
echo -e "${NC}"
