#!/usr/bin/env bash
#
# Release Acceptance Gate
# 
# Validates that deployed application meets production security and operational requirements.
# This script is designed to run against a deployed environment before accepting a release.
#
# USAGE:
#   export BASE_URL=https://your-app.azurewebsites.net
#   ./scripts/release-acceptance.sh
#
# EXIT CODES:
#   0 - All checks passed
#   1 - One or more checks failed
#
# REQUIREMENTS:
#   - curl (with --fail-with-body support)
#   - jq (for JSON parsing)
#   - bash 4.0+

set -euo pipefail

# Configuration
BASE_URL="${BASE_URL:-http://localhost:3000}"
TIMEOUT="${TIMEOUT:-10}"
VERBOSE="${VERBOSE:-false}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check results
PASSED=0
FAILED=0
WARNINGS=0

# Logging functions
log_info() {
  echo -e "${BLUE}[INFO]${NC} $*"
}

log_success() {
  echo -e "${GREEN}[PASS]${NC} $*"
  ((PASSED++))
}

log_error() {
  echo -e "${RED}[FAIL]${NC} $*" >&2
  ((FAILED++))
}

log_warning() {
  echo -e "${YELLOW}[WARN]${NC} $*"
  ((WARNINGS++))
}

# Check prerequisites
check_prerequisites() {
  log_info "Checking prerequisites..."
  
  if ! command -v curl &> /dev/null; then
    log_error "curl is required but not installed"
    exit 1
  fi
  
  if ! command -v jq &> /dev/null; then
    log_warning "jq not found - JSON parsing will be limited"
  fi
  
  log_success "Prerequisites check completed"
}

# Validate base URL is reachable
validate_base_url() {
  log_info "Validating base URL: $BASE_URL"
  
  # Check health endpoint (lightweight API endpoint)
  log_info "Checking health endpoint: ${BASE_URL}/api/healthz"
  if ! curl --fail --silent --show-error --max-time "$TIMEOUT" "${BASE_URL}/api/healthz" > /dev/null 2>&1; then
    log_error "Health endpoint is not reachable: ${BASE_URL}/api/healthz"
    return 1
  fi
  log_success "Health endpoint is reachable"
  
  # Note: We don't check the root URL because it may:
  # - Require authentication
  # - Perform server-side rendering (slower)
  # - Do client-side redirects
  # The health endpoint is sufficient to verify the app is running
  
  log_success "Base URL is reachable"
}

# Assert header exists in response
assert_header_exists() {
  local url="$1"
  local header_name="$2"
  local description="$3"
  
  local response
  response=$(curl --silent --show-error --max-time "$TIMEOUT" --head "$url" 2>&1)
  
  if echo "$response" | grep -iq "^${header_name}:"; then
    log_success "$description - Header '$header_name' present"
    return 0
  else
    log_error "$description - Header '$header_name' MISSING"
    if [ "$VERBOSE" = "true" ]; then
      echo "$response" | head -n 20
    fi
    return 1
  fi
}

# Assert header contains value
assert_header_contains() {
  local url="$1"
  local header_name="$2"
  local expected_substring="$3"
  local description="$4"
  
  local header_value
  header_value=$(curl --silent --show-error --max-time "$TIMEOUT" --head "$url" 2>&1 | grep -i "^${header_name}:" | sed "s/^${header_name}: //I" | tr -d '\r')
  
  if [ -z "$header_value" ]; then
    log_error "$description - Header '$header_name' not found"
    return 1
  fi
  
  if echo "$header_value" | grep -q "$expected_substring"; then
    log_success "$description - Header contains '$expected_substring'"
    if [ "$VERBOSE" = "true" ]; then
      echo "  Value: $header_value"
    fi
    return 0
  else
    log_error "$description - Header does not contain '$expected_substring'"
    if [ "$VERBOSE" = "true" ]; then
      echo "  Expected substring: $expected_substring"
      echo "  Actual value: $header_value"
    fi
    return 1
  fi
}

# Assert endpoint returns expected status
assert_status() {
  local url="$1"
  local expected_status="$2"
  local description="$3"
  
  local status_code
  status_code=$(curl --silent --output /dev/null --write-out "%{http_code}" --max-time "$TIMEOUT" "$url" 2>&1)
  
  if [ "$status_code" = "$expected_status" ]; then
    log_success "$description - Status $status_code"
    return 0
  else
    log_error "$description - Expected $expected_status, got $status_code"
    return 1
  fi
}

# Assert JSON response contains field
assert_json_field() {
  local url="$1"
  local field_path="$2"
  local description="$3"
  
  if ! command -v jq &> /dev/null; then
    log_warning "$description - Skipped (jq not available)"
    return 0
  fi
  
  local response
  response=$(curl --silent --show-error --max-time "$TIMEOUT" "$url" 2>&1)
  
  if echo "$response" | jq -e "$field_path" > /dev/null 2>&1; then
    log_success "$description - Field '$field_path' exists"
    if [ "$VERBOSE" = "true" ]; then
      echo "  Value: $(echo "$response" | jq "$field_path")"
    fi
    return 0
  else
    log_error "$description - Field '$field_path' missing or invalid"
    if [ "$VERBOSE" = "true" ]; then
      echo "$response" | jq '.' 2>&1 | head -n 20
    fi
    return 1
  fi
}

