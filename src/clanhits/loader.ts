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
		else if (columnNames[i] == 'TL Used') {
			acc.timeline = it.textContent || '';
		}
		else if (columnNames[i].indexOf('Carryover') == 0) {
			var carryover = it.textContent || '+';

			if (carryover.indexOf('+') == -1) {
				acc.carryover = carryover;
			}
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
			else if (checkHit.timeline && checkHit.timeline == completedHit.timeline) {
				timelineMatchIndex = i;
			}
			else if (checkHit.bossName == completedHit.bossName || checkHit.bossName == 'flex') {
				bossMatchIndex = i;
			}
			else {
				playerMatchIndex = i;
			}
		}
	}

	var newRemaining = <AllocatedHit[]> [];

	if (carryoverMatchIndex != -1) {
		newRemaining = oldAllocation.remaining.filter((it, i) => i != carryoverMatchIndex);

		var playerHits = oldAllocation.completed.filter(it => it.playerName == completedHit.playerName);

		var lastTimeline = playerHits[playerHits.length - 1].timeline;

		if (lastTimeline) {
			completedHit.timeline = lastTimeline;
		}
	}
	else if (timelineMatchIndex != -1) {
		newRemaining = oldAllocation.remaining.filter((it, i) => i != timelineMatchIndex);
	}
	else if (bossMatchIndex != -1) {
		var ambiguousTLs = oldAllocation.remaining.filter(it => it.playerName == completedHit.playerName && it.bossName == completedHit.bossName).map(it => it.timeline);

		if (ambiguousTLs.length > 1) {
			var ambiguousName = 'ambiguous ' + ambiguousTLs.join('/');
			var ambiguousHits = <AllocatedHit[]> [];

			completedHit.timeline = ambiguousName;

			for (var i = 1; i < ambiguousTLs.length; i++) {
				ambiguousHits.push({
					bossName: completedHit.bossName,
					timeline: ambiguousName,
					playerName: completedHit.playerName,
					day: completedHit.day
				});
			}

			newRemaining = oldAllocation.remaining.filter(it => it.playerName != completedHit.playerName || it.bossName != completedHit.bossName).concat(ambiguousHits);
		}
		else {
			if (!completedHit.timeline) {
				completedHit.timeline = oldAllocation.remaining[bossMatchIndex].timeline;
			}

			newRemaining = oldAllocation.remaining.filter((it, i) => i != bossMatchIndex);
		}
	}
	else {
		completedHit.timeline = 'unspecified allocation change';

		var unknownHitCount = oldAllocation.remaining.filter(it => it.playerName == completedHit.playerName).length;
		var unknownHits = <AllocatedHit[]> [];

		for (var i = 1; i < unknownHitCount; i++) {
			unknownHits.push({
				bossName: 'flex',
				timeline: 'unspecified allocation change',
				playerName: completedHit.playerName,
				day: completedHit.day
			});
		}

		newRemaining = oldAllocation.remaining.filter(it => it.playerName != completedHit.playerName).concat(unknownHits);
	}

	if (!completedHit.timeline) {
		console.log(completedHit);
	}

	return {
		completed: oldAllocation.completed.concat([completedHit]),
		remaining: newRemaining
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
		if (!completedHit.carryover || completedHit.carryover.indexOf('+') != -1) {
			completedHit.carryover = Math.min(90, Math.ceil(110-90*oldStatus.remainingHP/damage)) + 's+';
		}
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

function getNextDayInitialStatus(
	baseStatus : ClanBattleStatus
) : ClanBattleStatus {

	var dummyStatus = Object.assign(<ClanBattleStatus> {}, baseStatus);

	dummyStatus.day = '' + (parseInt(baseStatus.day) + 1);
	dummyStatus.hitNumber = 0;
	dummyStatus.allocation = getInitialAllocation(dummyStatus.day);
	dummyStatus.carryover = <Record<string, string>> {};

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

function processHitRecords(
	responseText: string,
	href: string,
	container: HTMLElement
) : boolean {

	if (!processedInitialAllocations) {
		setTimeout(processHitRecords.bind(null, responseText, href, container), 500);

		return true;
	}

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

	processCompletedHits(cbId, container, gids['DPS Log']);

	setTimeout(function() : void {
		renderStatusHistory();
		renderClanBattleStatus();
	}, 500);

	return true;
}

function loadClanBattleHits() : void {
	if (allocationSheetId) {
		var allocationLink = <HTMLAnchorElement> document.getElementById('allocation-data-link');

		allocationLink.href = 'https://docs.google.com/spreadsheets/d/' + allocationSheetId + '/htmlview';
		allocationLink.textContent = allocationLink.href;

		expandGoogleSheetURLs(allocationSheetId, null, processInitialAllocations);
	}

	if (hitRecordSheetId) {
		var hitRecordLink = <HTMLAnchorElement> document.getElementById('hit-record-data-link');

		hitRecordLink.href = 'https://docs.google.com/spreadsheets/d/' + hitRecordSheetId + '/edit';
		hitRecordLink.textContent = hitRecordLink.href;

		expandGoogleSheetURLs(hitRecordSheetId, null, processHitRecords);
	}
}

loadClanBattleHits();