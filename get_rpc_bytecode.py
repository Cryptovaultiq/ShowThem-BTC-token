#!/usr/bin/env python3
"""
Get deployed bytecode using JSON-RPC endpoint instead of Etherscan API
"""

import urllib.request
import json
import hashlib

CONTRACT_ADDRESS = "0x4B09e895699593c5e427CF8eA7Be550273989aa4"

# Try Infura RPC (uses configured key from environment)
RPC_URL = "https://mainnet.infura.io/v3/6f364710da4e409a8a22bc4b9c4fc894"

def get_code_via_rpc():
    """Get bytecode using JSON-RPC"""
    payload = {
        "jsonrpc": "2.0",
        "method": "eth_getCode",
        "params": [CONTRACT_ADDRESS, "latest"],
        "id": 1,
    }
    
    try:
        print(f"Querying RPC endpoint: {RPC_URL}")
        req = urllib.request.Request(
            RPC_URL,
            data=json.dumps(payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        
        with urllib.request.urlopen(req, timeout=10) as response:
            response_text = response.read().decode('utf-8')
            data = json.loads(response_text)
            
            if 'result' in data:
                bytecode = data['result']
                
                print(f"\n✅ Bytecode retrieved successfully!")
                print(f"   Raw: {bytecode[:100]}..." if len(bytecode) > 100 else bytecode)
                
                # Remove 0x prefix
                if bytecode.startswith('0x'):
                    bytecode = bytecode[2:]
                
                if not bytecode or bytecode == '0x':
                    print(f"\n❌ Contract appears to be empty or not found at address")
                    print(f"   Full response: {data}")
                    return None
                
                print(f"   Length: {len(bytecode)} characters ({len(bytecode)//2} bytes)")
                
                # Calculate hash
                deployed_hash = hashlib.sha256(bytecode.encode()).hexdigest()
                print(f"   SHA256 hash: {deployed_hash}")
                
                # Save to file
                with open('deployed_bytecode.txt', 'w') as f:
                    f.write(f"Deployed bytecode for {CONTRACT_ADDRESS}\n")
                    f.write(f"Length: {len(bytecode)} chars ({len(bytecode)//2} bytes)\n")
                    f.write(f"SHA256: {deployed_hash}\n\n")
                    f.write(bytecode)
                
                print(f"   Saved to deployed_bytecode.txt")
                return bytecode
            else:
                print(f"❌ Error in RPC response: {data}")
                return None
    
    except Exception as e:
        print(f"❌ RPC Error: {e}")
        return None

def compare_with_local():
    """Compare deployed bytecode with local compilation"""
    try:
        with open('artifacts/contracts/ethereum/FakeBTC.sol/FakeBTC.json', 'r') as f:
            artifact = json.load(f)
        
        current_bytecode = artifact.get('bytecode', '')
        if current_bytecode.startswith('0x'):
            current_bytecode = current_bytecode[2:]
        
        current_hash = hashlib.sha256(current_bytecode.encode()).hexdigest()
        
        # Read deployed from file
        with open('deployed_bytecode.txt', 'r') as f:
            lines = f.readlines()
            deployed_hash = lines[2].split(': ')[1].strip()
        
        print(f"\n📊 COMPARISON:")
        print(f"   Current compiled: {current_hash}")
        print(f"   Deployed onchain: {deployed_hash}")
        
        if deployed_hash == current_hash:
            print(f"\n   ✅ BYTECODES MATCH!")
            return True
        else:
            print(f"\n   ❌ Bytecodes differ")
            
            deployed_bytes = int(lines[1].split('(')[1].split()[0])
            current_bytes = len(current_bytecode) // 2
            print(f"   Current size:  {current_bytes} bytes")
            print(f"   Deployed size: {deployed_bytes} bytes")
            
            if current_bytes != deployed_bytes:
                print(f"   Size difference: {abs(current_bytes - deployed_bytes)} bytes")
            return False
    
    except Exception as e:
        print(f"Error comparing: {e}")
        return False

if __name__ == "__main__":
    bytecode = get_code_via_rpc()
    if bytecode:
        compare_with_local()
