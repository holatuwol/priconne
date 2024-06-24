from collections import defaultdict
import json
import pandas as pd
import sys

if len(sys.argv) > 1 and sys.argv[1] == 'pull':
	df = pd.read_csv('https://docs.google.com/spreadsheets/d/e/2PACX-1vQNZv9nmkVrGAaih2c4NyYfSiwmB3CC5mmicG_NOvb1kuXrdVUyCmW1q1DWIcCqXgtwPlYK_inNO3VV/pub?output=csv')

	df.to_csv('unit_data.csv', index=False)

df = pd.read_csv('unit_data.csv', dtype={'id': 'str', 'range': 'str', 'en_long': 'str', 'ja_long': 'str', 'en_alias': 'str'})

unit_data = [
	[getattr(x, 'id'), getattr(x, 'range'), getattr(x, 'en_long'), getattr(x, 'ja_long')] + ([] if isinstance(getattr(x, 'en_alias'), float) else getattr(x, 'en_alias').split('; '))
		for x in df.itertuples(index=False)
]

with open('src/units/unit_data.ts', 'w') as f:
	f.write('''var unitData = <string[][]> %s;
''' % (json.dumps(unit_data)))