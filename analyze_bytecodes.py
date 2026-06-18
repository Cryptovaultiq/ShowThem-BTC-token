#!/usr/bin/env python3
import json
import hashlib

# Read artifact
with open('artifacts/contracts/ethereum/SolanaToken.sol/SolanaToken.json', 'r') as f:
    artifact = json.load(f)

# Get both bytecodes
creation_bytecode = artifact.get('bytecode', '')
runtime_bytecode = artifact.get('deployedBytecode', '')

if creation_bytecode.startswith('0x'):
    creation_bytecode = creation_bytecode[2:]
if runtime_bytecode.startswith('0x'):
    runtime_bytecode = runtime_bytecode[2:]

creation_hash = hashlib.sha256(creation_bytecode.encode()).hexdigest()
runtime_hash = hashlib.sha256(runtime_bytecode.encode()).hexdigest()

print("═" * 80)
print("SOLANA TOKEN - BYTECODE ANALYSIS")
print("═" * 80)

print(f"\n📦 CREATION BYTECODE (includes constructor)")
print(f"   Size: {len(creation_bytecode)} chars ({len(creation_bytecode)//2} bytes)")
print(f"   SHA256: {creation_hash}")

print(f"\n🔧 RUNTIME BYTECODE (stays at contract address)")
print(f"   Size: {len(runtime_bytecode)} chars ({len(runtime_bytecode)//2} bytes)")
print(f"   SHA256: {runtime_hash}")

print(f"\n✅ FROM BLOCKCHAIN:")
print(f"   Size: 11014 chars (5507 bytes)")
print(f"   SHA256: 21c979a4f93deed24bd0495ef32179bd4381433199a40b6073375bb3cbd6c037")

if runtime_hash == "21c979a4f93deed24bd0495ef32179bd4381433199a40b6073375bb3cbd6c037":
    print(f"\n🎉 MATCH! Runtime bytecode matches what's deployed!")
else:
    print(f"\n❌ NO MATCH - Runtime bytecode doesn't match deployed")
    print(f"   This suggests the source code is different from what was deployed")

# Save correct bytecodes for reference
with open('SolanaToken_CREATION_BYTECODE.txt', 'w') as f:
    f.write(creation_bytecode)

with open('SolanaToken_RUNTIME_BYTECODE.txt', 'w') as f:
    f.write(runtime_bytecode)

print(f"\n✅ Saved:")
print(f"   - SolanaToken_CREATION_BYTECODE.txt")
print(f"   - SolanaToken_RUNTIME_BYTECODE.txt")
print(f"   - SolanaToken_DEPLOYED_BYTECODE.txt (from blockchain)")

# Compare deployed with runtime
try:
    with open('SolanaToken_DEPLOYED_BYTECODE.txt', 'r') as f:
        deployed = f.read()
    
    print(f"\n📊 COMPARISON:")
    print(f"   Runtime size:  {len(runtime_bytecode)//2} bytes")
    print(f"   Deployed size: {len(deployed)//2} bytes")
    
    if runtime_bytecode == deployed:
        print(f"   ✅ IDENTICAL - Verification should work!")
    else:
        print(f"   ❌ DIFFERENT - Verification will fail")
except:
    pass
