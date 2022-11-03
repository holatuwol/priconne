import json
import pandas as pd

df = pd.read_csv('https://docs.google.com/spreadsheets/d/e/2PACX-1vQNZv9nmkVrGAaih2c4NyYfSiwmB3CC5mmicG_NOvb1kuXrdVUyCmW1q1DWIcCqXgtwPlYK_inNO3VV/pub?output=csv')

units = {unit_id: unit_name for unit_id, unit_name in sorted(zip(df['unitId'], df['name']), key=lambda x: x[1])}
alt_units = {unit_id: unit_name for unit_id, unit_name in sorted(zip(df['unitId'], df['name.short']), key=lambda x: x[1])}
positions = {unit_id: unit_range for unit_id, unit_range in sorted(zip(df['unitId'], df['range']))}

with open('src/unit_data.ts', 'w') as f:
	f.write('''var unitNames = <Record<string, string>> %s;

var altNames = <Record<string, string>> %s;

var positions = <Record<string, number>> %s;
''' % (json.dumps(units), json.dumps(alt_units), json.dumps(positions)))