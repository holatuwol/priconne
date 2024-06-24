import json
import os
import pandas as pd

units_df = pd.read_csv('unit_data.csv')

units = {unit_id: unit_name for unit_id, unit_name in sorted(zip(units_df['id'], units_df['en_long']), key=lambda x: x[1])}

def get_link(video):
	return '%s - %s' % (video['name'], video['link'])

def get_notes(team):
	ex_remarks = team['exRemarks'].strip()
	link_videos = [get_link(video) + '\n' + video['remarks'] for video in team['links']]
	return ('%s %s' % (ex_remarks, '\n'.join(link_videos).strip())).strip()

def extract_team(team, full_boss_id, damage_type):
	if damage_type not in team or team[damage_type] is None:
		return None

	team_data = {
		'boss': full_boss_id,
		'region': 'JP',
		'timing': 'full auto' if damage_type == 'autoDamage' else 'semi auto' if damage_type == 'halfAutoDamage' else 'video' if len([link for link in team['links'] if len(link['link']) > 0]) != 0 else 'unspecified',
		'timeline': 'aikurumi %s %s' % (team['id'], '' if len(team['links']) != 1 else team['links'][0]['link']),
		'damage': '%sw' % team[damage_type]
	}

	for i, unit in enumerate(team['charas']):
		team_data['slot%d' % (5 - i)] = units[int(unit['prefabId'] / 100)]
		team_data['build%d' % (5 - i)] = '%d⭐; R%d' % (unit['rarity'], unit['rank'])

	team_data['notes'] = get_notes(team)

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
	max_damage = 0

	if 'autoDamage' in team and team['autoDamage'] is not None:
		new_team = extract_team(team, full_boss_id, 'autoDamage')
		if new_team is not None:
			max_damage = max(team['autoDamage'], max_damage)
			new_teams.append(new_team)

	if 'halfAutoDamage' in team and team['halfAutoDamage'] is not None and team['halfAutoDamage'] > max_damage:
		new_team = extract_team(team, full_boss_id, 'halfAutoDamage')
		if new_team is not None:
			max_damage = max(team['halfAutoDamage'], max_damage)
			new_teams.append(new_team)

	if 'easyManualDamage' in team and team['easyManualDamage'] is not None and team['easyManualDamage'] > max_damage:
		new_team = extract_team(team, full_boss_id, 'easyManualDamage')
		if new_team is not None:
			max_damage = max(team['easyManualDamage'], max_damage)
			new_teams.append(new_team)

	if 'damage' in team and team['damage'] is not None and team['damage'] > max_damage:
		new_team = extract_team(team, full_boss_id, 'damage')
		if new_team is not None:
			max_damage = max(team['damage'], max_damage)
			new_teams.append(new_team)

	return new_teams

teams = []

for file in sorted(os.listdir('.')):
	if file[:4] != 'raw_' or file[-5:] != '.json':
		continue

	with open(file, 'r') as f:
		data = json.load(f)

	for boss in data['data']:
		for team in boss['tasks']:
			teams = teams + list(extract_teams(boss, team))

pd.DataFrame([team for team in teams if team is not None]).to_csv('aikurumi.csv', sep='\t', index=False)