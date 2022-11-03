function createRow(
	bossIds: string[],
	laps: number[][],
	bossHP: number[],
	clan: ClanRanking
) {

	var row = document.createElement('tr');

	var rankCell = document.createElement('th');
	rankCell.setAttribute('scope', 'row');
	rankCell.textContent = '' + clan.rank;

	row.appendChild(rankCell);

	var unitId = unitIds[clan.unitName] || clan.unitName;

	if (unitId) {
		var iconElement = document.createElement('img');
		iconElement.classList.add('card');
		iconElement.setAttribute('src', getUnitIcon(unitId, clan.unitStars));

		var iconCell = document.createElement('td');
		iconCell.appendChild(iconElement);
		row.appendChild(iconCell);
	}
	else {
		row.appendChild(document.createElement('td'));
	}

	var nameCell = document.createElement('td');
	nameCell.textContent = clan.name;
	row.appendChild(nameCell);

	if (!clan.score) {
		row.appendChild(document.createElement('td'));
		row.appendChild(document.createElement('td'));
		row.appendChild(document.createElement('td'));

		return row;
	}

	var scoreCell = document.createElement('td');
	scoreCell.textContent = new Intl.NumberFormat('en-US').format(clan.score);
	row.appendChild(scoreCell);

	var boss = getLapBoss(laps, bossHP, clan.score);

	var bossElement = document.createElement('img');
	bossElement.setAttribute('src', getUnitIcon(bossIds[boss.index - 1]));
	bossElement.setAttribute('width', '50');
	bossElement.setAttribute('title', 'Boss ' + boss.index);

	var bossCell = document.createElement('td');
	bossCell.appendChild(bossElement);
	row.appendChild(bossCell);

	var progressWordsElement = document.createElement('span');
	progressWordsElement.textContent = 'Lap ' + boss.lap + ' Boss ' + boss.index;

	var hpElement = document.createElement('span');
	hpElement.textContent = formatBossHP(boss.hp);

	var bossPercentage = ((boss.hp / bossHP[boss.index - 1]) * 100.0).toFixed(1);

	var progressBarElement = document.createElement('div');
	progressBarElement.classList.add('progress-bar', 'bg-danger');
	progressBarElement.setAttribute('role', 'progressbar');
	progressBarElement.setAttribute('aria-valuemin', '0');
	progressBarElement.setAttribute('aria-valuemax', '' + bossHP[boss.index - 1]);
	progressBarElement.setAttribute('aria-valuenow', '' + boss.hp);
	progressBarElement.style.width = bossPercentage + '%';
	progressBarElement.appendChild(hpElement);

	var progressContainerElement = document.createElement('div');
	progressContainerElement.classList.add('progress', 'mt-1');
	progressContainerElement.appendChild(progressBarElement);

	var progressCell = document.createElement('td');
	progressCell.appendChild(progressWordsElement);
	progressCell.appendChild(document.createElement('br'));
	progressCell.appendChild(progressContainerElement);
	row.appendChild(progressCell);

	return row;
};

function createSingleCBTable(
	anchor: HTMLAnchorElement,
	results: ClanRanking[]
) : void {

	var bossIds = splitStringAttribute(anchor, 'data-boss-ids');
	var dataTiers = splitIntAttribute(anchor, 'data-tiers');

	var laps = [];

	for (var i = 0; i < dataTiers.length; i++) {
		var multipliers = splitFloatAttribute(anchor, 'data-multipliers-' + (i+1));
		var bossHP = splitIntAttribute(anchor, 'data-boss-hp-' + (i+1));

		if (bossHP.length == 0) {
			bossHP = splitIntAttribute(anchor, 'data-boss-hp');
		}

		var tierScores = bossHP.map((it, i) => it * multipliers[i]);

		for (var j = 0; j < dataTiers[i]; j++) {
			laps.push(tierScores);
		}
	}

	var multipliers = splitFloatAttribute(anchor, 'data-multipliers-' + (dataTiers.length + 1));
	var bossHP = splitIntAttribute(anchor, 'data-boss-hp-' + (dataTiers.length + 1));

	if (bossHP.length == 0) {
		bossHP = splitIntAttribute(anchor, 'data-boss-hp');
	}

	var tierScores = bossHP.map((it, i) => it * multipliers[i]);

	laps.push(tierScores);

	results.map(createRow.bind(null, bossIds, laps, bossHP)).forEach((it: HTMLTableRowElement) => tbody.appendChild(it));
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

	thead.innerHTML = '';

	var row = document.createElement('tr');

	var cell = document.createElement('th');
	cell.setAttribute('scope', 'col');
	cell.classList.add('col-1');
	cell.textContent = 'Rank';
	row.appendChild(cell);

	cell = document.createElement('th');
	cell.setAttribute('scope', 'col');
	cell.classList.add('col-1');
	cell.textContent = 'Icon';
	row.appendChild(cell);

	cell = document.createElement('th');
	cell.setAttribute('scope', 'col');
	cell.classList.add('col-2');
	cell.textContent = 'Clan';
	row.appendChild(cell);

	cell = document.createElement('th');
	cell.setAttribute('scope', 'col');
	cell.classList.add('col-2');
	cell.textContent = 'Score';
	row.appendChild(cell);

	cell = document.createElement('th');
	cell.setAttribute('scope', 'col');
	cell.classList.add('col-1');
	cell.textContent = 'Position';
	row.appendChild(cell);

	cell = document.createElement('th');
	cell.setAttribute('scope', 'col');
	cell.classList.add('col-5');
	cell.style.textAlign = 'right';
	row.appendChild(cell);

	thead.appendChild(row);

	tbody.innerHTML = '';

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