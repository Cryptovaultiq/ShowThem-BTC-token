#!/usr/bin/env python3
"""
Bytecode matching script - systematically tries different compiler and dependency versions
to find the exact match with the deployed contract.
"""

import json
import subprocess
import hashlib
import sys
from pathlib import Path

DEPLOYED_ADDRESS = "0x4B09e895699593c5e427CF8eA7Be550273989aa4"
CURRENT_BYTECODE_HASH = "621f31d3c5ec2d77dfa3fe860ca264ed564fb4a82790cdc9acad2a4e499382b5"

# Compiler versions to try (around 0.8.20)
COMPILER_VERSIONS = [
    "0.8.20",
    "0.8.19",
    "0.8.21",
    "0.8.18",
    "0.8.22",
    "0.8.17",
]

# OpenZeppelin versions to try
OPENZEPPELIN_VERSIONS = [
    "5.0.0",
    "4.9.3",
    "4.9.2",
    "4.9.1",
    "4.9.0",
    "4.8.3",
    "4.8.2",
    "4.8.1",
]

def get_current_bytecode():
    """Extract bytecode from compiled artifact"""
    artifact_path = Path("artifacts/contracts/ethereum/FakeBTC.sol/FakeBTC.json")
    if not artifact_path.exists():
        return None
    
    with open(artifact_path, 'r') as f:
        data = json.load(f)
    
    bytecode = data.get('bytecode', '')
    if bytecode.startswith('0x'):
        bytecode = bytecode[2:]
    
    return bytecode

def get_bytecode_hash(bytecode):
    """Get SHA256 hash of bytecode"""
    return hashlib.sha256(bytecode.encode()).hexdigest()

def test_combination(compiler_version, openzeppelin_version):
    """Test a specific compiler and OpenZeppelin combination"""
    print(f"\n[Testing] Solidity {compiler_version} + OpenZeppelin {openzeppelin_version}")
    
    try:
        # Update package.json
        subprocess.run(
            ["npm", "install", f"@openzeppelin/contracts@{openzeppelin_version}"],
            capture_output=True,
            timeout=60,
            check=False
        )
        
        # Update hardhat.config.js
        with open("hardhat.config.js", 'r') as f:
            config = f.read()
        
        # Update compiler version in config
        import re
        new_config = re.sub(
            r'version:\s*"[^"]+',
            f'version: "{compiler_version}',
            config
        )
        
        with open("hardhat.config.js", 'w') as f:
            f.write(new_config)
        
        # Compile
        result = subprocess.run(
            ["npx", "hardhat", "compile", "--force"],
            capture_output=True,
            timeout=60,
            text=True
        )
        
        if result.returncode != 0:
            print(f"  ❌ Compilation failed")
            return None
        
        # Get bytecode
        bytecode = get_current_bytecode()
        if not bytecode:
            print(f"  ❌ Could not extract bytecode")
            return None
        
        bytecode_hash = get_bytecode_hash(bytecode)
        bytecode_len = len(bytecode) // 2
        
        print(f"  Bytecode: {bytecode_len} bytes, Hash: {bytecode_hash[:16]}...")
        
        return {
            'compiler': compiler_version,
            'openzeppelin': openzeppelin_version,
            'bytecode': bytecode,
            'hash': bytecode_hash,
            'length': bytecode_len
        }
    
    except subprocess.TimeoutExpired:
        print(f"  ❌ Timeout")
        return None
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return None

def main():
    print("=" * 70)
    print("FakeBTC Bytecode Matcher - Searching for exact deployment configuration")
    print("=" * 70)
    
    print(f"\nCurrent bytecode hash: {CURRENT_BYTECODE_HASH[:32]}...")
    print(f"Combinations to test: {len(COMPILER_VERSIONS) * len(OPENZEPPELIN_VERSIONS)}")
    
    results = []
    matches = []
    
    for compiler in COMPILER_VERSIONS:
        for openzeppelin in OPENZEPPELIN_VERSIONS:
            result = test_combination(compiler, openzeppelin)
            if result:
                results.append(result)
                if result['hash'] == CURRENT_BYTECODE_HASH:
                    print(f"\n  🎉 MATCH FOUND!")
                    matches.append(result)
    
    print("\n" + "=" * 70)
    print("RESULTS SUMMARY")
    print("=" * 70)
    
    if matches:
        print(f"\n✅ Found {len(matches)} matching configuration(s):\n")
        for match in matches:
            print(f"  Solidity: {match['compiler']}")
            print(f"  OpenZeppelin: {match['openzeppelin']}")
            print(f"  Bytecode size: {match['length']} bytes")
            print()
    else:
        print("\n❌ No matches found in tested combinations")
        print("\nTested:")
        for result in results:
            print(f"  {result['compiler']} + {result['openzeppelin']}: {result['length']} bytes")
    
    print("=" * 70)

if __name__ == "__main__":
    main()
