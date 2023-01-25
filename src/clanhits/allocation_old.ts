var processedInitialAllocations = false;

function getAllocatedHits(
	tableRow: HTMLTableRowElement,
	lap: string,
	memberIndices: number[],
	day: string
) : AllocatedHit[] {

	return <AllocatedHit[]> memberIndices.map((it, i) => {
		var playerName = tableRow.cells[it].textContent;

		if (!playerName) {
			return null;
		}

		var timeline = <string> tableRow.cells[it+1].textContent;
		var borrow = <string> tableRow.cells[it+3].textContent;
		var bossName = lap == 'flex' ? 'flex' : getBossName(cbId, parseInt(lap), i);

		return {
			borrow: borrow,
			bossName: bossName,
			day: day,
			timeline: timeline,
			playerName: playerName,
		};
	}).filter(it => it);
}

function processInitialAllocationRaw(
	container: HTMLElement,
	tabId: string,
	index: number
) : AllocatedHit[] {

	var lapRows = <HTMLTableRowElement[]>Array.from(container.querySelectorAll('[id="' + tabId + '"] tr td[colspan="25"]')).map(it => <HTMLTableRowElement> it.closest('tr'));

	var allocatedHits = <AllocatedHit[]> [];

	for (var i = 0; i < lapRows.length; i++) {
		var lapRow = lapRows[i];

		var lapCell = <HTMLTableCellElement> lapRow.querySelector('td[colspan="25"]');
		var lap = (lapCell.textContent || 'Lap 0').trim().substring(4);

		var memberIndices = Array.from(getSiblingRowElement(lapRow, 2).cells).map((it, i) => it.textContent == 'Member' ? i : -1).filter(it => it != -1);

		var nextRow = <HTMLTableRowElement | null> getSiblingRowElement(lapRow, 3);

		while (nextRow != null && nextRow.querySelector('td[colspan]') == null) {
			Array.prototype.push.apply(allocatedHits, getAllocatedHits(nextRow, lap == '0' ? 'flex' : lap, memberIndices, '' + index));
			nextRow = <HTMLTableRowElement | null> nextRow.nextSibling;
		}
	}

	return allocatedHits;
}

function processInitialAllocationSummary(
	container: HTMLElement,
	tabId: string,
	index: number
) : AllocatedHit[] {

	var headerRow = <HTMLTableRowElement> Array.from(container.querySelectorAll('[id="' + tabId + '"] tr td')).filter(it => it.textContent == 'Member')[0].closest('tr');
	var memberIndex = -1;

	for (var i = 0; i < headerRow.cells.length && memberIndex == -1; i++) {
		if (headerRow.cells[i].textContent == 'Member') {
			memberIndex = i;
		}
	}

	var allocatedHits = <AllocatedHit[]> [];

	if (memberIndex == -1) {
		return allocatedHits;
	}

	var memberRow = <HTMLTableRowElement | null> headerRow.nextSibling;

	while (memberRow && memberRow.cells[memberIndex].textContent) {
		var playerName = <string> memberRow.cells[memberIndex].textContent;

		for (var i = 1; i <= 3; i++) {
			var timeline = memberRow.cells[memberIndex + i].textContent || '';

			allocatedHits.push({
				bossName: timeline.substring(0, 2),
				day: '' + index,
				timeline: timeline,
				playerName: playerName
			})
		}

		memberRow = <HTMLTableRowElement | null> memberRow.nextSibling;
	}

	return allocatedHits;
}

function processInitialAllocation(
	container: HTMLElement,
	tabId: string,
	index: number
) : void {

	var allocatedHits = processInitialAllocationSummary(container, tabId, index);

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

	for (var i = 1; i <= 5; i++) {
		var key = 'Day ' + i + ' Alloc';

		if (!(key in gids)) {
			key = 'Day ' + i;
		}

		if (!(key in gids)) {
			continue;
		}

		seenDays.add(i);
		processInitialAllocation(container, gids[key], i);
	}

	for (var i = 1; i <= 5; i++) {
		if (seenDays.has(i)) {
			continue;
		}

		var seenWildcard = false;

		for (var j = i; j >= 1 && !seenWildcard; j--) {
			var prefix = 'Day ' + j + '+';

			for (key in gids) {
				if (key.indexOf(prefix) == 0) {
					seenWildcard = true;
					processInitialAllocation(container, gids[key], i);
				}
			}
		}

	}

	processedInitialAllocations = true;

	return true;
}