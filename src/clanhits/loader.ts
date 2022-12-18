var statusHistory = <ClanBattleStatus[]> [];
var initialAllocations = <Record<string, AllocatedHit[]>> {};

var carryoverRE = /^[0-9]+s/;

function getInitialAllocation(day: string) : Allocation {
	return {
		completed: <AllocatedHit[]> [],
		remaining: <AllocatedHit[]> initialAllocations[day] || []
	};
}

function getInitialClanBattleStatus(cbId: string) : ClanBattleStatus {
	return {
		allocation: getInitialAllocation('1'),
		carryover: <Record<string, string>> {},
		day: '1',
		hitNumber: 0,
		index: 0,
		lap: 1,
		latestHit: null,
		remainingHP: getBossMaxHP(cbId, 1, 0)
	};
}

function getCompletedHit(
	cbId: string,
	status: ClanBattleStatus,
	columnNames: string[],
	row: HTMLTableRowElement
) : AllocatedHit {

	var hit = <AllocatedHit> {
		bossName: getBossName(cbId, status.lap, status.index)
	};

	hit = Array.from(row.cells).reduce((acc, it, i) => {
		if ((i == 0) || !columnNames[i]) {
			return acc;
		}

		if (columnNames[i] == 'Actual Damage') {
			acc.damage = parseInt((it.textContent || '0').replace(/[^0-9]/g, ''));
		}
		else if (columnNames[i] == 'Day') {
			acc.day = '' + parseInt(it.textContent || '0');
		}
		else if (columnNames[i] == 'Name') {
			acc.playerName = it.textContent || '';
		}
		else if (columnNames[i] == 'Piloted by') {
			acc.pilot = it.textContent || '';
		}

		return acc;
	}, hit);

	hit.pilot = hit.pilot || hit.playerName;

	return hit;
}

function getUpdatedAllocation(
	oldAllocation: Allocation,
	completedHit: AllocatedHit
) : Allocation {

	var playerMatchIndex = -1;
	var bossMatchIndex = -1;
	var timelineMatchIndex = -1;
	var carryoverMatchIndex = -1;

	for (var i = 0; i < oldAllocation.remaining.length && timelineMatchIndex == -1; i++) {
		var checkHit = oldAllocation.remaining[i];

		if (checkHit.playerName == completedHit.playerName) {
			if (checkHit.carryover) {
				carryoverMatchIndex = i;
			}
			else if (checkHit.timeline == completedHit.timeline) {
				timelineMatchIndex = i;
			}
			else if (checkHit.bossName == completedHit.bossName) {
				bossMatchIndex = i;
			}
			else {
				playerMatchIndex = i;
			}
		}
	}

	var matchIndex = (carryoverMatchIndex != -1) ? carryoverMatchIndex :
		(timelineMatchIndex != -1) ? timelineMatchIndex :
		(bossMatchIndex != -1) ? bossMatchIndex : playerMatchIndex;

	return {
		completed: oldAllocation.completed.concat([completedHit]),
		remaining: oldAllocation.remaining.filter((it, i) => i != matchIndex)
	};
}

function getUpdatedClanBattleStatus(
	cbId: string,
	oldStatus: ClanBattleStatus,
	completedHit: AllocatedHit
) : ClanBattleStatus {

	var playerName = completedHit.playerName;
	var damage = completedHit.damage || 0;

	var newStatus = Object.assign(<ClanBattleStatus> {}, oldStatus);

	completedHit.lap = oldStatus.lap;

	newStatus.day = completedHit.day;
	newStatus.latestHit = completedHit;

	if (!oldStatus.carryover.hasOwnProperty(playerName) && oldStatus.remainingHP <= damage) {
		completedHit.carryover = Math.min(90, Math.ceil(110-90*oldStatus.remainingHP/damage)) + 's+';
	}

	if (oldStatus.day == newStatus.day) {
		newStatus.hitNumber++;
		newStatus.carryover = Object.assign(<Record<string, string>> {}, oldStatus.carryover);
		newStatus.allocation = getUpdatedAllocation(oldStatus.allocation, completedHit);
	}
	else {
		newStatus.hitNumber = 1;
		newStatus.carryover = <Record<string, string>> {};
		newStatus.allocation = getUpdatedAllocation(getInitialAllocation(newStatus.day), completedHit);
	}

	newStatus.remainingHP = Math.max(0, oldStatus.remainingHP - damage);

	if (newStatus.carryover.hasOwnProperty(playerName)) {
		delete newStatus.carryover[playerName];
	}
	else if (newStatus.remainingHP == 0) {
		newStatus.carryover[playerName] = completedHit.bossName;

		var carryoverHit = Object.assign({}, completedHit);
		delete carryoverHit['damage'];
		newStatus.allocation.remaining.push(carryoverHit);
	}

	if (newStatus.remainingHP == 0) {
		newStatus.index = (newStatus.index + 1) % 5;

		if (newStatus.index == 0) {
			newStatus.lap++;
		}

		newStatus.remainingHP = getBossMaxHP(cbId, newStatus.lap, newStatus.index);
	}

	return newStatus;
}