# Main security header checks
check_security_headers() {
  log_info "Checking security headers on HTML routes..."
  
  # Check homepage
  assert_header_exists "$BASE_URL/" "Content-Security-Policy" "Homepage: CSP header"
  assert_header_contains "$BASE_URL/" "Content-Security-Policy" "nonce-" "Homepage: CSP contains nonce"
  assert_header_exists "$BASE_URL/" "x-nonce" "Homepage: x-nonce header"
  assert_header_exists "$BASE_URL/" "x-correlation-id" "Homepage: x-correlation-id header"
  
  # Check another HTML page (about page should not redirect)
  assert_header_exists "$BASE_URL/about/" "Content-Security-Policy" "About page: CSP header"
  assert_header_exists "$BASE_URL/about/" "x-nonce" "About page: x-nonce header"
  assert_header_exists "$BASE_URL/about/" "x-correlation-id" "About page: x-correlation-id header"
  
  log_info "Security headers validation complete"
}

# Health endpoint checks
check_health_endpoints() {
  log_info "Checking health endpoints..."
  
  # Liveness check (always 200)
  assert_status "$BASE_URL/api/healthz/" "200" "Liveness endpoint /api/healthz"
  assert_json_field "$BASE_URL/api/healthz/" ".status" "Liveness: status field"
  assert_json_field "$BASE_URL/api/healthz/" ".timestamp" "Liveness: timestamp field"
  
  # Readiness check (200 or 503 depending on dependencies)
  local readyz_status
  readyz_status=$(curl --silent --output /dev/null --write-out "%{http_code}" --max-time "$TIMEOUT" "$BASE_URL/api/readyz/" 2>&1)
  
  if [ "$readyz_status" = "200" ]; then
    log_success "Readiness endpoint /api/readyz - Status 200 (ready)"
    assert_json_field "$BASE_URL/api/readyz/" ".status" "Readiness: status field"
    assert_json_field "$BASE_URL/api/readyz/" ".checks" "Readiness: checks array"
  elif [ "$readyz_status" = "503" ]; then
    log_warning "Readiness endpoint /api/readyz - Status 503 (not ready - dependencies unavailable)"
    # 503 is acceptable if dependencies are not yet configured
  else
    log_error "Readiness endpoint /api/readyz - Unexpected status $readyz_status"
  fi
  
  log_info "Health endpoints validation complete"
}

# CSP nonce verification (advanced check)
check_csp_nonce_in_html() {
  log_info "Verifying CSP nonce is applied in HTML..."
  
  local response
  response=$(curl --silent --show-error --max-time "$TIMEOUT" "$BASE_URL/" 2>&1)
  
  # Extract nonce from CSP header
  local csp_header
  csp_header=$(curl --silent --show-error --max-time "$TIMEOUT" --head "$BASE_URL/" 2>&1 | grep -i "^content-security-policy:" | tr -d '\r')
  
  if echo "$csp_header" | grep -q "nonce-"; then
    local nonce_value
    nonce_value=$(echo "$csp_header" | grep -o "nonce-[A-Za-z0-9+/=]*" | head -1 | sed 's/nonce-//')
    
    if echo "$response" | grep -q "nonce=\"$nonce_value\""; then
      log_success "CSP nonce is applied to inline scripts/styles in HTML"
    else
      log_warning "CSP nonce in header but not found in HTML (may be expected for some pages)"
    fi
  else
    log_warning "No CSP nonce found in header"
  fi
}

# Summary report
print_summary() {
  echo ""
  echo "=========================================="
  echo "Release Acceptance Gate - Summary"
  echo "=========================================="
  echo -e "Base URL:     $BASE_URL"
  echo -e "Passed:       ${GREEN}$PASSED${NC}"
  echo -e "Failed:       ${RED}$FAILED${NC}"
  echo -e "Warnings:     ${YELLOW}$WARNINGS${NC}"
  echo "=========================================="
  
  if [ $FAILED -gt 0 ]; then
    echo -e "${RED}❌ Release acceptance gate FAILED${NC}"
    echo "   Fix the failed checks before promoting to production."
    return 1
  elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Release acceptance gate PASSED with warnings${NC}"
    echo "   Review warnings and consider fixing before production."
    return 0
  else
    echo -e "${GREEN}✅ Release acceptance gate PASSED${NC}"
    echo "   Application is ready for production traffic."
    return 0
  fi
}

# Main execution
main() {
  echo "=========================================="
  echo "Release Acceptance Gate"
  echo "=========================================="
  echo "Base URL: $BASE_URL"
  echo "Timeout:  ${TIMEOUT}s"
  echo "=========================================="
  echo ""
  
  check_prerequisites
  
  # Allow base URL validation to fail gracefully
  if ! validate_base_url; then
    echo ""
    print_summary
    exit 1
  fi
  
  check_security_headers
  check_health_endpoints
  check_csp_nonce_in_html
  
  echo ""
  print_summary
}

# Run main with error handling
if ! main; then
  exit 1
fi
