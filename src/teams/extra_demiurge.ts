function extractDemiurgeTeamsFromTab(
	baseURL: string,
	gids: Record<string, string>,
	tab: string,
	rows: HTMLTableRowElement[]
) : ClanBattleTeam[] {

	var boss = tab.split(' ')[0];

	var indices = rows.map(it => 'Demiurge ' + (it.cells[3].textContent || '').replace(/\n\s*/g, ' ')).map(it => (it.indexOf(' -> ') != -1) ? it.substring(0, it.indexOf(' -> ')) : it);
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
		while (Array.from(it1.cells).map(it2 => it2.textContent || '').filter(it3 => it3 == 'Extra Notes' || it3.indexOf('https://') != -1).length == 0) {
			it1 = getSiblingRowElement(it1, 1);
		}

		return it1;
	}).map(it4 => (it4.textContent == 'Extra Notes' ? getSiblingRowElement(it4, 1).cells[1].textContent : it4.textContent) || '');

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
					'build': {
						level: levels[i][j],
						star: stars[i][j],
						rank: ranks[i][j],
						unique: ues[i][j]
					}
				}
			})
		});
	}

	return teams;
}

function extractDemiurgeTeams(
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
		var pageName = pageNames[i]
		var tabId = gids[pageName];

		var tab = container.querySelector('[id="' + tabId + '"]');

		if (!tab) {
			continue;
		}

		var statusCells = Array.from(tab.querySelectorAll('td')).filter(it => (it.textContent || '').toUpperCase() == 'STATUS');

		var rows = statusCells.map(it => <HTMLTableRowElement> it.closest('tr'));

		rows = rows.filter(it => it && getSiblingRowElement(it, 1).cells[1].textContent != '');

		teams = teams.concat(extractDemiurgeTeamsFromTab(href, gids, pageNames[i], rows));
	}

	teams.forEach(team => {
		team.units.forEach(unit => {
			unit.name = fixUnitName(unit.name);
		})
	});

	demiurgeTeams = teams;

	updateExtraTeamsHelper();
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
