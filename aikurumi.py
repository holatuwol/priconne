import json
import os
import pandas as pd

units_df = pd.read_csv('https://docs.google.com/spreadsheets/d/e/2PACX-1vQNZv9nmkVrGAaih2c4NyYfSiwmB3CC5mmicG_NOvb1kuXrdVUyCmW1q1DWIcCqXgtwPlYK_inNO3VV/pub?output=csv')

units = {unit_id: unit_name for unit_id, unit_name in sorted(zip(units_df['unitId'], units_df['name']), key=lambda x: x[1])}

def get_link(video):
	return '%s - %s' % (video['name'], video['link'])

def extract_team(team, full_boss_id, damage_type):
	if damage_type not in team or team[damage_type] is None:
		return None

	team_data = {
		'boss': full_boss_id,
		'region': 'JP',
		'timing': 'full auto' if damage_type == 'autoDamage' else 'semi auto' if damage_type == 'halfAutoDamage' else 'video' if len(team['links']) != 0 else 'unspecified',
		'timeline': 'aikurumi %s %s' % (team['id'], '' if len(team['links']) != 1 else team['links'][0]['link']),
		'damage': '%sw' % team[damage_type]
	}

	for i, unit in enumerate(team['charas']):
		team_data['slot%d' % (5 - i)] = units[int(unit['prefabId'] / 100)]
		team_data['build%d' % (5 - i)] = '%d⭐; R%d' % (unit['rarity'], unit['rank'])

	team_data['notes'] = ('%s %s' % (team['exRemarks'].strip(), '\n'.join([get_link(video) for video in team['links']]).strip())).strip()

	return team_data

def extract_teams(boss, team):
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

	new_teams = []

	if 'autoDamage' in team and team['autoDamage'] is not None:
		new_team = extract_team(team, full_boss_id, 'autoDamage')
		if new_team is not None:
			new_teams.append(new_team)

	if 'halfAutoDamage' in team and team['halfAutoDamage'] is not None and team['halfAutoDamage'] != team['autoDamage']:
		new_team = extract_team(team, full_boss_id, 'halfAutoDamage')
		if new_team is not None:
			new_teams.append(new_team)

	if 'easyManualDamage' in team and team['easyManualDamage'] is not None and team['easyManualDamage'] != team['halfAutoDamage']:
		new_team = extract_team(team, full_boss_id, 'easyManualDamage')
		if new_team is not None:
			new_teams.append(new_team)

	has_damage = sum([1 if team[damage_type] == team['damage'] else 0 for damage_type in ['easyManualDamage', 'halfAutoDamage', 'autoDamage']]) > 0

	if not has_damage:
		new_team = extract_team(team, full_boss_id, 'damage')
		if new_team is not None:
			new_teams.append(new_team)

	return new_teams

teams = []

for file in os.listdir('aikurumi'):
	if file[-5:] != '.json':
		continue

	with open('aikurumi/%s' % file, 'r') as f:
		data = json.load(f)

	for boss in data['data']:
		for team in boss['tasks']:
			teams = teams + list(extract_teams(boss, team))

pd.DataFrame([team for team in teams if team is not None]).to_csv('aikurumi/aikurumi.csv', sep='\t', index=False)