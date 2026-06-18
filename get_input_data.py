import urllib.request
import json

txHash = '0x65fc6dbcb04a247d17c904d54cb864f93d48c63eaa11dbb492243c13f7d249b7'
apiUrl = f'https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash={txHash}&apikey=DCIMH4YNP4T6IVXPBTC8RPHCHKHI9Y9TCA'

try:
    with urllib.request.urlopen(apiUrl, timeout=10) as response:
        response_text = response.read().decode('utf-8')
        print("Raw response:")
        print(response_text[:500])
        data = json.loads(response_text)
        if isinstance(data, dict):
            print("\nParsed JSON keys:", list(data.keys()))
            if 'result' in data:
                if isinstance(data['result'], dict):
                    input_data = data['result'].get('input', 'N/A')
                    print(f"\nInput Data: {input_data}")
                    
                    # For FakeBTC constructor, there are no arguments (empty constructor)
                    # So input should be just the contract bytecode
                    # The first 10 characters are "0x" + function selector (8 hex chars)
                    # For constructor, function selector is empty
                    print(f"\nFirst 100 chars: {input_data[:100]}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
