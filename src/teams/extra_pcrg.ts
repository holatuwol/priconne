function getPCRGUnits(
	memberRow: HTMLTableRowElement,
	startIndex: number
) : ClanBattleUnit[] {

	var names = Array.from(memberRow.cells).slice(startIndex, startIndex+5).map(it => it.textContent ? it.textContent.substring(1, (it.textContent || '').length - 1) : '');
	var stars = Array.from(getSiblingRowElement(memberRow, 1).cells).slice(startIndex, startIndex+5).map(it => (it.textContent || '').length + '⭐');
	var ranks = Array.from(getSiblingRowElement(memberRow, 2).cells).slice(startIndex, startIndex+5).map(it => it.textContent || '');
	var ues = Array.from(getSiblingRowElement(memberRow, 3).cells).slice(startIndex, startIndex+5).map(it => it.textContent || '');

	var units = <ClanBattleUnit[]> [];

	for (var i = 0; i < 5; i++) {
		units.push({
			name: fixUnitName(names[i]),
			build: {
				star: stars[i],
				rank: ranks[i],
				unique: ues[i]
			}
		})
	}

	return units;
}

function getPCRGTimelineURL(
	baseURL: string,
	gid: string,
	memberRow: HTMLTableRowElement
) : string {

	var searchRow = memberRow;

	while (!isUnitImagesRow(searchRow)) {
		if (!searchRow.previousSibling) {
			return '';
		}

		searchRow = <HTMLTableRowElement> searchRow.previousSibling;
	}

	var id = searchRow.cells[0].getAttribute('id') || '';

	var x = id.indexOf('R');

	return baseURL + '?gid=' + gid + '#' + id;
}

function isUnitImagesRow(row: HTMLTableRowElement) : boolean {
	var matchingColumnCount = row.querySelectorAll('td[rowspan="5"]').length;

	return matchingColumnCount > 0 && matchingColumnCount % 5 == 0;
}

function getPCRGSemiAutoDamage(
	memberRow: HTMLTableRowElement,
	startIndex: number
) : string | null {

	var searchRow = memberRow;

	while (!isUnitImagesRow(searchRow)) {
		if (!searchRow.previousSibling) {
			return null;
		}

		searchRow = <HTMLTableRowElement> searchRow.previousSibling;
	}

	for (var i = startIndex; i < searchRow.cells.length; i++) {
		var colspan = parseInt(searchRow.cells[i].getAttribute('colspan') || '1') || 1;

		if (colspan != 15 && colspan != 7) {
			continue;
		}

		var matcher = simpleRE.exec(searchRow.cells[i].textContent || '');

		return matcher ? matcher[0] : null;
	}

	return null;
}

function getPCRGFullAutoDamage(
	memberRow: HTMLTableRowElement,
	startIndex: number
) : string | null {

	var searchRow = memberRow;

	while (!isUnitImagesRow(searchRow)) {
		if (!searchRow.previousSibling) {
			return null;
		}

		searchRow = <HTMLTableRowElement> searchRow.previousSibling;
	}

	for (var i = startIndex; i < searchRow.cells.length; i++) {
		var colspan = parseInt(searchRow.cells[i].getAttribute('colspan') || '1') || 1;

		if (colspan != 8) {
			continue;
		}

		var matcher = simpleRE.exec(searchRow.cells[i].textContent || '');

		return matcher ? matcher[0] : null;
	}

	searchRow = memberRow;

	while (!searchRow.querySelector('td[colspan="15"]:not([rowspan])')) {
		if (!searchRow.nextSibling) {
			return null;
		}

		searchRow = <HTMLTableRowElement> searchRow.nextSibling;
	}

	for (var i = startIndex; i < searchRow.cells.length; i++) {
		var colspan = parseInt(searchRow.cells[i].getAttribute('colspan') || '1') || 1;

		if (colspan != 15) {
			continue;
		}

		var matcher = simpleRE.exec(searchRow.cells[i].textContent || '');

		return matcher ? matcher[0] : null;
	}

	return null;
}

