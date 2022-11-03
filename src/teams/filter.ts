function getRowTerms(
	elements: HTMLElement[],
	attributeName: string
) : string[] {

	return elements.map((it: HTMLElement) => it.getAttribute(attributeName)).filter(it => it).map((it: string) => it.toLowerCase().replace(/\./g, ''))
}

function isMatchesSearchTerms(
	row: HTMLTableRowElement,
	searchTerms: string[]
) : boolean {

	var rowDamage = getDamage(row.getAttribute('data-damage'));

	var images = Array.from(row.querySelectorAll('img'));

	var rowTerms = getRowTerms(images, 'data-unit-name').concat(getRowTerms(images, 'data-unit-alt-name')).concat(getRowTerms([row], 'data-timeline'));

	for (var i = 0; i < searchTerms.length; i++) {
		var hasMatch = false;

		if (searchTerms[i].charAt(0) == '>') {
			hasMatch = getDamage(searchTerms[i].substring(1)) <= rowDamage;
		}
		else if (searchTerms[i].charAt(0) == '-') {
			var searchTerm = searchTerms[i].substring(1);

			for (var j = 0, hasMatch = true; j < rowTerms.length && hasMatch; j++) {
				hasMatch = rowTerms[j].indexOf(searchTerm) == -1;
			}
		}
		else {
			var searchTerm = (searchTerms[i].charAt(0) == '+') ? searchTerms[i].substring(1) : searchTerms[i];

			for (var j = 0, hasMatch = false; j < rowTerms.length && !hasMatch; j++) {
				hasMatch = rowTerms[j].indexOf(searchTerm) != -1;
			}
		}

		if (!hasMatch) {
			return false;
		}
	}

	return true;
};

function extractAltBosses(
	acc: Record<string, string[]>,
	next: HTMLElement
) : Record<string, string[]> {

	var key = next.getAttribute('data-members');
	var boss = next.getAttribute('data-boss');

	if (!key || !boss) {
		return acc;
	}

	acc[key] = acc[key] || [boss];

	if (acc[key].indexOf(boss) == -1) {
		acc[key].push(boss);
		acc[key].sort();
	}

	return acc;
}

function extractAltUses(
	acc: Record<string, number>,
	next: HTMLElement
) : Record<string, number> {

	var key = next.getAttribute('data-members');

	if (!key) {
		return acc;
	}

	acc[key] = (acc[key] || 0) + 1;
	return acc;
}

function isPlausibleTeam(
	availableBosses: Set<String>,
	availableRegions: Set<String>,
	availableTimings: Set<String>,
	row: HTMLTableRowElement
) : boolean {
	var boss = row.getAttribute('data-boss');

	if (boss == null || !availableBosses.has(boss)) {
		return false;
	}

	var region = row.getAttribute('data-region');

	if (region == null || !availableRegions.has(region)) {
		return false;
	}

	var timing = row.getAttribute('data-timing');

	if (timing == null || !availableTimings.has(timing)) {
		return false;
	}

	return true;
}

function filterAvailableTeam(
	availableBosses: Set<String>,
	availableRegions: Set<String>,
	availableTimings: Set<String>,
	searchTerms: string[],
	row: HTMLTableRowElement
) : void {

	if (isPlausibleTeam(availableBosses, availableRegions, availableTimings, row) && isMatchesSearchTerms(row, searchTerms)) {
		row.classList.remove('filtered-out');
	}
	else {
		row.classList.add('filtered-out');
	}
};

