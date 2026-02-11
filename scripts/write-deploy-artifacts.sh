#!/usr/bin/env bash
# Reads the Foundry broadcast log and writes deployments/local.json
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BROADCAST="$REPO_ROOT/web3/broadcast/DeployAgoraTile.s.sol/31337/run-latest.json"

if [ ! -f "$BROADCAST" ]; then
  echo "ERROR: Broadcast log not found at $BROADCAST"
  echo "       Did the deploy script run successfully?"
  exit 1
fi

python3 - "$BROADCAST" "$REPO_ROOT/deployments/local.json" <<'PYEOF'
import json, sys

broadcast_path = sys.argv[1]
output_path = sys.argv[2]

with open(broadcast_path) as f:
    data = json.load(f)

contracts = {}
deployer = None

for tx in data.get("transactions", []):
    if tx.get("transactionType") == "CREATE":
        name = tx.get("contractName")
        addr = tx.get("contractAddress")
        if name and addr:
            contracts[name] = addr
        if deployer is None:
            deployer = tx.get("transaction", {}).get("from")

if not contracts:
    print("ERROR: No CREATE transactions found in broadcast log", file=sys.stderr)
    sys.exit(1)

artifact = {
    "chainId": 31337,
    "rpcUrl": "http://127.0.0.1:8545",
    "deployer": deployer,
    "contracts": contracts,
}

with open(output_path, "w") as f:
    json.dump(artifact, f, indent=2)
    f.write("\n")

print(f"Wrote {output_path}")
for name, addr in contracts.items():
    print(f"  {name}: {addr}")
PYEOF
