#!/usr/bin/env python3
"""
Brute-force search for exact compiler configuration matching deployed bytecode
"""

import json
import subprocess
import hashlib
import re
import sys
from pathlib import Path

DEPLOYED_HASH = "167e9995d5c06f00db508e5a2c564b36c9ce2e71270a4f2a7b3ecb6801e52927"
DEPLOYED_SIZE = 6916

print("=" * 80)
print("BRUTE-FORCE COMPILER CONFIGURATION SEARCH")
print("=" * 80)
print(f"\nTarget: {DEPLOYED_HASH}")
print(f"Target size: {DEPLOYED_SIZE} bytes\n")

# Different configurations to try
configs = []

# Try different optimizer runs
for solc_version in ["0.8.20", "0.8.19", "0.8.21", "0.8.18", "0.8.22"]:
    for optimizer_runs in [100, 150, 200, 300, 400, 500, 800, 1000]:
        configs.append({
            'version': solc_version,
            'runs': optimizer_runs,
            'enabled': True
        })

print(f"Testing {len(configs)} configurations...\n")

# Save original config
original_config = Path("hardhat.config.js").read_text()
original_package = Path("package.json").read_text()

matches = []

for i, config in enumerate(configs):
    sys.stdout.write(f"\r[{i+1}/{len(configs)}] Testing {config['version']} with {config['runs']} runs...")
    sys.stdout.flush()
    
    try:
        # Update hardhat.config.js
        new_config = re.sub(
            r'version:\s*"[^"]+',
            f'version: "{config["version"]}',
            original_config
        )
        new_config = re.sub(
            r'runs:\s*\d+',
            f'runs: {config["runs"]}',
            new_config
        )
        Path("hardhat.config.js").write_text(new_config)
        
        # Compile
        result = subprocess.run(
            ["npx", "hardhat", "compile", "--force"],
            capture_output=True,
            timeout=60,
            text=True
        )
        
        if result.returncode != 0:
            continue
        
        # Extract bytecode
        with open('artifacts/contracts/ethereum/FakeBTC.sol/FakeBTC.json', 'r') as f:
            artifact = json.load(f)
        
        bytecode = artifact.get('bytecode', '')
        if bytecode.startswith('0x'):
            bytecode = bytecode[2:]
        
        bytecode_hash = hashlib.sha256(bytecode.encode()).hexdigest()
        bytecode_size = len(bytecode) // 2
        
        if bytecode_hash == DEPLOYED_HASH:
            matches.append(config)
            print(f"\n\n✅ MATCH FOUND!")
            print(f"   Solidity: {config['version']}")
            print(f"   Optimizer runs: {config['runs']}")
            print(f"   Bytecode size: {bytecode_size} bytes")
            print(f"   Hash: {bytecode_hash}\n")
    
    except Exception as e:
        pass

# Restore original
Path("hardhat.config.js").write_text(original_config)

print("\n" + "=" * 80)
print("RESULTS")
print("=" * 80)

if matches:
    print(f"\n✅ Found {len(matches)} matching configuration(s):\n")
    for match in matches:
        print(f"   Solidity {match['version']} with {match['runs']} optimizer runs")
else:
    print(f"\n⚠️  No matches found in basic configurations")
    print(f"\nTrying might need:")
    print(f"  - Different OpenZeppelin version")
    print(f"  - Different compilation flags")
    print(f"  - Pre-release or nightly compiler version")

print("\n" + "=" * 80)
