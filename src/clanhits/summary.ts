var selectElement = <HTMLSelectElement> document.getElementById('status-history');

function updateSelectedIndex() : void {
	var selectedIndex = document.location.hash ? parseInt(document.location.hash.substring(1)) - 1 : -1;

	if (selectedIndex < 0 || selectedIndex >= statusHistory.length) {
		selectedIndex = statusHistory.length - 1;

		while (selectedIndex > 0 && statusHistory[selectedIndex].hitNumber == 0) {
			--selectedIndex;
		}

		var currentDate = new Date();

		var elapsed = Math.floor((currentDate.getTime() - cbStartDate.getTime()) / (1000 * 60 * 60 * 24));

		if (selectedIndex + 1 < selectElement.length && parseInt(statusHistory[selectedIndex].day) <= elapsed) {
			++selectedIndex;
		}
	}

	selectElement.selectedIndex = selectedIndex;

	var event = document.createEvent('HTMLEvents');
	event.initEvent('change', false, true);
	selectElement.dispatchEvent(event);
}

function renderStatusHistory() : void {
	var oldStatus = <ClanBattleStatus | null> null;

	var optgroupElement = <HTMLOptGroupElement> document.createElement('optgroup');
	optgroupElement.setAttribute('label', 'Lap 1');

	for (var i = 0; i < statusHistory.length; i++) {
		var newStatus = statusHistory[i];

		if (oldStatus != null && oldStatus.lap != newStatus.lap) {
			selectElement.appendChild(optgroupElement);
			optgroupElement = document.createElement('optgroup');
			optgroupElement.setAttribute('label', 'Lap ' + newStatus.lap);
		}

		var optionElement = document.createElement('option');
		optionElement.textContent = '[' + (i+1) + '] Day ' + newStatus.day + ', Hit ' + newStatus.hitNumber;

		if (optgroupElement != null) {
			optgroupElement.appendChild(optionElement);
		}

		oldStatus = newStatus;
	}

	selectElement.appendChild(optgroupElement);

	updateSelectedIndex();

	window.onhashchange = updateSelectedIndex;
	selectElement.onchange = renderClanBattleStatus;
}

function renderLapProgress(status: ClanBattleStatus) : void {
	var table = <HTMLTableElement> document.getElementById('lap-progress');

	var row = table.tBodies[0].rows[0];
	for (var i = row.cells.length - 1; i >= 1; i--) {
		row.cells[i].remove();
	}

	renderBossData(row, cbId, status.lap, status.index, status.remainingHP);
}

function updateCompletedHitsDetail(
	acc: Record<string, HTMLTableElement>,
	hit: AllocatedHit | null
) : Record<string, HTMLTableElement> {

	if (!hit) {
		return acc;
	}

	var key = 'T' + (hit.bossName.charCodeAt(0) - 64);
	var container = acc[key];

	if (container == null) {
		container = acc[key] = document.createElement('table');
		container.classList.add('table', 'sortable-theme-bootstrap');
		container.setAttribute('data-sortable', 'true');
		container.setAttribute('data-sortable-initialized', 'false');

		var row = document.createElement('tr');

		row.appendChild(createCell(true, 'Lap'));
		row.appendChild(createCell(true, 'Boss'));
		row.appendChild(createCell(true, 'Timeline'));
		row.appendChild(createCell(true, 'Player Name'));
		row.appendChild(createCell(true, 'Piloted By'));
		row.appendChild(createCell(true, 'Damage'));

		var head = document.createElement('thead');
		head.appendChild(row);
		container.appendChild(head);

		var body = document.createElement('tbody');
		container.appendChild(body);
	}

	var row = document.createElement('tr');

	var cell = createCell(false, hit.lap ? hit.lap.toLocaleString() : '0');
	cell.setAttribute('data-value', hit.lap ? ('' + hit.lap) : '0')
	row.appendChild(cell);

	row.appendChild(createCell(false, hit.bossName || ''));
	row.appendChild(createCell(false, hit.timeline || ''));
	row.appendChild(createCell(false, hit.playerName || '', 'player-name'));
	row.appendChild(createCell(false, hit.pilot || hit.playerName, 'player-name'));

	cell = createCell(false, hit.damage ? hit.damage.toLocaleString() : '0')
	cell.setAttribute('data-value', hit.damage ? ('' + hit.damage) : '0')
	row.appendChild(cell);

	container.tBodies[0].appendChild(row);

	return acc;
}

