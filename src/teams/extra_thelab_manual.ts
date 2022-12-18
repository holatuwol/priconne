function getLabManualDamage(
	boss: string,
	damage: string
) : number {

	if (damage.toLowerCase().indexOf('s') != -1) {
		return getMaxDamage(boss);
	}

	if (damage.charAt(0) == '~') {
		return getDamage(damage.split('~')[1]);
	}

	if (damage.indexOf('~') == -1 && damage.indexOf('-') == -1) {
		return getDamage(damage);
	}

	if (!(damage.charAt(damage.length - 1) >= '0' && damage.charAt(damage.length - 1) <= '9')) {
		return getDamage(damage.split(/[~\-]/)[0] + damage.charAt(damage.length - 1));
	}

	return getDamage(damage.split(/[~\-]/)[0]);
}

function parseLabManualDamage(
	boss: string,
	text: string | null
) : number {
	var damageString = (text || '').replace(/ to /g, '-').replace(/[ ,]/g, '');
	var damageMatcher = /[0-9\.\~\-/]+[kms]?/i.exec(damageString);

	if (!damageMatcher) {
		return 0;
	}

	return getLabManualDamage(boss, damageMatcher[0].toLowerCase());
}

function getLabManualTimelineURL(
	baseURL: string,
	gid: string,
	id: string
) : string {

	if (baseURL.indexOf('htmlview') != -1 || baseURL.indexOf('pubhtml') != -1) {
		return baseURL + '?gid=' + gid + '#' + id;
	}

	var x = id.indexOf('R');

	return baseURL + '#gid=' + gid + '&range=A' + (parseInt(id.substring(x + 1)) + 1);
}

function extractLabManualTeamsFromTab(
	baseURL: string,
	gids: Record<string, string>,
	tab: string,
	rows: HTMLTableRowElement[]
) : ClanBattleTeam[] {

	var boss = tab.split(' ')[0];

	var indices = rows.map(it => 'TheLab ' + it.cells[2].textContent);
	var ids = rows.map(it => it.cells[0].getAttribute('id'));
	var medias = <string[]> ids.map(getLabManualTimelineURL.bind(null, baseURL, gids[tab]));

	var unitRows = rows.map(it => getSiblingRowElement(it, 2));
	var damages = unitRows.map(it => parseLabManualDamage(boss, (<HTMLTableRowElement>it.previousSibling).cells[4].textContent));
	var unitNames = unitRows.map(it => Array.from(it.cells).splice(1, 5).map(it => it.textContent || ''));

	var buildRows = unitRows.map(it => getSiblingRowElement(it, 5));
	var levels = buildRows.map(it => Array.from(it.cells).splice(2, 5).map(it => (it.textContent || '').trim()));
	var ranks = buildRows.map(it => Array.from(getSiblingRowElement(it, 1).cells).splice(2, 5).map(it => (it.textContent || '').trim()));
	var stars = buildRows.map(it => Array.from(getSiblingRowElement(it, 3).cells).splice(2, 5).map(it => (it.textContent || '').trim()));
	var ues = buildRows.map(it => Array.from(getSiblingRowElement(it, 4).cells).splice(2, 5).map(it => (it.textContent || '').trim()));

	var teams = <ClanBattleTeam[]> [];

	for (var i = 0; i < rows.length; i++) {
		teams.push({
			boss: boss,
			region: 'global',
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

function extractLabManualTeams(
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

		var rows = statusCells.map(it => <HTMLTableRowElement> it.closest('tr')).filter(it => it && getSiblingRowElement(it, 1).cells[2].textContent != '');

		teams = teams.concat(extractLabManualTeamsFromTab(href, gids, pageNames[i], rows));
	}

	teams.forEach(team => {
		team.units.forEach(unit => {
			unit.name = fixUnitName(unit.name);
		})
	});

	labManualTeams = teams;

	updateExtraTeamsHelper();
}

function extractLabManualTeamsLocal(
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
		var fileName = '/test/thelab_manual/' + encodeURIComponent(tab) + '.html';

		var xhr = new XMLHttpRequest();
		xhr.open('GET', fileName, false)

		xhr.onload = function() {
			var container = document.implementation.createHTMLDocument().documentElement;
			container.innerHTML = xhr.responseText;

			var statusCells = Array.from(container.querySelectorAll('td')).filter(it => (it.textContent || '').toUpperCase() == 'STATUS');

			var rows = statusCells.map(it => <HTMLTableRowElement> it.closest('tr')).filter(it => getSiblingRowElement(it, 1).cells[2].textContent != '');

			Array.prototype.push.apply(teams, extractLabManualTeamsFromTab(baseURL || '', gids, tab, rows));
		}

		xhr.send(null);
	}

	teams.forEach(team => {
		team.units.forEach(unit => {
			unit.name = fixUnitName(unit.name);
		})
	});

	labManualTeams = teams;

	updateExtraTeamsHelper();

	console.log(teams.map(getTeamAsCSVRow).join('\n'));
}
