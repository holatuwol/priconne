function getDisplayName(hit: AllocatedHit) : string {
	return !hit.timeline || hit.timeline.indexOf('-') == -1 ? hit.bossName : hit.timeline;
}

function updateRemainingHitsByBoss(
	status: ClanBattleStatus,
	acc: Record<string, HTMLSpanElement>,
	hit: AllocatedHit
) : Record<string, HTMLSpanElement> {

	var container = acc[hit.bossName];

	if (container == null) {
		container = acc[hit.bossName] = document.createElement('span');

		var header = document.createElement('h4');
		header.textContent = hit.bossName;
		container.appendChild(header);

		var list = document.createElement('ul');
		container.appendChild(list);
	}

	var list = container.querySelector('ul');

	var listItem = document.createElement('li');

	listItem.setAttribute('data-player-name', hit.playerName);

	if (hit.carryover) {
		listItem.classList.add('carryover');
		listItem.textContent = hit.playerName + ' (' + hit.carryover + ')';
	}
	else {
		var extraInfo = [
			hit.timeline || '',
			hit.borrow || ''
		].filter(it => it);

		listItem.classList.add('remaining');

		if (hit.playerName in status.carryover) {
			extraInfo.push('locked on ' + status.carryover[hit.playerName]);
			listItem.classList.add('locked');
		}

		listItem.textContent = hit.playerName + (extraInfo.length ? (' (' + extraInfo.join(', ') + ')') : '');
	}

	list.appendChild(listItem);

	return acc;
}

function renderRemainingHitsByBoss(status: ClanBattleStatus) : void {
	var hitsByBoss = <Record<string, HTMLSpanElement>> {};
	hitsByBoss = status.allocation.remaining.reduce(updateRemainingHitsByBoss.bind(null, status), hitsByBoss);

	var bossNames = Array.from(Object.keys(hitsByBoss));
	bossNames.sort(Intl.Collator().compare);

	var container = <HTMLDivElement> document.getElementById('remaining-hits-by-boss');
	container.innerHTML = '';

	for (var i = 0; i < bossNames.length; i++) {
		container.appendChild(hitsByBoss[bossNames[i]]);
	}
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
	var hitsByPlayer = <Record<string, HTMLTableRowElement>> {};
	hitsByPlayer = status.allocation.completed.reduce(updateRemainingHitsByPlayer, hitsByPlayer);
	hitsByPlayer = status.allocation.remaining.reduce(updateRemainingHitsByPlayer, hitsByPlayer);

	var table = <HTMLTableElement> document.querySelector('#remaining-hits-by-player table');
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
