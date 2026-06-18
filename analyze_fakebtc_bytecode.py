#!/usr/bin/env python3
import json
import hashlib
import urllib.request

# Get deployed FakeBTC bytecode
rpc_url = "https://mainnet.infura.io/v3/6f364710da4e409a8a22bc4b9c4fc894"
fake_btc_address = "0x4B09e895699593c5e427CF8eA7Be550273989aa4"

payload = {
    "jsonrpc": "2.0",
    "method": "eth_getCode",
    "params": [fake_btc_address, "latest"],
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
        deployed = result['result']
        if deployed.startswith('0x'):
            deployed = deployed[2:]
        
        # Now check current compilation
        with open('artifacts/contracts/ethereum/FakeBTC.sol/FakeBTC.json', 'r') as f:
            artifact = json.load(f)
        
        runtime = artifact.get('deployedBytecode', '')
        if runtime.startswith('0x'):
            runtime = runtime[2:]
        
        print("📊 BYTECODE COMPARISON")
        print(f"Deployed length: {len(deployed)}")
        print(f"Current length:  {len(runtime)}")
        print(f"Difference: {len(deployed) - len(runtime)} characters\n")
        
        print(f"Last 100 chars of DEPLOYED:")
        print(deployed[-100:])
        print(f"\nLast 100 chars of CURRENT:")
        print(runtime[-100:])
        
        # Try removing metadata and compare
        # Solidity 0.8.20 metadata is typically the last part after '64736f6c63430008' (version bytes)
        # Check if removing last part matches
        print("\n" + "="*80)
        print("Checking without metadata suffix...")
        
        # Remove last 68 chars (34 bytes) which is typical CBOR metadata
        deployed_no_meta = deployed[:-68]
        runtime_no_meta = runtime[:-68]
        
        if deployed_no_meta == runtime_no_meta:
            print("✅ MATCH when ignoring metadata!")
        else:
            print("❌ Still different after removing metadata")
            
except Exception as e:
    print(f"Error: {e}")
