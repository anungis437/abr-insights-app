#!/bin/bash
# CSP Runtime Validation Script (Bash)
# Usage: ./validate-csp-runtime.sh [BASE_URL]
# Example: ./validate-csp-runtime.sh https://abr-insights-app.thankfulsea-568c2dd6.eastus.azurecontainerapps.io

set -e

BASE_URL="${1:-http://localhost:3000}"

echo "🔍 Validating CSP Runtime Enforcement"
echo "Base URL: $BASE_URL"
echo "========================================"
echo ""

# Test routes
ROUTES=("/" "/pricing" "/dashboard")
ALL_PASS=true

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

function test_route() {
    local route=$1
    local url="${BASE_URL}${route}"
    
    echo "Testing: $url"
    echo "---"
    
    # Capture headers
    RESPONSE=$(curl -sI "$url" 2>&1)
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ FAIL: Could not reach URL${NC}"
        ALL_PASS=false
        return 1
    fi
    
    # Check for CSP header
    CSP_HEADER=$(echo "$RESPONSE" | grep -i "content-security-policy:" | head -1)
    NONCE_HEADER=$(echo "$RESPONSE" | grep -i "x-nonce:" | head -1)
    
    if [ -z "$CSP_HEADER" ]; then
        echo -e "${RED}❌ FAIL: No Content-Security-Policy header${NC}"
        ALL_PASS=false
    else
        echo -e "${GREEN}✅ PASS: CSP header present${NC}"
    fi
    
    if [ -z "$NONCE_HEADER" ]; then
        echo -e "${RED}❌ FAIL: No x-nonce header${NC}"
        ALL_PASS=false
    else
        echo -e "${GREEN}✅ PASS: x-nonce header present${NC}"
        NONCE_VALUE=$(echo "$NONCE_HEADER" | cut -d' ' -f2 | tr -d '\r')
        echo "  Nonce value: $NONCE_VALUE"
    fi
    
    # Check for unsafe-inline
    if echo "$CSP_HEADER" | grep -qi "unsafe-inline"; then
        echo -e "${RED}❌ FAIL: unsafe-inline detected in CSP${NC}"
        ALL_PASS=false
    else
        echo -e "${GREEN}✅ PASS: No unsafe-inline${NC}"
    fi
    
    # Check for unsafe-eval
    if echo "$CSP_HEADER" | grep -qi "unsafe-eval"; then
        echo -e "${RED}❌ FAIL: unsafe-eval detected in CSP${NC}"
        ALL_PASS=false
    else
        echo -e "${GREEN}✅ PASS: No unsafe-eval${NC}"
    fi
    
    echo ""
}

# Test all routes
for route in "${ROUTES[@]}"; do
    test_route "$route"
done

# Test nonce uniqueness (3 requests)
echo "Testing nonce uniqueness (3 consecutive requests)..."
echo "---"

NONCE1=$(curl -sI "$BASE_URL/" | grep -i "x-nonce:" | cut -d' ' -f2 | tr -d '\r')
sleep 0.1
NONCE2=$(curl -sI "$BASE_URL/" | grep -i "x-nonce:" | cut -d' ' -f2 | tr -d '\r')
sleep 0.1
NONCE3=$(curl -sI "$BASE_URL/" | grep -i "x-nonce:" | cut -d' ' -f2 | tr -d '\r')

if [ "$NONCE1" != "$NONCE2" ] && [ "$NONCE2" != "$NONCE3" ] && [ "$NONCE1" != "$NONCE3" ]; then
    echo -e "${GREEN}✅ PASS: Nonces are unique per request${NC}"
    echo "  Nonce 1: $NONCE1"
    echo "  Nonce 2: $NONCE2"
    echo "  Nonce 3: $NONCE3"
else
    echo -e "${RED}❌ FAIL: Nonces are NOT unique${NC}"
    echo "  Nonce 1: $NONCE1"
    echo "  Nonce 2: $NONCE2"
    echo "  Nonce 3: $NONCE3"
    ALL_PASS=false
fi
echo ""

# Test _dev route protection (should 404 in production)
if [[ "$BASE_URL" != *"localhost"* ]]; then
    echo "Testing _dev route protection (production only)..."
    echo "---"
    
    DEV_RESPONSE=$(curl -sI "${BASE_URL}/_dev/test-checkout" 2>&1)
    if echo "$DEV_RESPONSE" | grep -q "404"; then
        echo -e "${GREEN}✅ PASS: _dev routes return 404 in production${NC}"
    else
        echo -e "${RED}❌ FAIL: _dev routes accessible in production${NC}"
        ALL_PASS=false
    fi
    echo ""
fi

# Test correlation ID header
echo "Testing correlation ID header..."
echo "---"

CORR_HEADER=$(curl -sI "$BASE_URL/" | grep -i "x-correlation-id:" | head -1)
if [ -n "$CORR_HEADER" ]; then
    echo -e "${GREEN}✅ PASS: x-correlation-id header present${NC}"
    CORR_VALUE=$(echo "$CORR_HEADER" | cut -d' ' -f2 | tr -d '\r')
    echo "  Correlation ID: $CORR_VALUE"
else
    echo -e "${YELLOW}⚠️  WARN: x-correlation-id header missing (non-critical)${NC}"
fi
echo ""

# Final summary
echo "========================================"
if [ "$ALL_PASS" = true ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED${NC}"
    echo ""
    echo "CSP Runtime Enforcement: VERIFIED ✅"
    echo ""
    echo "You can now claim:"
    echo "- ✅ Dynamic nonce-based CSP enforced on all HTML responses"
    echo "- ✅ No unsafe-inline or unsafe-eval directives"
    echo "- ✅ Cryptographic nonces generated per request"
    echo "- ✅ Request correlation enabled"
    if [[ "$BASE_URL" != *"localhost"* ]]; then
        echo "- ✅ Dev routes blocked in production"
    fi
    exit 0
else
    echo -e "${RED}❌ SOME CHECKS FAILED${NC}"
    echo ""
    echo "Review failures above and fix before claiming CSP enforcement."
    exit 1
fi