function updateAllocatedHits(
	allocatedHits: AllocatedHit[],
	lapRow: HTMLTableRowElement,
	day: string
) : void {

	var lapCell = <HTMLTableCellElement> lapRow.querySelector('td[colspan="25"]');
	var lap = (lapCell.textContent || 'Lap 0').trim().substring(4);

	var memberIndices = Array.from(getSiblingRowElement(lapRow, 2).cells).map((it, i) => it.textContent == 'Member' ? i : -1).filter(it => it != -1);

	var nextRow = <HTMLTableRowElement | null> getSiblingRowElement(lapRow, 3);

	while (nextRow != null && nextRow.querySelector('td[colspan]') == null) {
		Array.prototype.push.apply(allocatedHits, getAllocatedHits(nextRow, lap == '0' ? 'flex' : lap, memberIndices, day));
		nextRow = <HTMLTableRowElement | null> nextRow.nextSibling;
	}
}

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

function processInitialAllocation(
	container: HTMLElement,
	tabId: string,
	index: number
) : void {

	var lapRows = <HTMLTableRowElement[]>Array.from(container.querySelectorAll('[id="' + tabId + '"] tr td[colspan="25"]')).map(it => <HTMLTableRowElement> it.closest('tr'));

	var allocatedHits = <AllocatedHit[]> [];

	for (var i = 0; i < lapRows.length; i++) {
		updateAllocatedHits(allocatedHits, lapRows[i], '' + index);
	}

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

	initialAllocations['' + index] = allocatedHits
}

function getNextDayInitialStatus(
	baseStatus : ClanBattleStatus
) : ClanBattleStatus {

	var dummyStatus = Object.assign(<ClanBattleStatus> {}, baseStatus);

	dummyStatus.day = '' + (parseInt(baseStatus.day) + 1);
	dummyStatus.hitNumber = 0;
	dummyStatus.allocation = getInitialAllocation(dummyStatus.day);

	return dummyStatus;
}

function processCompletedHits(
	cbId: string,
	container: HTMLElement,
	tabId: string
) : void {

	var rows = <HTMLTableRowElement[]>Array.from(container.querySelectorAll('[id="' + tabId + '"] tr'));
	var headerRowIndex = rows.map(it => it.cells[2].textContent == 'Day').indexOf(true);

	if (headerRowIndex == -1) {
		return;
	}

	var headerRow = rows[headerRowIndex];
	var columnNames = Array.from(headerRow.cells).map(it => (it.textContent || '').trim());

	var damageIndex = columnNames.indexOf('Actual Damage');

	if (damageIndex == -1) {
		return;
	}

	var dataRows = rows.slice(headerRowIndex + 1).filter(it => it.cells[1].textContent && it.cells[damageIndex].textContent);

	var oldStatus = getInitialClanBattleStatus(cbId);

	statusHistory = [oldStatus];

	for (var i = 0; i < dataRows.length; i++) {
		var newStatus = getUpdatedClanBattleStatus(cbId, oldStatus, getCompletedHit(cbId, oldStatus, columnNames, dataRows[i]));

		if (newStatus.day != '1' && newStatus.hitNumber == 1) {
			statusHistory.push(getNextDayInitialStatus(oldStatus));
		}

		statusHistory.push(newStatus);

		oldStatus = newStatus;
	}

	while (oldStatus.day != '5') {
		newStatus = getNextDayInitialStatus(oldStatus);
		statusHistory.push(newStatus);
		oldStatus = newStatus;
	}
}