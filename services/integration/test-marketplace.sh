#!/usr/bin/env bash
# Integration tests for marketplace-service.
# Can run standalone or via run-all.sh.

source "$(dirname "$0")/shared.sh"

check_dependencies
ensure_services

SPACE_ID="${RUN_ID}-mkt"
SELLER_TOKEN=""
BUYER_TOKEN=""

# ─────────────────────────────────────────────────────────────────────────────
log_header "Marketplace Service — Health"

http GET "$MARKETPLACE_URL/health"
assert_eq   "GET /health returns 200"            "200" "$STATUS"
assert_json "service is marketplace-service"     "$BODY" ".service" "marketplace-service"

# ─────────────────────────────────────────────────────────────────────────────
log_header "Marketplace Service — Auth"

SELLER_TOKEN=$(get_auth_token "$MARKETPLACE_URL" "$WALLET_KEY_1" "$WALLET_ADDR_1")
assert_not_empty "Seller receives a JWT" "$SELLER_TOKEN"

BUYER_TOKEN=$(get_auth_token "$MARKETPLACE_URL" "$WALLET_KEY_2" "$WALLET_ADDR_2")
assert_not_empty "Buyer receives a JWT" "$BUYER_TOKEN"

# ─────────────────────────────────────────────────────────────────────────────
log_header "Marketplace Service — Create Listing"

http POST "$MARKETPLACE_URL/listings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d "$(jq -n --arg sp "$SPACE_ID" '{
    spaceId:  $sp,
    tokenId:  1,
    price:    "0.08",
    currency: "ETH"
  }')"
assert_eq   "POST /listings returns 201"   "201"      "$STATUS"
assert_json "listing space_id matches"     "$BODY" ".space_id"      "$SPACE_ID"
assert_json "listing token_id is 1"        "$BODY" ".token_id"      "1"
assert_json "listing status is active"     "$BODY" ".status"        "active"
assert_json "seller is wallet 1"           "$BODY" ".seller_wallet" "$(echo "$WALLET_ADDR_1" | tr '[:upper:]' '[:lower:]')"

LISTING_ID=$(echo "$BODY" | jq -r '.id')

# Duplicate active listing for same tile should fail
http POST "$MARKETPLACE_URL/listings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d "$(jq -n --arg sp "$SPACE_ID" '{spaceId: $sp, tokenId: 1, price: "0.1"}')"
assert_eq "Duplicate active listing returns 409" "409" "$STATUS"

# ─────────────────────────────────────────────────────────────────────────────
log_header "Marketplace Service — Read Listings"

http GET "$MARKETPLACE_URL/listings"
assert_eq "GET /listings returns 200" "200" "$STATUS"
LIST_LEN=$(echo "$BODY" | jq 'length')
assert_not_empty "Listings list is not empty" "$LIST_LEN"

http GET "$MARKETPLACE_URL/listings?spaceId=$SPACE_ID"
assert_eq "Filter by spaceId returns 200" "200" "$STATUS"
assert_json "Filtered listing has correct space" "$BODY" ".[0].space_id" "$SPACE_ID"

http GET "$MARKETPLACE_URL/listings/$LISTING_ID"
assert_eq   "GET /listings/:id returns 200"  "200"         "$STATUS"
assert_json "Listing ID matches"             "$BODY" ".id"  "$LISTING_ID"

http GET "$MARKETPLACE_URL/listings/00000000-0000-0000-0000-000000000000"
assert_eq "Non-existent listing returns 404" "404" "$STATUS"

# ─────────────────────────────────────────────────────────────────────────────
log_header "Marketplace Service — Update Listing"

http PATCH "$MARKETPLACE_URL/listings/$LISTING_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d '{"price": "0.12"}'
assert_eq   "PATCH listing returns 200"  "200" "$STATUS"
assert_json_contains "Price updated"     "$BODY" ".price" "0.12"

# Non-seller cannot update
http PATCH "$MARKETPLACE_URL/listings/$LISTING_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d '{"price": "0.01"}'
assert_eq "Non-seller update returns 403" "403" "$STATUS"

# ─────────────────────────────────────────────────────────────────────────────
log_header "Marketplace Service — Offers"

EXPIRES=$(date -u -v+7d +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null \
       || date -u -d "+7 days" +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null)

http POST "$MARKETPLACE_URL/offers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d "$(jq -n --arg lid "$LISTING_ID" --arg exp "$EXPIRES" '{
    listingId: $lid,
    amount:    "0.06",
    currency:  "ETH",
    expiresAt: $exp
  }')"
assert_eq   "POST /offers returns 201"      "201"     "$STATUS"
assert_json "offer status is pending"        "$BODY" ".status"         "pending"
assert_json "offer listing_id matches"       "$BODY" ".listing_id"     "$LISTING_ID"
assert_json "offerer is wallet 2"            "$BODY" ".offerer_wallet" "$(echo "$WALLET_ADDR_2" | tr '[:upper:]' '[:lower:]')"

OFFER_ID=$(echo "$BODY" | jq -r '.id')

# Seller cannot offer on own listing
http POST "$MARKETPLACE_URL/offers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d "$(jq -n --arg lid "$LISTING_ID" --arg exp "$EXPIRES" '{
    listingId: $lid, amount: "0.05", expiresAt: $exp
  }')"
