function getWorryChefsDamage(
	boss: string,
	damage: string
) : number {

	var maxDamage = getMaxDamage(boss);
	var newDamage = 0;

	if ((damage.toLowerCase().indexOf('s') != -1) ||
		((boss.charAt(0) == 'B') && (damage == '90'))) {

		return maxDamage;
	}

	if (damage.charAt(0) == '~') {
		newDamage = getDamage(damage.split('~')[1]);
	}
	else if (damage.indexOf('~') == -1 && damage.indexOf('-') == -1) {
		newDamage = getDamage(damage);
	}

	else if (!(damage.charAt(damage.length - 1) >= '0' && damage.charAt(damage.length - 1) <= '9')) {
		newDamage = getDamage(damage.split(/[~\-]/)[0] + damage.charAt(damage.length - 1));
	}
	else {
		newDamage = getDamage(damage.split(/[~\-]/)[0]);
	}

	if (newDamage > maxDamage) {
		console.warn(boss, newDamage, '>', maxDamage, damage);
	}

	return Math.min(maxDamage, newDamage);
}

function parseWorryChefsDamage(
	boss: string | null,
	text: string | null
) : number {

	if (!boss) {
		return 0;
	}

	var damageString = (text || '').replace(/ to /g, '-').replace(/[ ,]/g, '');
	var damageMatcher = /[0-9\.\~\-/]+[kms]?/i.exec(damageString);

	if (!damageMatcher) {
		return 0;
	}

	return getWorryChefsDamage(boss, damageMatcher[0].toLowerCase());
}

function getWorryChefsTimelineURL(
	baseURL: string,
	gid: string,
	id: string,
	columnId: string,
	timelineId?: string
) : string {

	if (baseURL.indexOf('edit') != -1) {
		var x = id.indexOf('R');

		return baseURL + '#gid=' + gid + '&range=' + columnId + (parseInt(id.substring(x + 1)) + 1);
	}

	var rowURL = baseURL + '?gid=' + gid + '#' + id;

	return timelineId ? (rowURL + ':~:text=' + timelineId) : rowURL;
}

function getWorryChefsSimpleTeams(
	baseURL: string,
	gid: string,
	id: string,
	tier: string,
	grid: HTMLTableCellElement[][]
) : ClanBattleTeam[] {

	var indices = grid[0].filter((it, i) => i % 10 == 2).map(it => (it.textContent || ''));
	var damages = grid[0].filter((it, i) => i % 10 == 8).map(it => (it.textContent || '').trim());
	var valid = damages.map(it => !!it);

	var teams = <ClanBattleTeam[]> [];

	for (var i = 0; i < 5; i++) {
		if (!valid[i]) {
			continue;
		}

		var boss = tier + (i+1);
		var columnIndex = 10 * i + 4;
		var columnId = getColumnId(columnIndex);

		var buildGrid = <string[][]> grid.map(it => Array.from(it.slice(columnIndex, columnIndex + 5)).map(it => it.textContent || ''));

		var unitNames = buildGrid[2];
		var levels = buildGrid[6];
		var ranks = buildGrid[7];
		var stars = buildGrid[8];
		var ues = buildGrid[9];

		if (unitNames.filter(it => it).length == 0) {
			continue;
		}

		teams.push({
			boss: boss,
			region: 'JP',
			timing: 'semi auto',
			id: id,
			index: 'WorryChefs ' + indices[i],
			timeline: 'WorryChefs ' + indices[i] + ' ' + getWorryChefsTimelineURL(baseURL, gid, id, columnId, indices[i]),
			damage: parseWorryChefsDamage(boss, damages[i]),
			units: unitNames.map((it, j) => {
				var build = getStringAsBuild(levels[j]);

				build.star = stars[j];
				build.rank = ranks[j];
				build.unique = ues[j];

				return {
					'name': it,
					'build': build
				}
			})
		});
	}

	return teams;
}

function extractWorryChefsSimpleTeamsFromTab(
	baseURL: string,
	gids: Record<string, string>,
	tabName: string,
	tab: HTMLDivElement
) : ClanBattleTeam[] {

	var tier = tabName.split(' ')[0];

	var rows = Array.from(tab.querySelectorAll('tr'));
	var grid = getGoogleSheetsGrid(rows);

	var teams = <ClanBattleTeam[]> [];

	if (tier.length != 1 || (!(tier in bossStats[currentCBId]['bossHP']))) {
		return teams;
	}

	var rowsPerTeam = parseInt(currentCBId) <= 72 ? 11 : 13;

	for (var i = 6; i < rows.length - 1; i += rowsPerTeam) {
		var idHolder = rows[i].querySelector('th');
		var id = idHolder ? idHolder.getAttribute('id') || '' : '';
		var newTeams = getWorryChefsSimpleTeams(baseURL, gids[tabName], id, tier, grid.slice(i, i + 10));

		if (newTeams.length == 0) {
			i++;
			continue;
		}

		Array.prototype.push.apply(teams, newTeams);
	}

	return teams;
}

