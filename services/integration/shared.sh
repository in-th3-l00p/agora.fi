#!/usr/bin/env bash
# shared.sh — Common functions for AGORAFI integration tests.
# Source this file from test scripts: source "$(dirname "$0")/shared.sh"

set -euo pipefail

# ── Paths ────────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# ── Service URLs ─────────────────────────────────────────────────────────────
SPACES_URL="${SPACES_URL:-http://localhost:4000}"
MARKETPLACE_URL="${MARKETPLACE_URL:-http://localhost:4001}"

# ── Test wallets (Hardhat default accounts — NOT for production) ─────────────
WALLET_KEY_1="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
WALLET_ADDR_1="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

WALLET_KEY_2="0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
WALLET_ADDR_2="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"

# Unique per-run ID to avoid collisions between test runs
RUN_ID="intg-$(date +%s)"

# ── Colours ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ── Counters ─────────────────────────────────────────────────────────────────
PASS_COUNT=0
FAIL_COUNT=0

# ── Logging ──────────────────────────────────────────────────────────────────
log_info()   { echo -e "  ${CYAN}[info]${NC}  $1"; }
log_pass()   { echo -e "  ${GREEN}[pass]${NC}  $1"; PASS_COUNT=$((PASS_COUNT + 1)); }
log_fail()   { echo -e "  ${RED}[FAIL]${NC}  $1"; FAIL_COUNT=$((FAIL_COUNT + 1)); }
log_header() { echo -e "\n${BOLD}$1${NC}"; }

# ── Dependency check ─────────────────────────────────────────────────────────
check_dependencies() {
  local ok=1
  for cmd in curl jq docker; do
    if ! command -v "$cmd" &>/dev/null; then
      echo "Missing required command: $cmd" >&2; ok=0
    fi
  done
  if ! command -v cast &>/dev/null && ! command -v node &>/dev/null; then
    echo "Either 'cast' (Foundry) or 'node' is required for message signing" >&2; ok=0
  fi
  [ "$ok" -eq 1 ] || exit 1
}

# ── Docker helpers ───────────────────────────────────────────────────────────
ensure_services() {
  log_info "Checking service health..."

  if curl -sf "$SPACES_URL/health" &>/dev/null \
  && curl -sf "$MARKETPLACE_URL/health" &>/dev/null; then
    log_info "All services already healthy"
    return 0
  fi

  log_info "Starting services via docker compose..."
  (cd "$COMPOSE_DIR" && docker compose up -d --build --quiet-pull) 2>&1 | while read -r line; do
    log_info "$line"
  done

  wait_for_health "$SPACES_URL"  "spaces-service"
  wait_for_health "$MARKETPLACE_URL" "marketplace-service"
  log_info "All services healthy"
}

wait_for_health() {
  local url="$1" name="$2" retries=30
  while [ "$retries" -gt 0 ]; do
    if curl -sf "$url/health" &>/dev/null; then return 0; fi
    retries=$((retries - 1))
    sleep 1
  done
  log_fail "$name did not become healthy within 30 s"
  return 1
}

stop_services() {
  log_info "Stopping services..."
  (cd "$COMPOSE_DIR" && docker compose down) 2>/dev/null
}

# ── HTTP helper ──────────────────────────────────────────────────────────────
# Usage:  http <METHOD> <URL> [curl flags…]
# Sets globals:  BODY  STATUS
BODY=""
STATUS=""

http() {
  local method="$1" url="$2"; shift 2
  local tmp; tmp=$(mktemp)
  STATUS=$(curl -s -o "$tmp" -w "%{http_code}" -X "$method" "$url" "$@") || true
  BODY=$(<"$tmp")
  rm -f "$tmp"
}

# ── Assertions ───────────────────────────────────────────────────────────────
assert_eq() {
  local desc="$1" expected="$2" actual="$3"
  if [ "$expected" = "$actual" ]; then log_pass "$desc"
  else log_fail "$desc — expected '$expected', got '$actual'"; fi
}

assert_not_empty() {
  local desc="$1" value="$2"
  if [ -n "$value" ] && [ "$value" != "null" ]; then log_pass "$desc"
  else log_fail "$desc — value is empty or null"; fi
}

assert_json() {
  local desc="$1" json="$2" path="$3" expected="$4"
  local actual
  actual=$(echo "$json" | jq -r "$path" 2>/dev/null)
  if [ "$expected" = "$actual" ]; then log_pass "$desc"
  else log_fail "$desc — at '$path': expected '$expected', got '$actual'"; fi
}

assert_json_contains() {
  local desc="$1" json="$2" path="$3" substring="$4"
  local actual
  actual=$(echo "$json" | jq -r "$path" 2>/dev/null)
  if echo "$actual" | grep -q "$substring" 2>/dev/null; then log_pass "$desc"
  else log_fail "$desc — at '$path': expected to contain '$substring', got '$actual'"; fi
}

# ── Wallet auth ──────────────────────────────────────────────────────────────
# Signs a plain-text message with EIP-191 personal_sign.
sign_message() {
  local private_key="$1" message="$2"
  if command -v cast &>/dev/null; then
    cast wallet sign --private-key "$private_key" "$message" 2>/dev/null | tr -d '\n'
  else
    node "$SCRIPT_DIR/helpers/sign.js" "$private_key" "$message"
  fi
}

# Full auth flow: nonce → sign → verify → JWT.
# Prints the JWT token to stdout.
get_auth_token() {
  local service_url="$1" private_key="$2" address="$3"

  # 1. request nonce
  local nonce
  nonce=$(curl -sf "$service_url/auth/nonce?address=$address" | jq -r '.nonce')
  if [ -z "$nonce" ] || [ "$nonce" = "null" ]; then echo ""; return 1; fi

  # 2. sign challenge
  local message
  message=$(printf 'Sign this message to authenticate with AGORAFI.\n\nNonce: %s' "$nonce")

  local signature
  signature=$(sign_message "$private_key" "$message")
  if [ -z "$signature" ]; then echo ""; return 1; fi

  # 3. verify → JWT
  local token
  token=$(curl -sf -X POST "$service_url/auth/verify" \
    -H "Content-Type: application/json" \
    -d "$(jq -n --arg a "$address" --arg s "$signature" \
         '{address: $a, signature: $s}')" \
    | jq -r '.token')

  echo "$token"
}

# ── Summary ──────────────────────────────────────────────────────────────────
print_summary() {
  local total=$((PASS_COUNT + FAIL_COUNT))
  echo ""
  echo -e "${BOLD}Results: ${GREEN}${PASS_COUNT} passed${NC}, ${RED}${FAIL_COUNT} failed${NC}, ${total} total${NC}"
  [ "$FAIL_COUNT" -eq 0 ]
}