function getPCRGManualDamage(
	memberRow: HTMLTableRowElement,
	teamInRowIndex: number
) : string | null {

	var searchRow = memberRow;

	while (!searchRow.querySelector('td[colspan="10"]')) {
		if (!searchRow.nextSibling) {
			return null;
		}

		searchRow = <HTMLTableRowElement> searchRow.nextSibling;
	}

	var damageSpan = searchRow.querySelectorAll('td[colspan="10"]')[teamInRowIndex];

	var matcher = simpleRE.exec(damageSpan.textContent || '');

	return matcher ? matcher[0] : null;
}

function updatePCRGTeams(
	baseURL: string,
	gids: Record<string, string>,
	boss: string,
	container: HTMLElement
) : ClanBattleTeam[] {

	var memberRows = Array.from(container.querySelectorAll('tr')).filter(it1 => {
		var memberCells = Array.from(it1.cells).filter(it2 => it2 && it2.textContent && it2.textContent.indexOf('[') != -1);
		return memberCells.length > 0 && (memberCells.length % 5) == 0;
	});

	var teams = <ClanBattleTeam[]> [];

	for (var i = 0; i < memberRows.length; i++) {
		var memberRow = memberRows[i];
		var teamInRowIndex = -1;

		for (var j = 0; j < memberRows[i].cells.length; j++) {
			var content = memberRow.cells[j].textContent;

			if (!content || content.indexOf('[') == -1) {
				continue;
			}

			teamInRowIndex++;

			var units = getPCRGUnits(memberRow, j);
			var timeline = '/pcrg/ ' + getPCRGTimelineURL(baseURL, gids[boss], memberRow);

			var fullAutoDamage = getPCRGFullAutoDamage(memberRow, j);

			if (fullAutoDamage) {
				teams.push({
					boss: boss,
					region: 'global',
					timing: 'full auto',
					timeline: timeline,
					damage: fullAutoDamage,
					units: units
				});
			}

			var semiAutoDamage = getPCRGSemiAutoDamage(memberRow, j);

			if (semiAutoDamage) {
				teams.push({
					boss: boss,
					region: 'global',
					timing: 'semi auto',
					timeline: timeline,
					damage: semiAutoDamage,
					units: units
				});
			}

			j += 5;

			if (fullAutoDamage || semiAutoDamage) {
				continue;
			}

			var manualDamage = getPCRGManualDamage(memberRow, teamInRowIndex);

			if (manualDamage) {
				teams.push({
					boss: boss,
					region: 'global',
					timing: 'manual',
					timeline: timeline,
					damage: manualDamage,
					units: units
				});
			}
		}
	}

	return teams;
}

function extractPCRGTeams(
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
		var boss = pageNames[i];

		if (boss.length != 2) {
			continue;
		}

		var tabId = gids[boss];

		var tab = <HTMLDivElement | null> container.querySelector('div[id="' + tabId + '"]');

		if (!tab) {
			continue;
		}

		Array.prototype.push.apply(teams, updatePCRGTeams(href, gids, boss, tab));
	}

	pcrgTeams = teams;

	updateExtraTeamsHelper();
}

function extractPCRGTeamsLocal(
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
		var fileName = '/test/pcrg/' + encodeURIComponent(tab) + '.html';

		var boss = tab.split(' ')[0];

		var xhr = new XMLHttpRequest();
		xhr.open('GET', fileName, false);

		xhr.onload = function() {
			var container = document.implementation.createHTMLDocument().documentElement;
			container.innerHTML = xhr.responseText;

			Array.prototype.push.apply(teams, updatePCRGTeams(baseURL || '', gids, boss, container));
		}

		xhr.send(null);
	}

	teams.forEach(team => {
		team.units.forEach(unit => {
			unit.name = fixUnitName(unit.name);
		})
	});

	pcrgTeams = teams;

	updateExtraTeamsHelper();
}