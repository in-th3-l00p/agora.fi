#!/usr/bin/env node

// Usage: node sign.js <private-key> <message>
// Outputs the EIP-191 personal_sign signature to stdout.

const path = require('path');

// Resolve ethers from a sibling service's node_modules
const candidates = [
  path.join(__dirname, '../../spaces-service/node_modules/ethers'),
  path.join(__dirname, '../../marketplace-service/node_modules/ethers'),
];

let ethers;
for (const p of candidates) {
  try { ethers = require(p); break; } catch {}
}

if (!ethers) {
  process.stderr.write('Error: could not find ethers in any sibling service node_modules\n');
  process.exit(1);
}

const [,, privateKey, message] = process.argv;

if (!privateKey || !message) {
  process.stderr.write('Usage: node sign.js <private-key> <message>\n');
  process.exit(1);
}

const wallet = new ethers.Wallet(privateKey);
wallet.signMessage(message).then((sig) => process.stdout.write(sig));
