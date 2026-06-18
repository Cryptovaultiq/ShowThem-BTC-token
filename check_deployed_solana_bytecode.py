#!/usr/bin/env python3
import json
import hashlib

# RPC call to get deployed bytecode
rpc_url = "https://mainnet.infura.io/v3/6f364710da4e409a8a22bc4b9c4fc894"
contract_address = "0xB330Ccc03a0C9076A3558810A3Dd779c1528a0A0"

import urllib.request

payload = {
    "jsonrpc": "2.0",
    "method": "eth_getCode",
    "params": [contract_address, "latest"],
    "id": 1
}

req = urllib.request.Request(
    rpc_url,
    data=json.dumps(payload).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

try:
    with urllib.request.urlopen(req, timeout=10) as response:
        result = json.loads(response.read())
    
    if 'result' in result:
        deployed_bytecode = result['result']
        if deployed_bytecode.startswith('0x'):
            deployed_bytecode = deployed_bytecode[2:]
        
        bytecode_hash = hashlib.sha256(deployed_bytecode.encode()).hexdigest()
        
        print("✅ DEPLOYED BYTECODE FROM BLOCKCHAIN")
        print(f"Contract: {contract_address}")
        print(f"Size: {len(deployed_bytecode)} characters ({len(deployed_bytecode)//2} bytes)")
        print(f"SHA256: {bytecode_hash}")
        print(f"\nFirst 100 chars: {deployed_bytecode[:100]}")
        print(f"Last 100 chars: ...{deployed_bytecode[-100:]}")
        
        # Save to file for comparison
        with open('SolanaToken_DEPLOYED_BYTECODE.txt', 'w') as f:
            f.write(deployed_bytecode)
        
        print(f"\n✅ Saved to: SolanaToken_DEPLOYED_BYTECODE.txt")
        
        # Compare with what we saved earlier
        try:
            with open('SolanaToken_BYTECODE.txt', 'r') as f:
                saved_bytecode = f.read()
            
            if deployed_bytecode == saved_bytecode:
                print(f"✅ MATCH: Deployed bytecode matches our saved bytecode!")
            else:
                print(f"❌ MISMATCH: Deployed bytecode is DIFFERENT from what we saved")
                saved_hash = hashlib.sha256(saved_bytecode.encode()).hexdigest()
                print(f"   Saved hash:    {saved_hash}")
                print(f"   Deployed hash: {bytecode_hash}")
        except:
            print("(No saved bytecode to compare)")
    else:
        print(f"Error: {result.get('error', 'Unknown error')}")
except Exception as e:
    print(f"Request failed: {e}")
