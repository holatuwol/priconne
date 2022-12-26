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

function updateCountElement() : void {
	var countElement = <HTMLElement | null> document.querySelector('#visible-teams-count');

	if (!countElement) {
		return;
	}

	var visibleTeams = availableBody.querySelectorAll('tr:not(.filtered-out):not(.unavailable)');

	countElement.textContent = '' + visibleTeams.length;

	var pluralElement = <HTMLElement | null> document.querySelector('#visible-teams-plural');

	if (pluralElement) {
		pluralElement.style.display = (visibleTeams.length == 1) ? 'none' : 'inline';
	}
}

teamUpdateListeners.push(updateCountElement);

function filterAvailableTeamsHelper() {
	var availableBosses = getCheckboxValues('#bosses-available input[type="checkbox"]:checked, #bosses-available input[type="hidden"]');
	var availableRegions = getCheckboxValues('#regions-available input[type="checkbox"]:checked, #regions-available input[type="hidden"]');
	var availableTimings = getCheckboxValues('#timings-available input[type="checkbox"]:checked, #timings-available input[type="hidden"]');

	var filter = <HTMLInputElement> document.getElementById('team-filter');

	var searchText = filter.value.trim().toLowerCase().replace(/\./g, '');

	var searchTerms = searchText ? searchText.split(/\s+/g) : [];

	document.querySelectorAll('tr.special-visible').forEach((it) => it.classList.remove('special-visible'));

	Array.from(availableBody.rows).forEach(filterAvailableTeam.bind(null, availableBosses, availableRegions, new Set(availableTimings), searchTerms));

	var plausibleFilter = isPlausibleTeam.bind(null, availableBosses, availableRegions, availableTimings);

	for (var i = 0; i < searchTerms.length; i++) {
		availableBody.querySelectorAll('tr[data-members="' + searchTerms[i].replace(/"/g, '') + '"]').forEach((it) => it.classList.add('special-visible'));
	}

	updateCountElement();

	var altBosses = Array.from(availableBody.rows).reduce(extractAltBosses, <Record<string, string[]>> {});

	var plausibleRows = Array.from(document.querySelectorAll('tbody tr[data-members]')).filter(plausibleFilter);

	var altUses = plausibleRows.reduce(extractAltUses, <Record<string, number>> {});

	var tierBosses = new Set();

	availableBosses.forEach(boss => {
		for (var i = 1; i <= 5; i++) {
			tierBosses.add(boss.charAt(0) + i);
		}
	});

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
			altBossLink.textContent = altBosses[key].filter(it2 => tierBosses.has(it2)).map(it2 => it2 == boss ? ('[' + it2 + ']') : it2).join(', ');
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

function getMembers(row : HTMLTableRowElement) : Record<string, ClanBattleBuild> {
	return Array.from(row.querySelectorAll('img')).reduce((acc, img) => {
		var name = img.title;
		acc[name] = {};

		var value = img.getAttribute('data-level');

		if (value) {
			acc[name].level = value;
		}

		value = img.getAttribute('data-star');

		if (value) {
			acc[name].star = value;
		}

		value = img.getAttribute('data-rank');

		if (value) {
			acc[name].rank = value;
		}

		return acc;
	}, <Record<string, ClanBattleBuild>> {});
};

function getMaxValidValue(
	str: string,
	maxValue: number
) : number {

	if (str.indexOf('+') != -1 || str.toLowerCase() == 'any') {
		return maxValue;
	}

	var pattern = /^[0-9]+$/g;

	if (pattern.test(str)) {
		return parseInt(str);
	}

	if (str.indexOf('/') != -1) {
		return Math.max.apply(null, str.split('/').map(it => parseInt(it.trim())));
	}

	if (str.indexOf('-') != -1 || str.indexOf('~') != -1) {
		return Math.max.apply(null, str.split(/[\-~]/g).map(it => parseInt(it.trim())));
	}

	console.warn('failed to parse desired build value', str);

	return maxValue;
}

function isMatchingLevel(
	desiredBuild: ClanBattleBuild,
	actualBuild: ClanBattleBuild
) : boolean {

	if (!actualBuild.level || !desiredBuild.level) {
		return true;
	}

	return parseInt(actualBuild.level) <= getMaxValidValue(desiredBuild.level, bossStats[currentCBId].maxLevel);
}

function isMatchingStar(
	desiredBuild: ClanBattleBuild,
	actualBuild: ClanBattleBuild
) : boolean {

	if (!actualBuild.star || !desiredBuild.star) {
		return true;
	}

	return parseInt(actualBuild.star) <= getMaxValidValue(desiredBuild.star, 6);
}

function isMatchingRank(
	desiredBuild: ClanBattleBuild,
	actualBuild: ClanBattleBuild
) : boolean {

	if (!actualBuild.rank || !desiredBuild.rank) {
		return true;
	}

	var rankRE = /([0-9]+)-([0-9]+)/;

	var actualMatcher = rankRE.exec(actualBuild.rank);
	var desiredMatcher = rankRE.exec(desiredBuild.rank);

	if (actualMatcher && desiredMatcher) {
		if (parseInt(actualMatcher[1]) != parseInt(desiredMatcher[1])) {
			return parseInt(actualMatcher[1]) < parseInt(desiredMatcher[1]);
		}

		return parseInt(actualMatcher[2]) <= parseInt(desiredMatcher[2]);
	}

	rankRE = /[0-9]+/;

	actualMatcher = rankRE.exec(actualBuild.rank);
	desiredMatcher = rankRE.exec(desiredBuild.rank);

	if (actualMatcher && desiredMatcher) {
		return parseInt(actualMatcher[0]) <= parseInt(desiredMatcher[0]);
	}

	return actualBuild.rank <= desiredBuild.rank;
}

function getBrickDifferences(
	units: Record<string, ClanBattleBuild>,
	key: string,
	desiredBuild?: ClanBattleBuild
) : ClanBattleBuild {

	var mismatchedBuild = <ClanBattleBuild> {};

	var actualBuild = units[key];

	if (!desiredBuild || !actualBuild) {
		return mismatchedBuild;
	}

	if (!isMatchingLevel(desiredBuild, actualBuild)) {
		mismatchedBuild.level = actualBuild.level;
	}

	if (!isMatchingStar(desiredBuild, actualBuild)) {
		mismatchedBuild.star = actualBuild.star;
	}

	if (!isMatchingRank(desiredBuild, actualBuild)) {
		mismatchedBuild.rank = actualBuild.rank;
	}

	return mismatchedBuild;
}

function hasUnitAvailable(
	units: Record<string, ClanBattleBuild>,
	key: string,
	desiredBuild?: ClanBattleBuild
) : boolean {

	var actualBuild = units[key];

	if (!actualBuild) {
		return false;
	}

	if (!desiredBuild) {
		return true;
	}

	var isMismatchedBuild = false;

	if (!isMatchingLevel(desiredBuild, actualBuild) ||
		!isMatchingStar(desiredBuild, actualBuild) ||
		!isMatchingRank(desiredBuild, actualBuild)) {

		return false;
	}

	return true;
}

function isViableChoice(
	usableUnits: Record<string, ClanBattleBuild>,
	borrowStrategy: string,
	usedUnits: Set<string>,
	remainingTeams: Record<string, ClanBattleBuild>[]
) : boolean {

	var borrow = new Set();
	var checkTeam = remainingTeams[0];

	for (var key in checkTeam) {
		if (!hasUnitAvailable(usableUnits, key, checkTeam[key])) {
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
		return isViableChoice(usableUnits, borrowStrategy, newUsedUnits, newRemainingTeams);
	}

	if (isViableChoice(usableUnits, borrowStrategy, newUsedUnits, newRemainingTeams)) {
		return true;
	}

	for (var key in checkTeam) {
		if ((borrowStrategy != 'none') && !borrow.has(key)) {
			newUsedUnits.delete(key);
		}

		var isViable = isViableChoice(usableUnits, borrowStrategy, newUsedUnits, newRemainingTeams);

		newUsedUnits.add(key);

		if (isViable) {
			return true;
		}
	}

	return false;
};

function hasMemberConflict(
	usableUnits: Record<string, ClanBattleBuild>,
	borrowStrategy: string,
	chosenTeams: Record<string, ClanBattleBuild>[]
) : boolean {

	return !isViableChoice(usableUnits, borrowStrategy, new Set<string>(), chosenTeams);
};

function markUnavailableTeam(
	borrowStrategy: string,
	chosenTeams: Record<string, ClanBattleBuild>[],
	row: HTMLTableRowElement
) : void {

	var button = <HTMLButtonElement> row.querySelector('button');

	if (hasMemberConflict(availableUnits, borrowStrategy, chosenTeams.concat(getMembers(row)))) {
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

function markUnavailableTeams() : void {
	var borrowStrategyElement = <HTMLInputElement> document.querySelector('input[name="borrow-strategy"]:checked');
	var borrowStrategy = borrowStrategyElement ? borrowStrategyElement.value : 'all';

	var chosenTeams = Array.from(selectedBody.rows).map(getMembers);

	Array.from(availableBody.rows).forEach(markUnavailableTeam.bind(null, borrowStrategy, chosenTeams));
};

teamUpdateListeners.push(markUnavailableTeams);

function renderUnavailableTeams() : void {
	var unavailableStyleElement = <HTMLInputElement> document.querySelector('input[name="unavailable-style"]:checked');
	var unavailableStyle = unavailableStyleElement ? unavailableStyleElement.value : 'hide';

	if (unavailableStyle == 'hide') {
		availableContainer.classList.add('hide-unavailable');
	}
	else {
		availableContainer.classList.remove('hide-unavailable');
	}
};

function toggleBuildVisibility() {
	var buildVisibilityElement = <HTMLInputElement> document.querySelector('input[name="build-visibility"]:checked');
	var buildVisibility = buildVisibilityElement ? buildVisibilityElement.value : 'show';

	if (buildVisibility == 'hide') {
		availableContainer.classList.remove('show-unit-info');
		selectedContainer.classList.remove('show-unit-info');
	}
	else {
		availableContainer.classList.add('show-unit-info');
		selectedContainer.classList.add('show-unit-info');
	}
};

function fireTeamUpdateListeners() : void {
	for (var i = 0; i < teamUpdateListeners.length; i++) {
		teamUpdateListeners[i]();
	}
}