function extractWorryChefsManualTeamsFromTab(
	baseURL: string,
	gids: Record<string, string>,
	tabName: string,
	tab: HTMLDivElement
) : ClanBattleTeam[] {

	var statusCells = Array.from(tab.querySelectorAll('td')).filter(it => (it.textContent || '').toUpperCase() == 'STATUS');

	var rows = statusCells.map(it => <HTMLTableRowElement> it.closest('tr')).filter(it => it && getSiblingRowElement(it, 1).cells[1].textContent != '').map(it => getSiblingRowElement(it, -5));

	var bosses = <(string | null)[]> [];

	if (tabName.indexOf('Archives') != -1) {
		bosses = rows.map(it => (it.cells[2].textContent || '__').charAt(1) == '_' ? null : (it.cells[2].textContent || '').substring(0, 2));
	}
	else {
		var boss = tabName.split(' ')[0];

		if (boss.length != 2 || (!(boss.charAt(0) in bossStats[currentCBId]['bossHP'])) || boss.charAt(1) <= '0' || boss.charAt(1) >= '6') {
			return [];
		}

		bosses = rows.map(it => boss);
	}

	var indices = rows.map(it => 'WorryChefs ' + it.cells[2].textContent);
	var ids = rows.map(it => it.cells[0].getAttribute('id'));
	var medias = <string[]> ids.map(getWorryChefsTimelineURL.bind(null, baseURL, gids[tabName], 'A'));

	var unitRows = rows.map(it => getSiblingRowElement(it, 2));
	var damages = unitRows.map((it, i) => parseWorryChefsDamage(bosses[i], (<HTMLTableRowElement>it.previousSibling).cells[3].textContent));
	var unitNames = unitRows.map(it => Array.from(it.cells).splice(1, 5).map(it => it.textContent || ''));

	var buildRows = unitRows.map(it => getSiblingRowElement(it, 5));
	var levels = buildRows.map(it => Array.from(it.cells).splice(2, 5).map(it => (it.textContent || '').trim()));
	var ranks = buildRows.map(it => Array.from(getSiblingRowElement(it, 1).cells).splice(2, 5).map(it => (it.textContent || '').trim()));
	var stars = buildRows.map(it => Array.from(getSiblingRowElement(it, 2).cells).splice(2, 5).map(it => (it.textContent || '').trim()));
	var ues = buildRows.map(it => Array.from(getSiblingRowElement(it, 3).cells).splice(2, 5).map(it => (it.textContent || '').trim()));

	var teams = <ClanBattleTeam[]> [];

	for (var i = 0; i < rows.length; i++) {
		if (!bosses[i]) {
			continue;
		}

		var boss = <string> bosses[i];

		teams.push({
			boss: boss,
			region: 'JP',
			timing: 'manual',
			index: indices[i],
			id: ids[i],
			media: medias[i],
			timeline: indices[i] + ' ' + medias[i],
			damage: damages[i],
			units: unitNames[i].map((it, j) => {
				var build = getStringAsBuild(levels[i][j]);

				build.star = stars[i][j];
				build.rank = ranks[i][j];
				build.unique = ues[i][j];

				return {
					'name': it,
					'build': build
				}
			})
		});
	}

	return teams;
}

function getWorryChefsCopeTeams(
	baseURL: string,
	gid: string,
	id: string,
	boss: string,
	grid: HTMLTableCellElement[][]
) : ClanBattleTeam[] {

	var teams = <ClanBattleTeam[]> [];

	var damages = grid[1].filter((it, i) => i % 7 == 2).map(it => (it.textContent || '').trim());
	var valid = damages.map(it => !!it);

	for (var i = 0; i < damages.length; i++) {
		if (!valid[i]) {
			continue;
		}

		var columnIndex = 7 * i + 3;
		var columnId = getColumnId(columnIndex);

		var buildGrid = <string[][]> grid.slice(3, 5).map(it => Array.from(it.slice(columnIndex, columnIndex + 5)).map(it => it.textContent || ''));

		var unitNames = buildGrid[0];
		var stars = buildGrid[1];

		teams.push({
			boss: boss,
			region: 'JP',
			timing: 'full auto',
			id: id,
			timeline: 'WorryChefs Cope Finder ' + getWorryChefsTimelineURL(baseURL, gid, id, columnId),
			damage: parseWorryChefsDamage(boss, damages[i]),
			units: unitNames.map((it, j) => {
				return {
					'name': it,
					'build': {
						'star': stars[j]
					}
				}
			})
		});
	}

	return teams;
}

function extractWorryChefsCopeTeamsFromTab(
	baseURL: string,
	gids: Record<string, string>,
	tabName: string,
	tab: HTMLDivElement
) : ClanBattleTeam[] {

	var rows = Array.from(tab.querySelectorAll('tr'));
	var grid = getGoogleSheetsGrid(rows);

	var teams = <ClanBattleTeam[]> [];

	for (var i = 6; i < rows.length - 1; i += 7) {
		var boss = tabName.split(' ')[0];

		var idHolder = rows[i].querySelector('th');
		var id = idHolder ? idHolder.getAttribute('id') || '' : '';
		var newTeams = getWorryChefsSimpleTeams(baseURL, gids[tabName], id, boss, grid.slice(i, i + 7));

		Array.prototype.push.apply(teams, newTeams);
	}

	return teams;
}

