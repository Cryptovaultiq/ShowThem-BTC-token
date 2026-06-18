#!/usr/bin/env python3
"""
Search with different OpenZeppelin versions
"""

import json
import subprocess
import hashlib
import re
import sys
from pathlib import Path

DEPLOYED_HASH = "167e9995d5c06f00db508e5a2c564b36c9ce2e71270a4f2a7b3ecb6801e52927"

print("=" * 80)
print("SEARCHING WITH DIFFERENT OPENZEPPELIN VERSIONS")
print("=" * 80)

# Try different combinations
versions_to_try = [
    ("0.8.20", "4.9.3"),
    ("0.8.20", "4.9.2"),
    ("0.8.20", "4.9.1"),
    ("0.8.20", "4.9.0"),
    ("0.8.20", "4.8.3"),
    ("0.8.19", "4.9.3"),
    ("0.8.21", "4.9.3"),
    ("0.8.20", "5.0.0"),  # Current
]

original_config = Path("hardhat.config.js").read_text()

for compiler_v, oz_v in versions_to_try:
    print(f"\n[Testing] Solidity {compiler_v} + OpenZeppelin {oz_v}")
    
    try:
        # Install OpenZeppelin version
        print(f"  Installing @openzeppelin/contracts@{oz_v}...")
        result = subprocess.run(
            ["npm", "install", f"@openzeppelin/contracts@{oz_v}"],
            capture_output=True,
            timeout=120,
            text=True
        )
        
        if result.returncode != 0:
            print(f"  ❌ Install failed")
            continue
        
        # Update compiler version
        new_config = re.sub(
            r'version:\s*"[^"]+',
            f'version: "{compiler_v}',
            original_config
        )
        Path("hardhat.config.js").write_text(new_config)
        
        # Compile
        print(f"  Compiling...")
        result = subprocess.run(
            ["npx", "hardhat", "compile", "--force"],
            capture_output=True,
            timeout=60,
            text=True
        )
        
        if result.returncode != 0:
            print(f"  ❌ Compilation failed")
            continue
        
        # Check bytecode
        with open('artifacts/contracts/ethereum/FakeBTC.sol/FakeBTC.json', 'r') as f:
            artifact = json.load(f)
        
        bytecode = artifact.get('bytecode', '')
        if bytecode.startswith('0x'):
            bytecode = bytecode[2:]
        
        bytecode_hash = hashlib.sha256(bytecode.encode()).hexdigest()
        bytecode_size = len(bytecode) // 2
        
        print(f"  Size: {bytecode_size} bytes, Hash: {bytecode_hash[:16]}...")
        
        if bytecode_hash == DEPLOYED_HASH:
            print(f"\n✅ MATCH FOUND!")
            print(f"   Solidity: {compiler_v}")
            print(f"   OpenZeppelin: {oz_v}")
            print(f"   Bytecode size: {bytecode_size} bytes")
            exit(0)
    
    except Exception as e:
        print(f"  ❌ Error: {e}")

# Restore
Path("hardhat.config.js").write_text(original_config)

print(f"\n⚠️  No matches found with tested versions")
print(f"\nNext steps:")
print(f"  - Check git log for exact deployment command")
print(f"  - Look for deployment scripts or artifacts")
print(f"  - Consider accepting unverified status or redeploying")
