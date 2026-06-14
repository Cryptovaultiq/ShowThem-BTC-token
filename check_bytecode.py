import json
import sys

try:
    with open('artifacts/contracts/ethereum/FakeBTC.sol/FakeBTC.json', 'r') as f:
        data = json.load(f)
    
    # Extract bytecode
    bytecode = data.get('bytecode', '')
    
    # Remove 0x prefix if present
    if bytecode.startswith('0x'):
        bytecode = bytecode[2:]
    
    print("=== FAKBTC BYTECODE ===")
    print(f"Length: {len(bytecode)} characters ({len(bytecode)//2} bytes)")
    print(f"\nFirst 100 chars: {bytecode[:100]}")
    print(f"Last 100 chars: {bytecode[-100:]}")
    
    # Hash the bytecode
    import hashlib
    bytecode_hash = hashlib.sha256(bytecode.encode()).hexdigest()
    print(f"\nSHA256 hash of bytecode string: {bytecode_hash}")
    
except Exception as e:
    print(f'Error: {e}', file=sys.stderr)
    sys.exit(1)
