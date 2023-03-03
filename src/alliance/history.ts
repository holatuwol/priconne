var responseCache = <Record<string, ClanRanking[]>> {};

function loadCBStats(
	anchor: HTMLAnchorElement,
	callback: Function,
	responseText: string,
	href: string,
	container: HTMLElement
) : boolean {

	document.body.style.opacity = '';

	var tabs = Array.from(container.querySelectorAll('#sheet-menu > li'));

	for (var i = 0; i < tabs.length; i++) {
		var tabId = (tabs[i].getAttribute('id') || '').substring('sheet-button-'.length)
		var cbId = (tabs[i].textContent || '').substring(2);

		var rows = convertToCSV(container, tabId);
		var header = rows[0];

		var results = rows.slice(1).filter(it => it[0]).map(row => {
			var result = <ClanRanking> {};

			for (var i = 0; i < header.length; i++) {
				if (header[i] == 'score') {
					result[header[i]] = parseInt(row[i] || '0');
				}
				else {
					result[header[i]] = row[i];
				}
			}

			return result;
		}).sort((a, b) => b.score - a.score);

		responseCache[cbId] = results;
	}

	var cbId = anchor.getAttribute('data-cb-id') || '0';

	if (cbId in responseCache) {
		callback(anchor, responseCache[cbId]);
	}

	return true;
};

function loadClanStats(
	anchor: HTMLAnchorElement,
	callback: Function
) : void {

	callback = callback || createSingleCBTable;

	var cbId = anchor.getAttribute('data-cb-id') || '0';

	var results = responseCache[cbId];

	if (results) {
		callback(anchor, results);
		return;
	}

	var gid = anchor.getAttribute('data-gid') || '0';

	var parentElement = <HTMLElement> anchor.parentElement;

	document.body.style.opacity = '0.5';

	expandGoogleSheetURLs(parentElement.getAttribute('data-sheet') || '', null, loadCBStats.bind(null, anchor, callback));
};

function createMultiCBTable() : void {
	var clans = <Record<string, ClanRanking>> {};

	var cbIds = Object.keys(responseCache).sort((a, b) => parseInt(b) - parseInt(a));

	for (var i = 0; i < cbIds.length; i++) {
		var cbId = cbIds[i];

		responseCache[cbId].reduce(function(acc, next) {
			acc[next.name] = acc[next.name] || <ClanRanking> {};

			acc[next.name].name = next.name;
			acc[next.name].unitName = acc[next.name].unitName || next.unitName;
			acc[next.name].unitStars = acc[next.name].unitStars || next.unitStars;

			acc[next.name][cbId] = next.rank || '---';
			return acc;
		}, clans)
	}

	var tbody = <HTMLTableSectionElement> document.querySelector('table tbody');

	var clanNames = Object.values(clans).sort((a, b) => {
		var aScore = (a[cbIds[0]] || {}).score;
		var bScore = (b[cbIds[0]] || {}).score;

		return parseInt(aScore || '0') - parseInt(bScore || '0');
	}).map(it => it.name);

	for (var i = 0; i < clanNames.length; i++) {
		var clan = clans[clanNames[i]];

		var row = document.createElement('tr');
		row.onclick = toggleFeaturedRow.bind(null, row);

		var unitId = unitIds[clan.unitName] || clan.unitName;
		var unitStars = clan.unitStars;

		if (unitId) {
			var iconElement = document.createElement('img');
			iconElement.classList.add('card');
			iconElement.setAttribute('src', getUnitIcon(unitId, unitStars));

			var iconCell = document.createElement('td');
			iconCell.appendChild(iconElement);
			row.appendChild(iconCell);
		}
		else {
			row.appendChild(document.createElement('td'));
		}

		var nameCell = document.createElement('td');
		nameCell.classList.add('clan-name');
		nameCell.textContent = clanNames[i];
		row.appendChild(nameCell);

		if (!clan[cbIds[0]]) {
			row.style.opacity = '0.2';
		}

		for (var j = 0; j < cbIds.length; j++) {
			var cell = document.createElement('td');
			cell.textContent = clan[cbIds[j]] || '---';
			cell.setAttribute('data-value', clan[cbIds[j]] || Number.MAX_SAFE_INTEGER);
			row.appendChild(cell);
		}

		tbody.appendChild(row);
	}
};

function loadTrendOverTime() : void {
	cbIndexElement.textContent = 'Ranking Trends';
	timestampElement.textContent = '';

	table.setAttribute('data-sortable', 'true');
	table.setAttribute('data-sortable-initialized', 'false');

	thead.innerHTML = '';

	var row = document.createElement('tr');

	var cell = document.createElement('th');
	cell.setAttribute('scope', 'col');
	cell.textContent = 'Icon';
	cell.setAttribute('data-sortable', 'false');
	row.appendChild(cell);

	var anchors = <HTMLAnchorElement[]> Array.from(cbSelectorElement.querySelectorAll('a'));

	cell = document.createElement('th');
	cell.setAttribute('scope', 'col');
	cell.classList.add('clan-name')
	cell.textContent = 'Clan';
	row.appendChild(cell);

	for (var i = 0; i < anchors.length; i++) {
		cell = document.createElement('th');
		cell.setAttribute('scope', 'col');
		cell.textContent = 'CB' + anchors[i].getAttribute('data-cb-id');
		cell.setAttribute('data-sortable-type', 'numeric');
		row.appendChild(cell);
	}

	thead.appendChild(row);

	tbody.innerHTML = '';
	table.classList.remove('featured');

	var count = 0;

	for (var i = 0; i < anchors.length; i++) {
		loadClanStats(anchors[i], function() {
			if (++count == anchors.length) {
				createMultiCBTable();

				Sortable.initTable(table);
			}
		})
	}
}