function getWorryChefsBruteForceTeams(
	baseURL: string,
	gid: string,
	id: string,
	tier: string,
	grid: HTMLTableCellElement[][]
) : ClanBattleTeam[] {

	var teams = <ClanBattleTeam[]> [];

	var indices = grid[0].filter((it, i) => i % 7 == 2).map(it => (it.textContent || ''));
	var damages = grid[2].filter((it, i) => i % 7 == 2).map(it => (it.textContent || '').trim());
	var valid = damages.map(it => !!it);

	var teams = <ClanBattleTeam[]> [];

	for (var i = 0; i < 5; i++) {
		if (!valid[i]) {
			continue;
		}

		var boss = tier + (i+1);
		var columnIndex = 7 * i + 3;
		var columnId = getColumnId(columnIndex);

		var buildGrid = <string[][]> grid.map(it => Array.from(it.slice(columnIndex, columnIndex + 5)).map(it => it.textContent || ''));

		var unitNames = buildGrid[3];
		var stars = buildGrid[4];
		var timeline = buildGrid[5].map(it => it == 'SET' ? 'O' : 'X').join('');

		teams.push({
			boss: boss,
			region: 'JP',
			timing: 'full auto',
			id: id,
			index: 'WorryChefs ' + indices[i],
			timeline: 'WorryChefs ' + indices[i] + ' ' + timeline + ' ' + getWorryChefsTimelineURL(baseURL, gid, id, columnId, indices[i]),
			damage: parseWorryChefsDamage(boss, damages[i]),
			units: unitNames.map((it, j) => {
				return {
					'name': it,
					'build': {
						'star': stars[j]
					}
				}
			})
		});
	}

	return teams;
}

function extractWorryChefsBruteForceTeamsFromTab(
	baseURL: string,
	gids: Record<string, string>,
	tabName: string,
	tab: HTMLDivElement
) : ClanBattleTeam[] {

	var rows = Array.from(tab.querySelectorAll('tr'));
	var grid = getGoogleSheetsGrid(rows);

	var teams = <ClanBattleTeam[]> [];

	for (var i = 6; i < rows.length - 1; i += 7) {
		var idHolder = rows[i].querySelector('th');
		var id = idHolder ? idHolder.getAttribute('id') || '' : '';

		var newTeams = getWorryChefsBruteForceTeams(baseURL, gids[tabName], id, 'D', grid.slice(i, i + 6));

		Array.prototype.push.apply(teams, newTeams);
	}

	return teams;
}


function extractWorryChefsTeams(
	href: string,
	container: HTMLElement
) : void {

	var tabElements = container.querySelectorAll('#sheet-menu li');

	var gids = <Record<string, string>> Array.from(tabElements).reduce((acc, next) => {
		var listItemId = next.getAttribute('id');

		if (!listItemId) {
			return acc;
		}

		var tabId = listItemId.substring('sheet-button-'.length);
		var tabName = (next.textContent || '').trim();

		acc[tabName] = tabId;

		return acc;
	}, <Record<string, string>> {});

	var pageNames = Object.keys(gids);

	var teams = <ClanBattleTeam[]> [];

	for (var i = 0; i < pageNames.length; i++) {
		var pageName = pageNames[i];

		var tabId = gids[pageName];

		var tab = <HTMLDivElement | null> container.querySelector('div[id="' + tabId + '"]');

		if (!tab) {
			continue;
		}

		if ((pageName.indexOf('Manual') != -1) || (pageName.indexOf('Archives') != -1)) {
			teams = teams.concat(extractWorryChefsManualTeamsFromTab(href, gids, pageNames[i], tab));
		}
		else if (pageName.indexOf('Cope Finder') != -1) {
			teams = teams.concat(extractWorryChefsCopeTeamsFromTab(href, gids, pageNames[i], tab));
		}
		else if (pageName.indexOf('Brute Force') != -1) {
			teams = teams.concat(extractWorryChefsBruteForceTeamsFromTab(href, gids, pageNames[i], tab));
		}
		else if ((pageName.indexOf('Set and Forget') != -1) || (pageName.indexOf('Set & Forget') != -1)) {
			teams = teams.concat(extractWorryChefsBruteForceTeamsFromTab(href, gids, pageNames[i], tab));
		}
		else if ((pageName.indexOf('Welcome') == -1) && (pageName.indexOf('Boss Info') == -1) && (pageName.indexOf('Summary') == -1) && (pageName.indexOf('Logging') == -1)) {
			teams = teams.concat(extractWorryChefsSimpleTeamsFromTab(href, gids, pageNames[i], tab));
		}
	}

	teams.forEach(team => {
		team.units.forEach(unit => {
			unit.name = fixUnitName(unit.name);
		})
	});

	worryChefTeams = teams;

	updateExtraTeamsHelper();
}