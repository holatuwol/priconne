function getRemainingHitsByBossListItem(
	status: ClanBattleStatus,
	playerName: string,
	bossName: string,
	timeline: string | undefined,
	borrow: string | undefined,
	carryover: string | undefined,
) : HTMLLIElement {

	var listItem = document.createElement('li');

	listItem.setAttribute('data-player-name', playerName);

	if (carryover) {
		listItem.classList.add('carryover');

		var carryoverDescription = [];

		if (timeline) {
			carryoverDescription.push(timeline);
		}

		carryoverDescription.push(carryover);

		var remainingHits = status.allocation.remaining.filter(it => it.playerName == playerName).filter(it => !it.carryover).map(it => it.bossName);

		if (remainingHits.length > 0) {
			var flexHitCount = remainingHits.filter(it => it == 'flex').length;

			if (flexHitCount == 1) {
				carryoverDescription.push('1 flex hit after');
			}
			else if (flexHitCount > 0) {
				carryoverDescription.push(flexHitCount + ' flex hits after');
			}
			else {
				carryoverDescription.push('needs to hit ' + remainingHits.join(', ') + ' after');
			}
		}

		listItem.textContent = playerName + ' (' + carryoverDescription.join(', ') + ')';
	}
	else {
		listItem.classList.add('remaining');

		listItem.appendChild(document.createTextNode(playerName));

		var extraInfo = <Node[]> [];

		if (bossName != 'flex' && timeline) {
			var elements = <Node[]> [];

			if (typeof(getTimelineTimingElements) == 'function') {
				elements = getTimelineTimingElements(bossName, timeline, 'manual', undefined);
				elements[1].textContent = elements[0].textContent;

				if (extraInfo.length > 0) {
					extraInfo.push(document.createTextNode(', '));
				}

				extraInfo.push(elements[1]);
			}
			else {
				extraInfo.push(document.createTextNode(timeline));
			}
		}

		if (borrow) {
			if (extraInfo.length > 0) {
				extraInfo.push(document.createTextNode(', '));
			}

			extraInfo.push(document.createTextNode(borrow));
		}

		if (playerName in status.carryover) {
			if (extraInfo.length > 0) {
				extraInfo.push(document.createTextNode(', '));
			}

			listItem.classList.add('locked');
			extraInfo.push(document.createTextNode('locked on ' + status.carryover[playerName]));
		}

		if (extraInfo.length) {
			listItem.appendChild(document.createTextNode(' ('));

			for (var i = 0; i < extraInfo.length; i++) {
				listItem.appendChild(extraInfo[i]);
			}

			listItem.appendChild(document.createTextNode(')'));
		}
	}

	return listItem;
}

function updateRemainingHitsByBoss(
	status: ClanBattleStatus,
	acc: Record<string, HTMLSpanElement>,
	hit: AllocatedHit
) : Record<string, HTMLSpanElement> {

	var bossName = hit.carryover ? (hit.carryoverBossName || hit.bossName) : hit.bossName;
	var timeline = hit.carryover ? (hit.carryoverTimeline || hit.timeline) : hit.timeline;

	var container = acc[bossName];

	if (container == null) {
		container = acc[bossName] = document.createElement('span');

		var header = document.createElement('h4');
		header.textContent = bossName;
		container.appendChild(header);

		var list = document.createElement('ul');
		container.appendChild(list);
	}

	var list = container.querySelector('ul');

	list.appendChild(getRemainingHitsByBossListItem(status, hit.playerName, hit.bossName, hit.timeline, hit.borrow, hit.carryover));

	if (!hit.carryover && hit.carryoverBossName) {
		var container = acc[hit.carryoverBossName];

		if (container == null) {
			container = acc[hit.carryoverBossName] = document.createElement('span');

			var header = document.createElement('h4');
			header.textContent = hit.carryoverBossName;
			container.appendChild(header);

			var list = document.createElement('ul');
			container.appendChild(list);
		}

		var list = container.querySelector('ul');

		list.appendChild(getRemainingHitsByBossListItem(status, hit.playerName, hit.carryoverBossName, hit.carryoverTimeline, hit.borrow, hit.carryover));
	}

	return acc;
}

