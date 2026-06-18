#!/usr/bin/env python3
import json
import hashlib

# Read artifact
with open('artifacts/contracts/ethereum/SolanaToken.sol/SolanaToken.json', 'r') as f:
    artifact = json.load(f)

# Extract bytecode
bytecode = artifact.get('bytecode', '')
if bytecode.startswith('0x'):
    bytecode = bytecode[2:]

# Save bytecode
with open('SolanaToken_BYTECODE.txt', 'w') as f:
    f.write(bytecode)

# Calculate hash
bytecode_hash = hashlib.sha256(bytecode.encode()).hexdigest()

print('✅ Bytecode extracted')
print(f'   Length: {len(bytecode)} characters ({len(bytecode)//2} bytes)')
print(f'   SHA256 Hash: {bytecode_hash}')
print(f'   First 100 chars: {bytecode[:100]}...')
print(f'   Saved to: SolanaToken_BYTECODE.txt')

# Save ABI
abi = artifact.get('abi', [])
with open('SolanaToken_ABI.json', 'w') as f:
    json.dump(abi, f, indent=2)

function_count = len([x for x in abi if x.get('type') == 'function'])
print(f'\n✅ ABI extracted')
print(f'   Functions: {function_count}')
print(f'   Saved to: SolanaToken_ABI.json')

# Create verification info file
verification_info = {
    "contract_address": "0xB330Ccc03a0C9076A3558810A3Dd779c1528a0A0",
    "contract_name": "SolanaToken",
    "compiler": "0.8.20",
    "compiler_full": "v0.8.20+commit.a1b79de6",
    "optimization": True,
    "optimizer_runs": 200,
    "evm_version": "paris",
    "bytecode_hash": bytecode_hash,
    "bytecode_size_bytes": len(bytecode) // 2,
    "flattened_file": "SolanaToken_Flattened.sol",
    "abi_file": "SolanaToken_ABI.json",
    "bytecode_file": "SolanaToken_BYTECODE.txt",
}

with open('SolanaToken_VERIFICATION_INFO.json', 'w') as f:
    json.dump(verification_info, f, indent=2)

print(f'\n✅ Verification info saved')
print(f'   Saved to: SolanaToken_VERIFICATION_INFO.json')
