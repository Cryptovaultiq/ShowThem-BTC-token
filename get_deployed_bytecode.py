#!/usr/bin/env python3
"""
Get the deployed bytecode from the blockchain and compare with local compilation
"""

import urllib.request
import json
import hashlib

CONTRACT_ADDRESS = "0x4B09e895699593c5e427CF8eA7Be550273989aa4"
ETHERSCAN_API = "https://api.etherscan.io/api?module=proxy&action=eth_getCode&address=" + CONTRACT_ADDRESS + "&apikey=DCIMH4YNP4T6IVXPBTC8RPHCHKHI9Y9TCA"

try:
    print("Fetching deployed bytecode from blockchain...")
    with urllib.request.urlopen(ETHERSCAN_API, timeout=10) as response:
        response_text = response.read().decode('utf-8')
        data = json.loads(response_text)
        
        if 'result' in data:
            deployed_bytecode = data['result']
            
            # Remove 0x prefix
            if deployed_bytecode.startswith('0x'):
                deployed_bytecode = deployed_bytecode[2:]
            
            print(f"\n✅ Deployed bytecode retrieved successfully!")
            print(f"   Length: {len(deployed_bytecode)} characters ({len(deployed_bytecode)//2} bytes)")
            
            # Calculate hash
            deployed_hash = hashlib.sha256(deployed_bytecode.encode()).hexdigest()
            print(f"   SHA256 hash: {deployed_hash}")
            
            # Save to file for reference
            with open('deployed_bytecode.txt', 'w') as f:
                f.write(f"Deployed bytecode for {CONTRACT_ADDRESS}\n")
                f.write(f"Length: {len(deployed_bytecode)} chars ({len(deployed_bytecode)//2} bytes)\n")
                f.write(f"SHA256: {deployed_hash}\n\n")
                f.write(deployed_bytecode)
            
            print(f"\n   Saved to deployed_bytecode.txt")
            
            # Compare with current
            import json
            with open('artifacts/contracts/ethereum/FakeBTC.sol/FakeBTC.json', 'r') as f:
                artifact = json.load(f)
            
            current_bytecode = artifact.get('bytecode', '')
            if current_bytecode.startswith('0x'):
                current_bytecode = current_bytecode[2:]
            
            current_hash = hashlib.sha256(current_bytecode.encode()).hexdigest()
            
            print(f"\n📊 COMPARISON:")
            print(f"   Current compiled: {current_hash}")
            print(f"   Deployed onchain: {deployed_hash}")
            
            if deployed_hash == current_hash:
                print(f"\n   ✅ BYTECODES MATCH! No compilation needed!")
            else:
                print(f"\n   ❌ Bytecodes differ - need to find correct compilation")
                
                # Show differences
                print(f"\n   Current size:  {len(current_bytecode)//2} bytes")
                print(f"   Deployed size: {len(deployed_bytecode)//2} bytes")
                
                if len(current_bytecode) != len(deployed_bytecode):
                    print(f"   Size difference: {abs(len(current_bytecode) - len(deployed_bytecode))//2} bytes")
        else:
            print(f"❌ Error in API response: {data}")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
