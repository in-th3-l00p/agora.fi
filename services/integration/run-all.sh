#!/usr/bin/env bash
# run-all.sh — Run all AGORAFI integration tests.
#
# Usage:
#   ./run-all.sh          Run all tests (starts services if needed)
#   ./run-all.sh --stop   Also stop services after tests finish

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/shared.sh"

STOP_AFTER=false
[[ "${1:-}" == "--stop" ]] && STOP_AFTER=true

echo ""
echo -e "${BOLD}========================================"
echo "  AGORAFI Integration Tests"
echo -e "========================================${NC}"

check_dependencies
ensure_services

TOTAL_PASS=0
TOTAL_FAIL=0
SUITES_FAILED=0

run_suite() {
  local name="$1" script="$2"
  echo ""
  echo -e "${BOLD}--- $name ---${NC}"

  # Run in a subshell so counters are isolated per suite
  if bash "$script"; then
    return 0
  else
    return 1
  fi
}

if run_suite "Spaces Service"      "$SCRIPT_DIR/test-spaces.sh"; then true
else SUITES_FAILED=$((SUITES_FAILED + 1)); fi

if run_suite "Marketplace Service" "$SCRIPT_DIR/test-marketplace.sh"; then true
else SUITES_FAILED=$((SUITES_FAILED + 1)); fi

echo ""
echo -e "${BOLD}========================================${NC}"
if [ "$SUITES_FAILED" -eq 0 ]; then
  echo -e "  ${GREEN}All integration test suites passed.${NC}"
else
  echo -e "  ${RED}${SUITES_FAILED} suite(s) had failures.${NC}"
fi
echo -e "${BOLD}========================================${NC}"

if [ "$STOP_AFTER" = true ]; then
  stop_services
fi

[ "$SUITES_FAILED" -eq 0 ]