function filterAvailableTeamsHelper() {
	var availableBosses = getCheckboxValues('#bosses-available input[type="checkbox"]:checked');
	var availableRegions = getCheckboxValues('#regions-available input[type="checkbox"]:checked');
	var availableTimings = getCheckboxValues('#timings-available input[type="checkbox"]:checked');

	var filter = <HTMLInputElement> document.getElementById('team-filter');

	var searchText = filter.value.trim().toLowerCase().replace(/\./g, '');

	var searchTerms = searchText ? searchText.split(/\s+/g) : [];

	document.querySelectorAll('tr.special-visible').forEach((it) => it.classList.remove('special-visible'));

	Array.from(availableBody.rows).forEach(filterAvailableTeam.bind(null, availableBosses, availableRegions, new Set(availableTimings), searchTerms));

	var plausibleFilter = isPlausibleTeam.bind(null, availableBosses, availableRegions, availableTimings);

	for (var i = 0; i < searchTerms.length; i++) {
		Array.from(availableBody.querySelectorAll('tr.filtered-out[data-members="' + searchTerms[i].replace(/"/g, '') + '"]')).filter(plausibleFilter).forEach((it) => it.classList.add('special-visible'));
	}

	var visibleTeams = availableBody.querySelectorAll('tr:not(.filtered-out):not(.unavailable)');

	var countElement = <HTMLElement | null> document.querySelector('#visible-teams-count');

	if (countElement) {
		countElement.textContent = '' + visibleTeams.length;
	}

	var pluralElement = <HTMLElement | null> document.querySelector('#visible-teams-plural');

	if (pluralElement) {
		pluralElement.style.display = (visibleTeams.length == 1) ? 'none' : 'inline';
	}

	var plausibleRows = Array.from(document.querySelectorAll('tbody tr[data-members]')).filter(plausibleFilter);

	var altBosses = plausibleRows.reduce(extractAltBosses, <Record<string, string[]>> {});

	var altUses = plausibleRows.reduce(extractAltUses, <Record<string, number>> {});

	plausibleRows.forEach(function(it1) {
		var key = it1.getAttribute('data-members');
		var boss = it1.getAttribute('data-boss');

		if (!key || !boss) {
			return;
		}

		var altBossLink = it1.querySelector('.alt-bosses a');

		if (!altBossLink) {
			return;
		}

		if (altBosses[key].length > 1) {
			altBossLink.textContent = altBosses[key].map(it2 => it2 == boss ? ('[' + it2 + ']') : it2).join(', ');
		}
		else if (altUses[key] > 1) {
			altBossLink.textContent = '[' + boss + ']'
		}
		else {
			altBossLink.textContent = '';
		}
	});
}

var filterAvailableTeams = _.debounce(filterAvailableTeamsHelper, 300);

function getMembers(row : HTMLTableRowElement) : Record<string, number> {
	var members = <Record<string, number>> {};

	Array.from(row.querySelectorAll('img')).map((img) => img.title).forEach((title) => members[title] = (members[title] || 0) + 1);

	return members;
};

function isViableChoice(
	borrowStrategy: string,
	usedUnits: Set<string>,
	remainingTeams: Record<string, number>[]
) : boolean {

	var borrow = new Set();
	var checkTeam = remainingTeams[0];

	for (var key in checkTeam) {
		if (!availableUnits.has(key)) {
			if (borrowStrategy != 'all') {
				return false;
			}

			borrow.add(key);
		}
		else if (usedUnits.has(key)) {
			borrow.add(key);
		}
	}

	if ((borrowStrategy == 'none') && borrow.size) {
		return false;
	}

	if (borrow.size > 1) {
		return false;
	}

	if (remainingTeams.length == 1) {
		return true;
	}

	var newRemainingTeams = remainingTeams.slice(1);

	var newUsedUnits = new Set(Array.from(usedUnits));

	for (var key in checkTeam) {
		newUsedUnits.add(key);
	}

	if (borrow.size == 1) {
		return isViableChoice(borrowStrategy, newUsedUnits, newRemainingTeams);
	}

	if (isViableChoice(borrowStrategy, newUsedUnits, newRemainingTeams)) {
		return true;
	}

	for (var key in checkTeam) {
		if ((borrowStrategy != 'none') && !borrow.has(key)) {
			newUsedUnits.delete(key);
		}

		var isViable = isViableChoice(borrowStrategy, newUsedUnits, newRemainingTeams);

		newUsedUnits.add(key);

		if (isViable) {
			return true;
		}
	}

	return false;
};

function hasMemberConflict(
	borrowStrategy: string,
	chosenTeams: Record<string, number>[]
) : boolean {

	return !isViableChoice(borrowStrategy, new Set<string>(), chosenTeams);
};

function renderAvailableTeam(
	borrowStrategy: string,
	chosenTeams: Record<string, number>[],
	row: HTMLTableRowElement
) : void {

	var button = <HTMLButtonElement> row.querySelector('button');

	if (hasMemberConflict(borrowStrategy, chosenTeams.concat(getMembers(row)))) {
		if (!row.classList.contains('unavailable')) {
			row.classList.add('unavailable');
			button.disabled = true;
		}
	}
	else {
		row.classList.remove('unavailable');
		button.disabled = false;
	}
};

function renderAvailableTeams() : void {
	var borrowStrategyElement = <HTMLInputElement> document.querySelector('input[name="borrow-strategy"]:checked');
	var borrowStrategy = borrowStrategyElement.value;

	var chosenMembers = Array.from(selectedBody.rows).map(getMembers);

	Array.from(availableBody.rows).forEach(renderAvailableTeam.bind(null, borrowStrategy, chosenMembers));
};


function renderUnavailableTeams() : void {
	var unavailableStyleElement = <HTMLInputElement> document.querySelector('input[name="unavailable-style"]:checked');
	var unavailableStyle = unavailableStyleElement.value;

	if (unavailableStyle == 'hide') {
		availableContainer.classList.add('hide-unavailable');
	}
	else {
		availableContainer.classList.remove('hide-unavailable');
	}
};

function toggleBuildVisibility() {
	var buildVisibilityElement = <HTMLInputElement> document.querySelector('input[name="build-visibility"]:checked');
	var buildVisibility = buildVisibilityElement.value;

	if (buildVisibility == 'hide') {
		availableContainer.classList.remove('show-unit-info');
		selectedContainer.classList.remove('show-unit-info');
	}
	else {
		availableContainer.classList.add('show-unit-info');
		selectedContainer.classList.add('show-unit-info');
	}
};
