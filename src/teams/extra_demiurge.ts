function extractDemiurgeTeamsFromTab(
	baseURL: string,
	gids: Record<string, string>,
	tab: string,
	rows: HTMLTableRowElement[]
) : ClanBattleTeam[] {

	var boss = tab.split(' ')[0];

	var indices = rows.map(it => 'Demiurge ' + it.cells[3].textContent);
	var ids = rows.map(it => it.cells[0].getAttribute('id'));
	var medias = <string[]> ids.map(getLabManualTimelineURL.bind(null, baseURL, gids[tab]));

	var unitRows = rows.map(it => getSiblingRowElement(it, 2));
	var damages = unitRows.map(it => parseLabManualDamage(boss, it.cells[7].textContent));

	var unitNames = unitRows.map(it => Array.from(it.cells).splice(2, 5).map(it => it.textContent || ''));

	var buildRows = unitRows.map(it => getSiblingRowElement(it, 2));
	var levels = buildRows.map(it => Array.from(it.cells).splice(2, 5).map(it => (it.textContent || '').trim()));
	var ranks = buildRows.map(it => Array.from(getSiblingRowElement(it, 1).cells).splice(2, 5).map(it => (it.textContent || '').trim()));
	var stars = buildRows.map(it => Array.from(getSiblingRowElement(it, 3).cells).splice(2, 5).map(it => (it.textContent || '').trim()));
	var ues = buildRows.map(it => Array.from(getSiblingRowElement(it, 4).cells).splice(2, 5).map(it => (it.textContent || '').trim()));

	var extraNotes = unitRows.map(it1 => {
		while (Array.from(it1.cells).map(it2 => it2.textContent || '').filter(it3 => it3 == 'Extra Notes').length == 0) {
			it1 = getSiblingRowElement(it1, 1);
		}

		return it1;
	}).map(it4 => getSiblingRowElement(it4, 1).cells[1].textContent || '');

	var teams = <ClanBattleTeam[]> [];

	for (var i = 0; i < rows.length; i++) {
		teams.push({
			boss: boss,
			region: extraNotes[i].indexOf('youtube.com') != -1 ? 'JP' : 'CN',
			timing: 'manual',
			index: indices[i],
			id: ids[i],
			media: medias[i],
			timeline: indices[i] + ' ' + medias[i],
			damage: damages[i],
			units: unitNames[i].map((it, j) => {
				return {
					'name': it,
					'build': [levels[i][j], stars[i][j] + '⭐' + (ues[i][j] ? ' UE ' + ues[i][j] : ''), ranks[i][j]]
				}
			})
		});
	}

	return teams;
}

function extractDemiurgeTeamsLocal(
	baseURL: string,
	gids: Record<string, string>
) : void {

	if (document.location.host.indexOf('localhost') == -1 || document.location.search) {
		return;
	}

	var tabs = Object.keys(gids);

	var teams = <ClanBattleTeam[]> [];

	for (var i = 0; i < tabs.length; i++) {
		var tab = tabs[i];
		var fileName = '/test/demiurge/' + encodeURIComponent(tab) + '.html';

		var xhr = new XMLHttpRequest();
		xhr.open('GET', fileName, false)

		xhr.onload = function() {
			var container = document.implementation.createHTMLDocument().documentElement;
			container.innerHTML = xhr.responseText;

			var rows = Array.from(container.querySelectorAll('td')).filter(it => it.textContent == 'STATUS').map(it => <HTMLTableRowElement> it.closest('tr')).filter(it => getSiblingRowElement(it, 1).cells[1].textContent != '');

			Array.prototype.push.apply(teams, extractDemiurgeTeamsFromTab(baseURL || '', gids, tab, rows));
		}

		xhr.send(null);
	}

	teams.forEach(team => {
		team.units.forEach(unit => {
			unit.name = fixUnitName(unit.name);
		})
	});

	demiurgeTeams = teams;

	updateExtraTeamsHelper();

	console.log(teams.map(getTeamAsCSVRow).join('\n'));
}