function renderRemainingHitsByBoss(status: ClanBattleStatus) : void {
	var container = <HTMLDivElement> document.getElementById('remaining-hits-by-boss');

	if (!container) {
		return;
	}

	var hitsByBoss = <Record<string, HTMLSpanElement>> {};
	hitsByBoss = status.allocation.remaining.reduce(updateRemainingHitsByBoss.bind(null, status), hitsByBoss);

	var bossNames = Array.from(Object.keys(hitsByBoss));
	bossNames.sort(Intl.Collator().compare);

	container.innerHTML = '';

	for (var i = 0; i < bossNames.length; i++) {
		container.appendChild(hitsByBoss[bossNames[i]]);
	}

	var fullHitCountElement = <HTMLSpanElement> document.getElementById('remaining-full-hit-count');
	fullHitCountElement.textContent = '' + status.allocation.remaining.filter(it => !it.carryover).length;

	var carryoverHitCountElement = <HTMLSpanElement> document.getElementById('remaining-carryover-hit-count')
	carryoverHitCountElement.textContent = '' + status.allocation.remaining.filter(it => it.carryover).length;
}

function getDisplayName(hit: AllocatedHit) : string {
	var bossName = hit.carryoverBossName ? (hit.bossName + ' \u21FE ' + hit.carryoverBossName) : hit.bossName;
	var timeline = hit.carryoverTimeline ? (hit.timeline + ' \u21FE ' + hit.carryoverTimeline) : hit.timeline;

	return hit.bossName == 'flex' ? 'flex' :
		!timeline || timeline == 'unspecified allocation change' ? (bossName + ' (?)') :
		timeline.indexOf('ambiguous ') == 0 ? timeline.substring('ambiguous '.length) :
		timeline;
}

function updateRemainingHitsByPlayer(
	acc: Record<string, HTMLTableRowElement>,
	hit: AllocatedHit
) : Record<string, HTMLTableRowElement> {

	var row = acc[hit.playerName];

	if (row == null) {
		row = acc[hit.playerName] = document.createElement('tr');

		var cell = document.createElement('td');
		cell.textContent = hit.playerName;
		row.appendChild(cell);
	}

	var text = null;
	var cssClass = null;

	if (hit.carryover && hit.damage) {
		return acc;
	}
	else if (hit.carryover) {
		text = getDisplayName(hit) + ' (' + hit.carryover + ')';
		cssClass = 'carryover';
	}
	else {
		text = getDisplayName(hit);
		cssClass = hit.damage ? 'completed' : 'remaining';
	}

	cell = document.createElement('td');
	cell.textContent = text;
	cell.classList.add(cssClass);
	row.appendChild(cell);

	return acc;
}

function renderRemainingHitsByPlayer(status: ClanBattleStatus) : void {
	var table = <HTMLTableElement | null> document.querySelector('#remaining-hits-by-player table');

	if (!table) {
		return;
	}

	var hitsByPlayer = <Record<string, HTMLTableRowElement>> {};
	hitsByPlayer = status.allocation.completed.reduce(updateRemainingHitsByPlayer, hitsByPlayer);
	hitsByPlayer = status.allocation.remaining.reduce(updateRemainingHitsByPlayer, hitsByPlayer);

	var tbody = table.tBodies[0];
	tbody.innerHTML = '';

	var playerNames = Array.from(Object.keys(hitsByPlayer));
	playerNames.sort(Intl.Collator().compare);

	for (var i = 0; i < playerNames.length; i++) {
		var row = hitsByPlayer[playerNames[i]];

		if (row.querySelectorAll('.completed').length == 3) {
			continue;
		}

		tbody.appendChild(row);
	}
}
