#!/usr/bin/env bash
# Integration tests for spaces-service.
# Can run standalone or via run-all.sh.

source "$(dirname "$0")/shared.sh"

check_dependencies
ensure_services

SPACE_ID="${RUN_ID}-space"
TOKEN_1=""
TOKEN_2=""

# ─────────────────────────────────────────────────────────────────────────────
log_header "Spaces Service — Health"

http GET "$SPACES_URL/health"
assert_eq   "GET /health returns 200"       "200" "$STATUS"
assert_json "health status is ok"           "$BODY" ".status"  "ok"
assert_json "service name is spaces-service" "$BODY" ".service" "spaces-service"

# ─────────────────────────────────────────────────────────────────────────────
log_header "Spaces Service — Auth"

TOKEN_1=$(get_auth_token "$SPACES_URL" "$WALLET_KEY_1" "$WALLET_ADDR_1")
assert_not_empty "Wallet 1 receives a JWT" "$TOKEN_1"

TOKEN_2=$(get_auth_token "$SPACES_URL" "$WALLET_KEY_2" "$WALLET_ADDR_2")
assert_not_empty "Wallet 2 receives a JWT" "$TOKEN_2"

http POST "$SPACES_URL/spaces" \
  -H "Content-Type: application/json" \
  -d '{"spaceId":"no-auth","name":"x"}'
assert_eq "Request without token returns 401" "401" "$STATUS"

http POST "$SPACES_URL/spaces" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer bad-token" \
  -d '{"spaceId":"no-auth","name":"x"}'
assert_eq "Request with bad token returns 401" "401" "$STATUS"

# ─────────────────────────────────────────────────────────────────────────────
log_header "Spaces Service — Create Space"

http POST "$SPACES_URL/spaces" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_1" \
  -d "$(jq -n --arg id "$SPACE_ID" '{
    spaceId:     $id,
    name:        "Integration Test Space",
    description: "Created by integration tests",
    maxTiles:    50,
    tokenName:   "IntgToken",
    tokenSymbol: "INTG",
    settings:    { governance: true }
  }')"
assert_eq   "POST /spaces returns 201"     "201"           "$STATUS"
assert_json "space_id matches"              "$BODY" ".space_id"     "$SPACE_ID"
assert_json "name matches"                  "$BODY" ".name"         "Integration Test Space"
assert_json "max_tiles matches"             "$BODY" ".max_tiles"    "50"
assert_json "owner is wallet 1"             "$BODY" ".owner_wallet" "$(echo "$WALLET_ADDR_1" | tr '[:upper:]' '[:lower:]')"

SPACE_UUID=$(echo "$BODY" | jq -r '.id')

# Duplicate should fail
http POST "$SPACES_URL/spaces" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_1" \
  -d "$(jq -n --arg id "$SPACE_ID" '{spaceId: $id, name: "Dup"}')"
assert_eq "Duplicate space_id returns 409" "409" "$STATUS"

# ─────────────────────────────────────────────────────────────────────────────
log_header "Spaces Service — Read Spaces"

http GET "$SPACES_URL/spaces"
assert_eq "GET /spaces returns 200" "200" "$STATUS"
assert_json_contains "List includes our space" "$BODY" ".[].space_id" "$SPACE_ID"

http GET "$SPACES_URL/spaces/$SPACE_ID"
assert_eq   "GET /spaces/:id returns 200"  "200"           "$STATUS"
assert_json "Detail has correct name"       "$BODY" ".name" "Integration Test Space"
assert_json "tile_count starts at 0"        "$BODY" ".tile_count" "0"

http GET "$SPACES_URL/spaces/nonexistent-space-xyz"
assert_eq "Non-existent space returns 404" "404" "$STATUS"

# ─────────────────────────────────────────────────────────────────────────────
log_header "Spaces Service — Update Space"