assert_eq "Self-offer returns 400" "400" "$STATUS"

# List offers for the listing
http GET "$MARKETPLACE_URL/offers?listingId=$LISTING_ID"
assert_eq "GET /offers filtered returns 200" "200" "$STATUS"
OFFER_COUNT=$(echo "$BODY" | jq 'length')
assert_eq "One offer on this listing" "1" "$OFFER_COUNT"

# Get single offer
http GET "$MARKETPLACE_URL/offers/$OFFER_ID"
assert_eq   "GET /offers/:id returns 200" "200"     "$STATUS"
assert_json "Offer ID matches"            "$BODY" ".id" "$OFFER_ID"

# ─────────────────────────────────────────────────────────────────────────────
log_header "Marketplace Service — Reject Offer"

http POST "$MARKETPLACE_URL/offers/$OFFER_ID/reject" \
  -H "Authorization: Bearer $SELLER_TOKEN"
assert_eq   "POST reject returns 200"      "200"      "$STATUS"
assert_json "Offer status is rejected"     "$BODY" ".status" "rejected"

# ─────────────────────────────────────────────────────────────────────────────
log_header "Marketplace Service — Accept Offer"

# Create a fresh offer to accept
http POST "$MARKETPLACE_URL/offers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d "$(jq -n --arg lid "$LISTING_ID" --arg exp "$EXPIRES" '{
    listingId: $lid, amount: "0.10", expiresAt: $exp
  }')"
assert_eq "New offer created" "201" "$STATUS"
OFFER_ID_2=$(echo "$BODY" | jq -r '.id')

# Non-seller cannot accept
http POST "$MARKETPLACE_URL/offers/$OFFER_ID_2/accept" \
  -H "Authorization: Bearer $BUYER_TOKEN"
assert_eq "Non-seller accept returns 403" "403" "$STATUS"

# Seller accepts
http POST "$MARKETPLACE_URL/offers/$OFFER_ID_2/accept" \
  -H "Authorization: Bearer $SELLER_TOKEN"
assert_eq   "Seller accept returns 200"     "200"      "$STATUS"
assert_json "Offer status is accepted"      "$BODY" ".status" "accepted"

# Listing should now be sold
http GET "$MARKETPLACE_URL/listings/$LISTING_ID"
assert_json "Listing status is sold"        "$BODY" ".status"       "sold"
assert_json "Buyer recorded on listing"     "$BODY" ".buyer_wallet" "$(echo "$WALLET_ADDR_2" | tr '[:upper:]' '[:lower:]')"

# ─────────────────────────────────────────────────────────────────────────────
log_header "Marketplace Service — Direct Purchase"

# Create a new listing for the purchase flow
http POST "$MARKETPLACE_URL/listings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d "$(jq -n --arg sp "$SPACE_ID" '{spaceId: $sp, tokenId: 2, price: "0.25"}')"
assert_eq "New listing for purchase test" "201" "$STATUS"
LISTING_ID_2=$(echo "$BODY" | jq -r '.id')

# Self-purchase blocked
http POST "$MARKETPLACE_URL/listings/$LISTING_ID_2/purchase" \
  -H "Authorization: Bearer $SELLER_TOKEN"
assert_eq "Self-purchase returns 400" "400" "$STATUS"

# Buyer purchases
http POST "$MARKETPLACE_URL/listings/$LISTING_ID_2/purchase" \
  -H "Authorization: Bearer $BUYER_TOKEN"
assert_eq   "Purchase returns 200"             "200"    "$STATUS"
assert_json "Listing status is sold"           "$BODY" ".status"       "sold"
assert_json "Buyer wallet recorded"            "$BODY" ".buyer_wallet" "$(echo "$WALLET_ADDR_2" | tr '[:upper:]' '[:lower:]')"
assert_not_empty "sold_at timestamp set"       "$(echo "$BODY" | jq -r '.sold_at')"

# Cannot purchase again
http POST "$MARKETPLACE_URL/listings/$LISTING_ID_2/purchase" \
  -H "Authorization: Bearer $BUYER_TOKEN"
assert_eq "Double-purchase returns 400" "400" "$STATUS"

# ─────────────────────────────────────────────────────────────────────────────
log_header "Marketplace Service — Cancel Listing"

http POST "$MARKETPLACE_URL/listings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -d "$(jq -n --arg sp "$SPACE_ID" '{spaceId: $sp, tokenId: 3, price: "0.5"}')"
LISTING_ID_3=$(echo "$BODY" | jq -r '.id')

# Non-seller cannot cancel
http DELETE "$MARKETPLACE_URL/listings/$LISTING_ID_3" \
  -H "Authorization: Bearer $BUYER_TOKEN"
assert_eq "Non-seller cancel returns 403" "403" "$STATUS"

# Seller cancels
http DELETE "$MARKETPLACE_URL/listings/$LISTING_ID_3" \
  -H "Authorization: Bearer $SELLER_TOKEN"
assert_eq   "DELETE listing returns 200"      "200"        "$STATUS"
assert_json "Listing status is cancelled"     "$BODY" ".status" "cancelled"

# ─────────────────────────────────────────────────────────────────────────────
print_summary
