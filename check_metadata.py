import json
import sys

try:
    with open('artifacts/contracts/ethereum/FakeBTC.sol/FakeBTC.json', 'r') as f:
        data = json.load(f)
    
    if 'metadata' in data:
        metadata = json.loads(data['metadata'])
        compiler = metadata.get('compiler', {})
        print('COMPILER INFO:')
        print(f"  Version: {compiler.get('version', 'N/A')}")
        print(f"  Language: {metadata.get('language', 'N/A')}")
        print('\nSOURCES:')
        sources = metadata.get('sources', {})
        for src in sources.keys():
            print(f"  - {src}")
    else:
        print('No metadata found in artifact')
except Exception as e:
    print(f'Error: {e}', file=sys.stderr)
    sys.exit(1)