http PUT "$SPACES_URL/spaces/$SPACE_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_1" \
  -d '{"name": "Updated Space Name", "description": "Updated description"}'
assert_eq   "PUT /spaces/:id returns 200"     "200"                "$STATUS"
assert_json "Name updated"                     "$BODY" ".name"        "Updated Space Name"
assert_json "Description updated"              "$BODY" ".description" "Updated description"

# Non-owner cannot update
http PUT "$SPACES_URL/spaces/$SPACE_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_2" \
  -d '{"name": "Hacked"}'
assert_eq "Non-owner update returns 403" "403" "$STATUS"

# ─────────────────────────────────────────────────────────────────────────────
log_header "Spaces Service — Tiles"

http POST "$SPACES_URL/spaces/$SPACE_ID/tiles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_1" \
  -d '{"tokenId": 0, "gridPosition": 0, "tier": 1, "metadata": {"name": "HQ"}}'
assert_eq   "Create tile returns 201"    "201" "$STATUS"
assert_json "tile token_id is 0"         "$BODY" ".token_id"      "0"
assert_json "tile tier is 1"             "$BODY" ".tier"           "1"
assert_json "tile metadata.name is HQ"   "$BODY" ".metadata.name" "HQ"

http POST "$SPACES_URL/spaces/$SPACE_ID/tiles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_1" \
  -d '{"tokenId": 1, "gridPosition": 1, "tier": 3}'
assert_eq "Create second tile returns 201" "201" "$STATUS"

http GET "$SPACES_URL/spaces/$SPACE_ID/tiles"
assert_eq "GET tiles returns 200" "200" "$STATUS"
TILE_COUNT=$(echo "$BODY" | jq 'length')
assert_eq "Two tiles in space" "2" "$TILE_COUNT"

http GET "$SPACES_URL/spaces/$SPACE_ID/tiles/0"
assert_eq   "GET tile by tokenId returns 200" "200" "$STATUS"
assert_json "Correct token_id"                 "$BODY" ".token_id" "0"

# Update tile
http PUT "$SPACES_URL/spaces/$SPACE_ID/tiles/0" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_1" \
  -d '{"tier": 5, "metadata": {"name": "HQ Upgraded"}}'
assert_eq   "Update tile returns 200"  "200"          "$STATUS"
assert_json "Tier updated to 5"        "$BODY" ".tier" "5"

# Non-owner cannot manage tiles
http POST "$SPACES_URL/spaces/$SPACE_ID/tiles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_2" \
  -d '{"tokenId": 99, "gridPosition": 99}'
assert_eq "Non-owner tile create returns 403" "403" "$STATUS"

# Delete tile
http DELETE "$SPACES_URL/spaces/$SPACE_ID/tiles/1" \
  -H "Authorization: Bearer $TOKEN_1"
assert_eq "Delete tile returns 204" "204" "$STATUS"

http GET "$SPACES_URL/spaces/$SPACE_ID/tiles/1"
assert_eq "Deleted tile returns 404" "404" "$STATUS"

# Verify tile count via space detail
http GET "$SPACES_URL/spaces/$SPACE_ID"
assert_json "tile_count is now 1" "$BODY" ".tile_count" "1"

# ─────────────────────────────────────────────────────────────────────────────
log_header "Spaces Service — Delete Space"

http DELETE "$SPACES_URL/spaces/$SPACE_ID" \
  -H "Authorization: Bearer $TOKEN_1"
assert_eq "Delete space returns 204" "204" "$STATUS"

http GET "$SPACES_URL/spaces/$SPACE_ID"
assert_eq "Deleted space returns 404" "404" "$STATUS"

# Tiles cascade-deleted — the space is gone so tiles endpoint returns 404
http GET "$SPACES_URL/spaces/$SPACE_ID/tiles"
assert_eq "Tiles of deleted space return 404" "404" "$STATUS"

# ─────────────────────────────────────────────────────────────────────────────
print_summary
