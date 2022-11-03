var roster = <Record<string, BoxUnit[]>> {};

function getNumericRank(
	isNegation: boolean,
	unit: BoxUnit
) : number {

	var value = parseInt(unit['rank.full'].replace(/-/g, ''));

	return isNegation ? -value : value;
}

function getNumericStat(
	stat: string,
	isNegation: boolean,
	unit: BoxUnit
) : number {

	var value = <number> unit[stat];

	return isNegation ? -value : value;
}

function getValueCell(
	key: string,
	value: string | number | null,
	extraClass?: string
) : HTMLSpanElement {

	var equip = document.createElement('span');

	if (extraClass) {
		equip.classList.add(extraClass);
	}

	equip.setAttribute('data-key', key);

	equip.textContent = '' + value;

	if ((value == -1) || (value == null)) {
		equip.textContent = 'x';
		equip.classList.add('not-equipped');
	}

	return equip;
}

function renderUnitPartial(unit: BoxUnit) : HTMLSpanElement {
	var unitId = unit.unitId ? ('' + unit.unitId) : unitIds[unit.name];

	var container = document.createElement('span');
	container.setAttribute('title', unit.name);
	container.classList.add('unit-image');
	container.setAttribute('data-name', unit.name.toLowerCase() + ' ' + altNames[unitId].toLowerCase().replace(/\./g, ''));

	var unitStars = (unit.rarity == 6) ? 6 : (unit.rarity) >= 3 ? 3 : 1;

	if (!unit.level) {
		var iconElement = document.createElement('img');
		iconElement.setAttribute('src', getUnitIcon(unitId, unitStars));

		container.appendChild(iconElement);

		container.classList.add('unit-unavailable');

		return container;
	}

	container.style.backgroundImage = 'url("' + getUnitIcon(unitId, unitStars) + '")';

	var header = document.createElement('div');
	header.classList.add('unit-image-header');
	container.appendChild(header);

	var footer = document.createElement('div');
	footer.classList.add('unit-image-footer');
	container.appendChild(footer);

	var levelContainer = document.createElement('span');
	levelContainer.classList.add('unit-level');
	levelContainer.textContent = '' + unit['level'];

	header.appendChild(levelContainer);

	var ueContainer = document.createElement('span');
	ueContainer.classList.add('unit-ue');
	ueContainer.textContent = unit['uniqueEqLv'] > 0 ? '' + unit['uniqueEqLv'] : '';

	header.appendChild(ueContainer);

	var starContainer = document.createElement('span');
	starContainer.classList.add('unit-stars');
	starContainer.textContent = unit['stars'] + '\u2605';

	footer.appendChild(starContainer);

	var rankContainer = document.createElement('span');
	rankContainer.classList.add('unit-rank');
	rankContainer.textContent = unit['rank.full'];

	footer.appendChild(rankContainer);

	return container;
}

