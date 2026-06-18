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
        
        deployed_hash = hashlib.sha256(deployed.encode()).hexdigest()
        print(f"✅ DEPLOYED FAKEBTC BYTECODE")
        print(f"Contract: {fake_btc_address}")
        print(f"Size: {len(deployed)} chars ({len(deployed)//2} bytes)")
        print(f"SHA256: {deployed_hash}\n")
        
        # Now check current compilation
        with open('artifacts/contracts/ethereum/FakeBTC.sol/FakeBTC.json', 'r') as f:
            artifact = json.load(f)
        
        runtime = artifact.get('deployedBytecode', '')
        if runtime.startswith('0x'):
            runtime = runtime[2:]
        
        runtime_hash = hashlib.sha256(runtime.encode()).hexdigest()
        print(f"🔧 CURRENT RUNTIME BYTECODE")
        print(f"Size: {len(runtime)} chars ({len(runtime)//2} bytes)")
        print(f"SHA256: {runtime_hash}\n")
        
        if runtime_hash == deployed_hash:
            print(f"✅ MATCH! Bytecode matches!")
        else:
            print(f"❌ MISMATCH - Different source code was deployed")
            print(f"\nDeployed:  {len(deployed)//2} bytes")
            print(f"Current:   {len(runtime)//2} bytes")
            print(f"Difference: {abs(len(deployed) - len(runtime))//2} bytes")
            
except Exception as e:
    print(f"Error: {e}")
