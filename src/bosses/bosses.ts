function getLapTier(
	cbId: string,
	lap: number
) : string {

	var tiers = bossStats[cbId].lapTiers;

	return (lap < tiers.length) ? tiers[lap - 1] : tiers[tiers.length - 1];
}

function getBossMaxHP(
	cbId: string,
	lap: number,
	index: number
) : number {

	var tier = getLapTier(cbId, lap);

	return bossStats[cbId].bossHP[tier][index];
}

function getBossName(
	cbId: string,
	lap: number,
	index: number
) : string {

	return getLapTier(cbId, lap) + (index + 1);
}

function renderBossData(
	row: HTMLTableRowElement,
	cbId: string,
	lap: number,
	index: number,
	remainingHP: number,
) : void {

	var bossIds = bossStats[cbId].bossIds;

	var bossElement = document.createElement('img');
	bossElement.setAttribute('src', getUnitIcon('' + bossIds[index]));
	bossElement.setAttribute('width', '50');
	bossElement.setAttribute('title', 'Boss ' + (index + 1));

	var bossCell = document.createElement('td');
	bossCell.appendChild(bossElement);
	row.appendChild(bossCell);

	var progressWordsElement = document.createElement('span');
	progressWordsElement.textContent = 'Lap ' + lap + ' Boss ' + (index + 1);

	var hpElement = document.createElement('span');
	hpElement.textContent = formatBossHP(remainingHP);

	var bossMaxHP = getBossMaxHP(cbId, lap, index);
	var bossPercentage = ((remainingHP / bossMaxHP) * 100.0).toFixed(1);

	var progressBarElement = document.createElement('div');
	progressBarElement.classList.add('progress-bar', 'bg-danger');
	progressBarElement.setAttribute('role', 'progressbar');
	progressBarElement.setAttribute('aria-valuemin', '0');
	progressBarElement.setAttribute('aria-valuemax', '' + bossMaxHP);
	progressBarElement.setAttribute('aria-valuenow', '' + remainingHP);
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
}

function formatBossHP(hp: number) : string {
	return (hp >= 1000000.0) ? ((hp / 1000000.0).toFixed(2) + 'M') :
		(hp >= 100000.0) ? ((hp / 1000.0).toFixed(0) + 'K') :
		(hp >= 10000.0) ? ((hp / 1000.0).toFixed(1) + 'K') :
		(hp >= 1000.0) ? ((hp / 1000.0).toFixed(2) + 'K') : '' + hp;
}