function renderUnitFull(unit: BoxUnit) : HTMLSpanElement {
	var unitId = unit.unitId ? ('' + unit.unitId) : unitIds[unit.name];

	var container = document.createElement('span');
	container.classList.add('unit-description')
	container.setAttribute('title', unit.name);
	container.setAttribute('data-name', unit.name.toLowerCase() + ' ' + altNames[unitId].toLowerCase().replace(/\./g, ''));

	var unitStars = (unit.rarity == 6) ? 6 : (unit.rarity) >= 3 ? 3 : 1;

	var iconElement = document.createElement('img');
	iconElement.setAttribute('src', getUnitIcon(unitId, unitStars));

	container.appendChild(iconElement);

	if (!unit.level) {
		container.classList.add('unit-unavailable');

		return container;
	}

	var level = document.createElement('span');
	level.classList.add('unit-levels');

	level.appendChild(getValueCell('level', unit.level, 'level'));
	level.appendChild(getValueCell('stars', unit.stars + '\u2605', 'stars'));

	container.appendChild(level);

	var equips = document.createElement('span');
	equips.classList.add('equipped-items');

	equips.appendChild(getValueCell('rank', unit.rank, 'rank'));
	equips.appendChild(getValueCell('equipLevel.TL', unit['equipLevel.TL'], 'equip-top-left'));
	equips.appendChild(getValueCell('equipLevel.TR', unit['equipLevel.TR'], 'equip-top-right'));
	equips.appendChild(getValueCell('equipLevel.ML', unit['equipLevel.ML'], 'equip-middle-left'));
	equips.appendChild(getValueCell('equipLevel.MR', unit['equipLevel.MR'], 'equip-middle-right'));
	equips.appendChild(getValueCell('equipLevel.BL', unit['equipLevel.BL'], 'equip-bottom-left'));
	equips.appendChild(getValueCell('equipLevel.BR', unit['equipLevel.BR'], 'equip-bottom-right'));

	container.appendChild(equips);

	var skills = document.createElement('span');
	skills.classList.add('skill-levels');

	skills.appendChild(getValueCell('uniqueEqLv', (unit['uniqueEqLv'] == 0) ? -1 : ('UE ' + unit['uniqueEqLv']), 'unique-equipment'));
	skills.appendChild(getValueCell('skillLevel.UB', unit['skillLevel.UB'], 'union-burst'));
	skills.appendChild(getValueCell('skillLevel.EX', unit['skillLevel.EX'], 'ex-skill'));
	skills.appendChild(getValueCell('skillLevel.1', unit['skillLevel.1'], 'skill-1'));
	skills.appendChild(getValueCell('skillLevel.2', unit['skillLevel.2'], 'skill-2'));

	container.appendChild(skills);

	return container;
}

function renderUnits(
	target: HTMLElement
) : void {
	var tab = <HTMLElement> target.closest('.tab-pane');

	var container = <HTMLDivElement> tab.querySelector('div[data-url]');

	container.innerHTML = '';

	var url = container.getAttribute('data-url') || '';

	var mapper = tab.classList.contains('box-tab') ? renderUnitPartial : renderUnitFull;

	var units = roster[url];

	var attribute = target.getAttribute('data-sort-attribute') || container.getAttribute('data-sort-attribute') || '';
	var direction = target.getAttribute('data-sort-direction') || container.getAttribute('data-sort-direction') || '';

	if (target.getAttribute('data-sort-attribute') && (target.getAttribute('data-sort-attribute') == container.getAttribute('data-sort-attribute'))) {
		direction = direction == 'asc' ? 'desc' : 'asc';
	}
	else {
		container.setAttribute('data-sort-attribute', attribute);
	}

	container.setAttribute('data-sort-direction', direction);

	if (attribute == 'name') {
		units = _.sortBy(units, 'name');

		if (direction == 'desc') {
			units.reverse();
		}
	}
	else if (attribute == 'range') {
		var sorter = getNumericStat.bind(null, attribute, direction == 'desc');

		units = _.sortBy(units, sorter);
	}
	else {
		var sorter = attribute == 'rank' ? getNumericRank.bind(null, direction == 'desc') :
			attribute == 'ue' ? getNumericStat.bind(null, 'uniqueEqLv', direction == 'desc') :
			getNumericStat.bind(null, attribute, direction == 'desc');

		units = _.sortBy(units.filter(it => it.level), sorter).concat(_.sortBy(units.filter(it => !it.level), 'name'));
	}

	roster[url] = units;

	units.map(mapper).filter(it => it).forEach((it: HTMLSpanElement) => container.appendChild(it));

	tab.querySelectorAll('.sort-attribute a').forEach(it => {
		if (it.getAttribute('data-sort-attribute') == attribute) {
			it.removeAttribute('href');
		}
		else {
			it.setAttribute('href', '#');
		}
	})

	tab.querySelectorAll('.sort-direction a').forEach(it => {
		if (it.getAttribute('data-sort-direction') == direction) {
			it.removeAttribute('href');
		}
		else {
			it.setAttribute('href', '#');
		}
	})
}

