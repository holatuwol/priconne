var processedInitialAllocations = false;

function isBossNameCell(cell: HTMLTableCellElement) : boolean {
	if (cell.getAttribute('colspan') != '2') {
		return false;
	}

	var cellContent = cell.textContent;

	if (!cellContent) {
		return false;
	}

	if (cellContent.length != 2) {
		return false;
	}

	var isBossName = cellContent.charAt(0) >= 'A' && cellContent.charAt(0) <= 'Z' &&
		cellContent.charAt(1) >= '1' && cellContent.charAt(1) <= '5';

	if (!isBossName) {
		return false;
	}

	var nextCell = cell.nextSibling;

	if (!nextCell) {
		return false;
	}

	var nextCellContent = nextCell.textContent;

	if (!nextCellContent) {
		return false;
	}

	if (nextCellContent.length != 5) {
		return false;
	}

	return nextCellContent.indexOf('.') == 2;
}

function processAllocationRow(
	day: string,
	allocatedHits: AllocatedHit[],
	row: HTMLTableRowElement
) : AllocatedHit[] {

	var freezebarCell = <HTMLTableCellElement> row.querySelector('.freezebar-cell');
	var beforeFreezebarCell = <HTMLTableCellElement> freezebarCell.previousSibling;

	if (beforeFreezebarCell.getAttribute('rowspan') != '2') {
		return allocatedHits;
	}

	var playerNameCell = <HTMLTableCellElement> beforeFreezebarCell.previousSibling;
	var playerName = playerNameCell.textContent || '';

	var carryoverRow = <HTMLTableRowElement> row.nextSibling;

	for (var i = 9; i < row.cells.length; i++) {
		if (!isBossNameCell(row.cells[i])) {
			continue;
		}

		allocatedHits.push(<AllocatedHit> {
			borrow: row.cells[i+7].textContent || '',
			bossName: row.cells[i].textContent || '',
			day: day,
			playerName: playerName,
			timeline: row.cells[i+1].textContent || '',
			carryoverBossName: carryoverRow.cells[i-2].textContent || '',
			carryoverTimeline: carryoverRow.cells[i-1].textContent || ''
		});
	}

	return allocatedHits;
}

function isAllocationRow(row: HTMLTableRowElement) : boolean {
	return Array.from(row.cells).filter((it, i) => i > 9 && isBossNameCell(it)).length > 0;
}

function processInitialAllocation(
	container: HTMLElement,
	tabId: string,
	index: number
) : void {

	var tab = <HTMLDivElement> container.querySelector('div[id="' + tabId + '"]');

	var rows = Array.from(tab.querySelectorAll('tr'));

	var allocatedHits = <AllocatedHit[]> rows.filter(isAllocationRow).reduce(processAllocationRow.bind(null, '' + index), []);

	allocatedHits.sort(
		(a, b) => a.playerName != b.playerName ? a.playerName.localeCompare(b.playerName) :
			a.bossName != b.bossName ? a.bossName.localeCompare(b.bossName) :
			(a.timeline || '').localeCompare(b.timeline || ''));

	var hitCounts = allocatedHits.reduce((acc, next) => {
		acc[next.playerName] = (acc[next.playerName] || 0) + 1;
		return acc;
	}, <Record<string, number>> {})

	for (var playerName in hitCounts) {
		for (var i = hitCounts[playerName]; i < 3; i++) {
			allocatedHits.push({
				day: '' + index,
				bossName: 'flex',
				playerName: playerName
			});
		}
	}

	initialAllocations['' + index] = allocatedHits;
}

function processInitialAllocations(
	responseText: string,
	href: string,
	container: HTMLElement
) : boolean {

	var tabs = <HTMLLIElement[]> Array.from(container.querySelectorAll('#sheet-menu li'));

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

	var seenDays = new Set();

	for (var i = 5; i >= 1; i--) {
		var prefix = 'Allo - Day ' + i + '+';

		for (key in gids) {
			if (key.indexOf(prefix) == 0) {
				for (var j = i; j <= 5; j++) {
					seenDays.add(j);
					processInitialAllocation(container, gids[key], j);
				}
			}
		}
	}

	for (var i = 1; i <= 5; i++) {
		if (seenDays.has(i)) {
			continue;
		}

		var key = 'Allo - Day ' + i;

		if (!(key in gids)) {
			continue;
		}

		seenDays.add(i);
		processInitialAllocation(container, gids[key], i);
	}

	processedInitialAllocations = true;

	return true;
}