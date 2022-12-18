document.body.style.opacity = '0.1';

var clanUnits = <Record<string, Record<string, ClanBattleBuild>>> {};
var allocatedHits = <AllocatedHit[]> [];

function getUnitEquipValues(
	sliceIndex: number,
	row: HTMLTableRowElement
) : string[] {

	return Array.from(row.querySelectorAll('td')).slice(sliceIndex, sliceIndex + 30).map(it => it.textContent || '');
}

function loadUnitEquip(container: HTMLElement) : void {
	var freezebarCell = <HTMLTableCellElement> container.querySelector('tbody tr td.freezebar-cell')
	var playersRow = <HTMLTableRowElement> freezebarCell.closest('tr');

	var playersCells = Array.from(playersRow.querySelectorAll('td'));
	var playersIndex = playersCells.indexOf(freezebarCell) + 2;

	var players = getUnitEquipValues(playersIndex, playersRow);

	var unitsRows = Array.from(container.querySelectorAll('tr img')).map(it => <HTMLTableRowElement> it.closest('tr'));

	var units = <string[]> unitsRows.map(it => fixUnitName(Array.from(it.querySelectorAll('td'))[playersIndex - 1].textContent || ''));
	var stars = <string[][]> unitsRows.map(getUnitEquipValues.bind(null, playersIndex));
	var levels = <string[][]> unitsRows.map(it => getSiblingRowElement(it, 1)).map(getUnitEquipValues.bind(null, playersIndex - 1));
	var ranks = <string[][]> unitsRows.map(it => getSiblingRowElement(it, 2)).map(getUnitEquipValues.bind(null, playersIndex - 1));
	var ues = <string[][]> unitsRows.map(it => getSiblingRowElement(it, 3)).map(getUnitEquipValues.bind(null, playersIndex));

	clanUnits = players.reduce((acc1, playerName, j) => {
		acc1[playerName] = units.map((unitName, i) => {
			return {
				name: unitName,
				build: {
					level: levels[i][j] || undefined,
					star: stars[i][j] || undefined,
					rank: ranks[i][j] || undefined,
					unique: ues[i][j] || undefined
				}
			};
		}).reduce((acc2, it) => {
			if (it.build.star) {
				acc2[it.name] = it.build;

				if (!it.build.level) {
					it.build.level = '1';
				}

				if (!it.build.rank) {
					it.build.rank = '1-0';
				}
			}

			return acc2;
		}, <Record<string, ClanBattleBuild>> {});

		return acc1;
	}, <Record<string, Record<string, ClanBattleBuild>>> {});
}

function processUnitEquips(
	responseText: string,
	href: string,
	container: HTMLElement
) : boolean {

	var tabs = container.querySelectorAll('#sheet-menu li');
	var gids = <Record<string, string>> {};

	for (var j = 0; j < tabs.length; j++) {
		var listItemId = tabs[j].getAttribute('id');

		if (!listItemId) {
			continue;
		}

		var tabId = listItemId.substring('sheet-button-'.length);
		var tabName = (tabs[j].textContent || '').trim();

		gids[tabName] = tabId;
	}

	loadUnitEquip(<HTMLElement> container.querySelector('div[id="' + gids['UnitEquip'] + '"]'));

	processedUnitEquips = true;

	return true;
}

var processedUnitEquips = false;
var sheetIds = document.location.search ? document.location.search.substring(1).split('&') : defaultSheetIds;
var viewedSheetIdCount = 0;

function initializeMatchingPlayers(
	callback: (responseText: string, href: string, container: HTMLElement) => boolean,
	responseText: string,
	href: string,
	container: HTMLElement
) : boolean {

	var value = callback(responseText, href, container);

	if (++viewedSheetIdCount == sheetIds.length) {
		document.body.style.opacity = '1.0';
	}

	return value;
}

expandGoogleSheetURLs(sheetIds[0], null, initializeMatchingPlayers.bind(null, processUnitEquips), () => {});
expandGoogleSheetURLs(sheetIds[1], null, undefined, initializeMatchingPlayers.bind(null, loadTeams.bind(null, updateDefaultTeams)));