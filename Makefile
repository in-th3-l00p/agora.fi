# agora.fi — local development orchestration
# Usage: make dev    (start everything)
#        make stop   (stop anvil)
#        make clean  (wipe local state)

include testnet.conf

.PHONY: dev anvil deploy dev-webapp stop clean

# ── Full dev stack ──────────────────────────────────────────────

dev: anvil deploy dev-webapp

# ── Anvil (local testnet) ──────────────────────────────────────

anvil:
	@mkdir -p $(STATE_DIR)
	@if [ -f $(STATE_DIR)/anvil.pid ] && kill -0 $$(cat $(STATE_DIR)/anvil.pid) 2>/dev/null; then \
		echo "anvil already running (PID $$(cat $(STATE_DIR)/anvil.pid))"; \
	else \
		LOAD_FLAG=""; \
		if [ -f $(STATE_FILE) ]; then \
			LOAD_FLAG="--load-state $(STATE_FILE)"; \
			echo "Loading persisted state from $(STATE_FILE)"; \
		fi; \
		anvil \
			--mnemonic "$(MNEMONIC)" \
			--chain-id $(CHAIN_ID) \
			--port $(PORT) \
			--block-time $(BLOCK_TIME) \
			--accounts $(ACCOUNTS) \
			--balance $(BALANCE) \
			--dump-state $(STATE_FILE) \
			$$LOAD_FLAG \
			> $(STATE_DIR)/anvil.log 2>&1 & \
		echo $$! > $(STATE_DIR)/anvil.pid; \
		echo "anvil started (PID $$!, chain $(CHAIN_ID), port $(PORT))"; \
		sleep 1; \
	fi

# ── Deploy contracts ──────────────────────────────────────────

deploy:
	@if [ -f $(STATE_FILE) ] && [ -f deployments/local.json ]; then \
		echo "Contracts already deployed (state + artifact exist). Run 'make clean' to redeploy."; \
	else \
		echo "Deploying contracts to local testnet..."; \
		cd web3 && forge script script/DeployAgoraTile.s.sol:DeployAgoraTile \
			--rpc-url http://127.0.0.1:$(PORT) \
			--private-key $(DEPLOYER_PRIVATE_KEY) \
			--broadcast; \
		cd .. && ./scripts/write-deploy-artifacts.sh; \
	fi

# ── Webapp dev server ─────────────────────────────────────────

dev-webapp:
	cd webapp && npm run dev

# ── Lifecycle ──────────────────────────────────────────────────

stop:
	@if [ -f $(STATE_DIR)/anvil.pid ]; then \
		PID=$$(cat $(STATE_DIR)/anvil.pid); \
		if kill -0 $$PID 2>/dev/null; then \
			kill $$PID; \
			echo "anvil stopped (PID $$PID)"; \
		else \
			echo "anvil process (PID $$PID) not running"; \
		fi; \
		rm -f $(STATE_DIR)/anvil.pid; \
	else \
		echo "No anvil PID file found"; \
	fi

clean: stop
	rm -rf $(STATE_DIR)
	rm -f deployments/local.json
	@echo "Local testnet state cleaned"
