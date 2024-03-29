function toggleFeaturedRow(row: HTMLTableRowElement) : void {
	if (table.classList.contains('featured')) {
		table.classList.remove('featured');
		row.classList.remove('featured');

		if (table.getAttribute('data-sortable-initialized') != null) {
			table.setAttribute('data-sortable', 'true');
		}
	}
	else {
		table.classList.add('featured');
		row.classList.add('featured');

		if (table.getAttribute('data-sortable-initialized') != null) {
			table.removeAttribute('data-sortable');
		}
	}
}

function createRow(
	cbId: string,
	clan: ClanRanking
) {

	var row = document.createElement('tr');
	row.onclick = toggleFeaturedRow.bind(null, row);

	var rankCell = document.createElement('th');
	rankCell.setAttribute('scope', 'row');

	rankCell.textContent = '' + clan.rank;

	row.appendChild(rankCell);

	var unitId = unitIds[clan.unitName] || clan.unitName;

	var iconCell = document.createElement('td');

	if (unitId) {
		var iconElement = document.createElement('img');
		iconElement.classList.add('card');
		iconElement.setAttribute('src', getUnitIcon(unitId, clan.unitStars));

		iconCell.appendChild(iconElement);
	}

	row.appendChild(iconCell);

	var nameCell = document.createElement('td');
	nameCell.textContent = clan.name;
	row.appendChild(nameCell);

	if (clan.score) {
		var scoreCell = document.createElement('td');
		scoreCell.textContent = new Intl.NumberFormat('en-US').format(clan.score);
		row.appendChild(scoreCell);

		var boss = getLapBoss(clan.score);

		renderBossData(row, cbId, boss.lap, boss.index, boss.hp);

		return row;
	}
	else {
		row.appendChild(document.createElement('td'));
		row.appendChild(document.createElement('td'));
		row.appendChild(document.createElement('td'));

		return row;
	}
};

function createSingleCBTable(
	anchor: HTMLAnchorElement,
	results: ClanRanking[]
) : void {

	var cbId = anchor.getAttribute('data-cb-id') || '0';
	results.map(createRow.bind(null, cbId)).forEach((it: HTMLTableRowElement) => tbody.appendChild(it));
};

function loadSingleResult(anchor: HTMLAnchorElement | null) : void {
	if (!anchor) {
		return;
	}

	var cbId = anchor.getAttribute('data-cb-id') || '0';

	cbIndexElement.textContent = cbId + ' Leaderboard';
	cbIndexElement.setAttribute('data-cb-id', cbId);

    var timestampText = '';

    if (anchor.getAttribute('data-timestamp')) {
      timestampText = (anchor.getAttribute('data-source') + ' snapshot taken ' + new Date(parseInt(anchor.getAttribute('data-timestamp') || '0') * 1000));
    }

	timestampElement.textContent = timestampText;

	table.removeAttribute('data-sortable');
	table.removeAttribute('data-sortable-initialized')

	thead.innerHTML = '';

	var row = document.createElement('tr');

	var cell = document.createElement('th');
	cell.setAttribute('scope', 'col');
	cell.classList.add('clan-rank');
	cell.textContent = 'Rank';
	row.appendChild(cell);

	cell = document.createElement('th');
	cell.setAttribute('scope', 'col');
	cell.classList.add('clan-icon');
	cell.textContent = 'Icon';
	row.appendChild(cell);

	cell = document.createElement('th');
	cell.setAttribute('scope', 'col');
	cell.classList.add('clan-name');
	cell.textContent = 'Clan';
	row.appendChild(cell);

	cell = document.createElement('th');
	cell.setAttribute('scope', 'col');
	cell.classList.add('clan-score');
	cell.textContent = 'Score';
	row.appendChild(cell);

	cell = document.createElement('th');
	cell.setAttribute('scope', 'col');
	cell.classList.add('clan-boss-icon');
	cell.textContent = 'Position';
	row.appendChild(cell);

	cell = document.createElement('th');
	cell.setAttribute('scope', 'col');
	cell.classList.add('clan-progress');
	cell.style.textAlign = 'right';
	row.appendChild(cell);

	thead.appendChild(row);

	tbody.innerHTML = '';
	table.classList.remove('featured')

	loadClanStats(anchor, createSingleCBTable);
};

function updateAnchorTags() : void {
	if (!document.location.search) {
		return;
	}

	var params = document.location.search.substring(1).split('&').forEach(it => {
		var param = it.split('=');
		var key = param[0];
		var value = param[1];

		if (key == '0') {
			cbSelectorElement.setAttribute('data-sheet', value);
		}
		else {
			var anchorElement = cbSelectorElement.querySelector('a[data-cb-id="' + key + '"]');

			if (anchorElement) {
				anchorElement.setAttribute('data-gid', value);
			}
		}
	});
};