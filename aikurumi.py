import json
import os
import pandas as pd

units_df = pd.read_csv('https://docs.google.com/spreadsheets/d/e/2PACX-1vQNZv9nmkVrGAaih2c4NyYfSiwmB3CC5mmicG_NOvb1kuXrdVUyCmW1q1DWIcCqXgtwPlYK_inNO3VV/pub?output=csv')

units = {unit_id: unit_name for unit_id, unit_name in sorted(zip(units_df['unitId'], units_df['name']), key=lambda x: x[1])}

def get_link(video):
	return '%s - %s' % (video['name'], video['link'])

def get_timing(team):
	if len(team['links']) == 0:
		return 'full auto' if team['autoDamage'] is not None else 'semi auto' if team['halfAutoDamage'] is not None else 'unspecified'

	return 'video'

def extract_team(boss, team):
	if team['stage'] < 3:
		tier = 'B'
	elif team['stage'] < 4:
		tier = 'C'
	else:
		tier = 'D'

	stage = team['stage']
	boss_id = boss['id']

	boss_index = boss['index']

	full_boss_id = '%s%s' % (tier, boss_index)
	missing_unit = False

	team_data = {
		'boss': full_boss_id,
		'region': 'JP',
		'timing': get_timing(team),
		'timeline': 'aikurumi %s %s' % (team['id'], '' if len(team['links']) != 1 else team['links'][0]['link']),
		'damage': '%sw' % [damage for damage in [team['autoDamage'], team['halfAutoDamage'], team['easyManualDamage'], team['damage']] if damage is not None][0]
	}

	for i, unit in enumerate(team['charas']):
		team_data['slot%d' % (5 - i)] = units[int(unit['prefabId'] / 100)]
		team_data['build%d' % (5 - i)] = '%d⭐; R%d' % (unit['rarity'], unit['rank'])

	team_data['notes'] = ('%s %s' % (team['exRemarks'].strip(), '\n'.join([get_link(video) for video in team['links']]).strip())).strip()

	return team_data

teams = []

for file in os.listdir('aikurumi'):
	if file[-5:] != '.json':
		continue

	with open('aikurumi/%s' % file, 'r') as f:
		data = json.load(f)

	teams = teams + [extract_team(boss, team) for boss in data['data'] for team in boss['tasks']]

pd.DataFrame([team for team in teams if team is not None]).to_csv('aikurumi/aikurumi.csv', sep='\t', index=False)