function renderCompletedHitsDetail(status: ClanBattleStatus) : void {
	var index = statusHistory.indexOf(status);
	var hitsByBoss = _.sortBy(statusHistory.filter((it, i) => i <= index).map(it => it.latestHit), 'damage').reverse().reduce(updateCompletedHitsDetail, <Record<string, HTMLTableElement[]>> {});

	var navigation = <HTMLDivElement> document.getElementById('completed-hits-detailTab');
	navigation.innerHTML = '';

	var container = <HTMLDivElement> document.getElementById('completed-hits-detailTabContent');
	container.innerHTML = '';

	var bosses = Object.keys(hitsByBoss).sort();

	for (var i = 0; i < bosses.length; i++) {
		var boss = bosses[i];
		var contentId = 'completed-hits-' + boss;
		var tabId = contentId + '-tab';

		var bossLink = document.createElement('a');
		bossLink.classList.add('nav-link');

		if (i == 0) {
			bossLink.classList.add('active');
		}

		bossLink.setAttribute('aria-controls', 	contentId);
		bossLink.setAttribute('aria-selected', '' + (i == 0));
		bossLink.setAttribute('data-toggle', 'tab');
		bossLink.setAttribute('id', tabId);
		bossLink.setAttribute('role', 'tab');

		bossLink.href = '#' + contentId;
		bossLink.textContent = boss;

		var bossItem = document.createElement('li');
		bossItem.classList.add('nav-item');
		bossItem.setAttribute('role', 'presentation');
		bossItem.appendChild(bossLink);

		var bossContainer = document.createElement('div');
		bossContainer.classList.add('tab-pane', 'fade');

		if (i == 0) {
			bossContainer.classList.add('show', 'active');
		}

		bossContainer.setAttribute('id', contentId);
		bossContainer.setAttribute('aria-labeledby', tabId);
		bossContainer.setAttribute('role', 'tabpanel');
		bossContainer.appendChild(hitsByBoss[boss]);

		navigation.appendChild(bossItem);
		container.appendChild(bossContainer);

	    Sortable.initTable(hitsByBoss[boss]);
	}
}

function updateCompletedHitsSummary(
	acc: Record<string, Record<string, number>>,
	hit: AllocatedHit | null
) : Record<string, Record<string, number>> {

	if (!hit) {
		return acc;
	}

	var pilot = hit.pilot || hit.playerName;

	var playerEntry = acc[pilot];

	if (playerEntry == null) {
		playerEntry = acc[pilot] = <Record<string, number>> {};
	}

	playerEntry[hit.bossName] = (playerEntry[hit.bossName] || 0) + 1;

	return acc;
}

function renderCompletedHitsSummary(status: ClanBattleStatus) : void {
	var index = statusHistory.indexOf(status);
	var hits = statusHistory.filter((it, i) => i <= index).map(it => it.latestHit);
	var hitsByPilot = hits.reduce(updateCompletedHitsSummary, <Record<string, Record<string, number>>> {});

	var bosses = Array.from(new Set(hits.filter(it => it).map(it => it.bossName))).sort();

	var container = <HTMLTableElement> document.querySelector('#completed-hits-summary table');
	container.setAttribute('data-sortable-initialized', 'false');

	var pilots = Array.from(new Set(hits.filter(it => it).map(it => it.playerName))).sort();

	var head = <HTMLTableSectionElement> container.tHead;
	head.innerHTML = '';

	var row = document.createElement('tr');
	row.appendChild(createCell(true, 'Player Name'));

	for (var i = 0; i < bosses.length; i++) {
		row.appendChild(createCell(true, bosses[i]));
	}

	row.appendChild(createCell(true, 'Total'));

	head.appendChild(row);

	var body = <HTMLTableSectionElement> container.tBodies[0];
	body.innerHTML = '';

	for (var i = 0; i < pilots.length; i++) {
		row = document.createElement('tr');

		row.appendChild(createCell(false, pilots[i]));

		var hitCounts = hitsByPilot[pilots[i]] || {};
		var totalHitCount = 0;

		for (var j = 0; j < bosses.length; j++) {
			var hitCount = hitCounts[bosses[j]] || 0;
			totalHitCount += hitCount;

			var cell = createCell(false, hitCount == 0 ? '' : '' + hitCount);
			cell.setAttribute('data-value', '' + hitCount);
			row.appendChild(cell);
		}

		cell = createCell(false, '' + totalHitCount);
		cell.setAttribute('data-value', '' + totalHitCount);
		row.appendChild(cell);

		body.appendChild(row);
	}

    Sortable.initTable(container);
}

function renderClanBattleStatusHelper() : void {
	var selectedIndex = selectElement.selectedIndex;
	var status = selectedIndex == -1 ? getInitialClanBattleStatus(cbId) : statusHistory[selectedIndex];

	var hitRecordLink = <HTMLAnchorElement> document.getElementById('hit-record-data-link');

	if (hitRecordLink) {
		hitRecordLink.href = 'https://docs.google.com/spreadsheets/d/' + hitRecordSheetId + '/edit#gid=' + hitRecordGids['DPS Log'] + '&range=C' + (selectedIndex - parseInt(status.day) + 2);
		hitRecordLink.textContent = hitRecordLink.href;
	}

	renderLapProgress(status);
	renderRemainingHitsByBoss(status);
	renderRemainingHitsByPlayer(status);
	renderCompletedHitsDetail(status);
	renderCompletedHitsSummary(status);
}

var searchField = <HTMLInputElement> document.getElementById('player-search-completed');

function filterCompletedHitsHelper() {
	var searchText = searchField.value;

	var hitRows = <HTMLTableRowElement[]> Array.from(document.querySelectorAll('#completed-hits-detailTabContent table tbody tr'));

	for (var i = 0; i < hitRows.length; i++) {
		var hasText = Array.from(hitRows[i].querySelectorAll('td.player-name')).filter(it => (it.textContent || '').indexOf(searchText) != -1).length > 0;
		hitRows[i].style.display = hasText ? 'table-row' : 'none';
	}
}

var filterCompletedHits = _.debounce(filterCompletedHitsHelper, 300);

searchField.addEventListener('keydown', filterCompletedHits);
searchField.addEventListener('keypress', filterCompletedHits);

var renderClanBattleStatus = _.debounce(renderClanBattleStatusHelper, 300);