function setSummaryValue(
	container: HTMLElement,
	resources: Record<string, string | number>,
	key: string
) : void {

	(<HTMLElement> container.querySelector('.unit-' + key)).textContent = resources[key].toLocaleString();
}

function loadRoster(
	boxContainer: HTMLDivElement,
	listContainer: HTMLUListElement,
	jsonLink: HTMLAnchorElement | null,
	rosterRequestURL: string,
	resourceRequestURL: string | null
) : void {

	var rosterRequest = new XMLHttpRequest();

	rosterRequest.onreadystatechange = function() {
		if (this.readyState != 4 || this.status != 200) {
			return;
		}

		if (!this.responseText) {
			return;
		}

		var units = <BoxUnit[]> parseUnquotedCSV(this.responseText);

		units.forEach(it => {
			it['range'] = positions[unitIds[it['name']]];
		});

		roster[rosterRequestURL] = <BoxUnit[]> units;

		if (jsonLink) {
			var saveData = prepareSaveData(units);

			var blob = new Blob([JSON.stringify(saveData)], {type: "application/json"});
			var saveDataJSONBlobURL = URL.createObjectURL(blob);

			jsonLink.href = saveDataJSONBlobURL;
			jsonLink.textContent = 'SaveData.json';
		}

		renderUnits(<HTMLElement> (<HTMLElement> boxContainer.closest('.tab-pane')).querySelector('.sort-attribute a'));
		renderUnits(<HTMLElement> (<HTMLElement> listContainer.closest('.tab-pane')).querySelector('.sort-attribute a'));

		var boxFilter = <HTMLInputElement> (<HTMLElement> boxContainer.closest('.tab-pane')).querySelector('.unit-filter');
		var listFilter = <HTMLInputElement> (<HTMLElement> listContainer.closest('.tab-pane')).querySelector('.unit-filter');

		boxFilter.onkeyup = filterUnits.bind(null, boxContainer, boxFilter);
		listFilter.onkeyup = filterUnits.bind(null, listContainer, listFilter);
	};

	if (rosterRequestURL.indexOf('?') == -1) {
		rosterRequestURL += '?output=csv';
	}

	rosterRequestURL += '&t=' + Date.now();

	boxContainer.setAttribute('data-url', rosterRequestURL);
	listContainer.setAttribute('data-url', rosterRequestURL);

	rosterRequest.open('GET', rosterRequestURL, true);
	rosterRequest.send();

	if (!resourceRequestURL) {
		return;
	}

	var resourceRequest = new XMLHttpRequest();

	resourceRequest.onreadystatechange = function() {
		if (this.readyState != 4 || this.status != 200) {
			return;
		}

		if (!this.responseText) {
			return;
		}

		var resources = parseUnquotedCSV(this.responseText);

		var latestResources = resources[resources.length - 1];

		var boxElement = <HTMLElement> document.querySelector('.unit-box[data-url="' + rosterRequestURL + '"]');
		var container = <HTMLElement> boxElement.closest('.tab-pane');

		setSummaryValue(container, latestResources, 'jewels');
		setSummaryValue(container, latestResources, 'amulets');
		setSummaryValue(container, latestResources, 'mana');
		setSummaryValue(container, latestResources, 'hearts');
		setSummaryValue(container, latestResources, 'orbs');
		setSummaryValue(container, latestResources, 'exp-pots');
		setSummaryValue(container, latestResources, 'cakes');
		setSummaryValue(container, latestResources, 'skips');
	}

	if (resourceRequestURL.indexOf('?') == -1) {
		resourceRequestURL += '?output=csv';
	}

	resourceRequestURL += '&t=' + Date.now();

	resourceRequest.open('GET', resourceRequestURL, true);
	resourceRequest.send();

}