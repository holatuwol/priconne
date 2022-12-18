var bossAllocationStatusElement = <HTMLDivElement> document.querySelector('#boss-allocation-status .allocation-status');
var playerAllocationStatusElement = <HTMLDivElement> document.querySelector('#player-allocation-status .allocation-status');
var currentAllocationElement = <HTMLDivElement> document.querySelector('#current-allocation');

function getPlayerRaises(
	chosenTeams: Record<string, ClanBattleBuild>[],
	usableUnits: Record<string, ClanBattleBuild>
) : ClanBattleUnit[] {

	var raises = <ClanBattleUnit[]> [];

	for (var i = 0; i < chosenTeams.length; i++) {
		var checkTeam = chosenTeams[i];

		for (var key in checkTeam) {
			var desiredBuild = checkTeam[key];

			if (!hasUnitAvailable(usableUnits, key, desiredBuild)) {
				continue;
			}

			var actualBuild = usableUnits[key];

			if (actualBuild.level != desiredBuild.level ||
				actualBuild.star != desiredBuild.star ||
				actualBuild.rank != desiredBuild.rank) {

				raises.push({
					name: key,
					build: desiredBuild
				});
			}
		}
	}

	return raises;
}

function getPlayerBorrows(
	chosenTeams: Record<string, ClanBattleBuild>[],
	usableUnits: Record<string, ClanBattleBuild>
) : ClanBattleUnit[] {

	var borrows = <ClanBattleUnit[]> [];

	for (var i = 0; i < chosenTeams.length; i++) {
		var checkTeam = chosenTeams[i];

		for (var key in checkTeam) {
			var desiredBuild = checkTeam[key];

			if (hasUnitAvailable(usableUnits, key, desiredBuild)) {
				continue;
			}

			borrows.push({
				name: key,
				build: getBrickDifferences(usableUnits, key, desiredBuild)
			});
		}
	}

	return borrows;
}

function getUnitComparisonItem(
	unitName: string,
	desiredBuild: ClanBattleBuild,
	actualBuild: ClanBattleBuild | null
) : HTMLElement {

	var figureElement = document.createElement('figure');

	var img = document.createElement('img');

	img.setAttribute('title', unitName);
	img.setAttribute('src', getUnitIcon(unitIds[unitName], typeof hasSixStar !== 'undefined' && hasSixStar.has(unitNames[unitIds[unitName]]) ? 6 : 3));

	figureElement.appendChild(img);

	var captionElement = document.createElement('figcaption');

	var actualHeader = document.createElement('strong');
	actualHeader.textContent = 'current';
	captionElement.appendChild(actualHeader);

	captionElement.appendChild(document.createElement('br'));
	captionElement.appendChild(document.createTextNode(actualBuild == null ? 'missing' : getBuildAsString(actualBuild, '; ')));

	captionElement.appendChild(document.createElement('br'));

	var desiredHeader = document.createElement('strong');
	desiredHeader.textContent = 'needed';
	captionElement.appendChild(desiredHeader);

	captionElement.appendChild(document.createElement('br'));
	captionElement.appendChild(document.createTextNode(getBuildAsString(desiredBuild, '; ')));

	figureElement.appendChild(captionElement);

	return figureElement;
}

function getInitialViabilityMarkers(playerNames: string[]) : HTMLDivElement {
	var matchElement = document.createElement('div');

	matchElement.classList.add('player-matches');

	for (var i = 0; i < playerNames.length; i++) {
		var playerName = playerNames[i];

		var viableElement = document.createElement('span');

		var viableCheckboxElement = document.createElement('input');
		viableCheckboxElement.setAttribute('type', 'checkbox');
		viableCheckboxElement.setAttribute('data-player', playerName);

		viableElement.appendChild(viableCheckboxElement);
		matchElement.appendChild(viableElement);
	}

	return matchElement;
}

function updateAllocationStatus(
	input: HTMLInputElement,
	playerNames: string[]
) : void {

	var row = <HTMLTableRowElement> input.closest('tr');

	var bossName = <string> row.getAttribute('data-boss');
	var timeline = <string> row.getAttribute('data-timeline');
	var playerName = <string> input.getAttribute('data-player');

	var hasAllocation = allocatedHits.filter(it => it.playerName == playerName && it.timeline == timeline).length > 0;

	if (input.checked) {
		if (!hasAllocation) {
			allocatedHits.push({
				bossName: bossName,
				day: '0',
				playerName: playerName,
				timeline: timeline
			})
		}
	}
	else {
		allocatedHits = allocatedHits.filter(it => !(it.playerName == playerName && it.timeline == timeline));
	}

	var count = allocatedHits.filter(it => it.bossName == bossName).length;
	var countElement = <HTMLSpanElement> bossAllocationStatusElement.querySelector('span[title="' + bossName + '"]');

	countElement.textContent = '' + count;

	count = allocatedHits.filter(it => it.playerName == playerName).length;
	countElement = <HTMLAnchorElement> playerAllocationStatusElement.querySelector('span[title="' + playerName + '"] a');

	countElement.textContent = '' + count;

	if (count == 0) {
		countElement.removeAttribute('href');
	}
	else {
		countElement.setAttribute('href', '#');
	}

	var status = <ClanBattleStatus> {
		allocation: {
			completed: [],
			remaining: allocatedHits
		},
		carryover: {},
		day: '0',
		hitNumber: 0,
		index: 0,
		lap: 0,
		latestHit: null,
		remainingHP: 0
	};

	renderRemainingHitsByBoss(status);
	renderRemainingHitsByPlayer(status);
}

function updateViabilityMarkersHelper(
	chosenTeams: Record<string, ClanBattleBuild>[],
	borrowStrategy: string,
	playerNames: string[],
	row: HTMLTableRowElement
) : void {

	var altBossesCell = <HTMLTableCellElement> row.querySelector('td.alt-bosses');

	var matchElement = altBossesCell.querySelector('.player-matches');

	if (!matchElement) {
		matchElement = getInitialViabilityMarkers(playerNames);

		altBossesCell.appendChild(matchElement);
	}

	var newTeam = getMembers(row);

	var hasAnyMatch = false;

	for (var i = 0; i < playerNames.length; i++) {
		var playerName = playerNames[i];
		var usableUnits = clanUnits[playerName];

		var viableCheckboxElement = <HTMLInputElement> matchElement.querySelector('input[data-player="' + playerName + '"]');
		var viableElement = <HTMLSpanElement> viableCheckboxElement.closest('span');

		var newChosenTeams = allocatedHits.filter(it => it.playerName == playerName).map(it => getMembers(<HTMLTableRowElement> document.querySelector('tr[data-timeline="' + (it.timeline || '') + '"]')));

		if (newChosenTeams.filter(it => _.isEqual(it, newTeam)).length == 0) {
			viableCheckboxElement.checked = false;
			newChosenTeams.push(newTeam);
		}
		else {
			viableCheckboxElement.checked = true;
		}

		for (var j = 0; j < chosenTeams.length; j++) {
			var chosenTeam = chosenTeams[j];

			if (newChosenTeams.filter(it => _.isEqual(it, chosenTeam)).length == 0) {
				newChosenTeams.push(chosenTeam);
			}
		}

		if (isViableChoice(usableUnits, borrowStrategy, new Set<string>(), newChosenTeams)) {
			viableCheckboxElement.removeAttribute('disabled');

			viableElement.setAttribute('data-viable', 'true');
			viableElement.setAttribute('title', playerName + ': yes');

			hasAnyMatch = true;
		}
		else {
			viableCheckboxElement.setAttribute('disabled', 'true');

			var borrows = getPlayerBorrows(newChosenTeams, usableUnits);
			var buildString = borrows.map(it => it.name + ': ' + (it.name in usableUnits ? getBuildAsString(it.build, '; ') : 'missing')).join('\n');

			viableElement.setAttribute('data-viable', 'false');
			viableElement.setAttribute('title', playerName + ': no\n' + buildString);
		}
	}

	if (!hasAnyMatch) {
		row.classList.add('unavailable');
	}

	if (row.closest('tbody') == selectedBody && !row.hasAttribute('data-listener')) {
		matchElement.querySelectorAll('input[type="checkbox"]').forEach((it: HTMLInputElement) => it.onchange = updateAllocationStatus.bind(null, it, playerNames));

		row.setAttribute('data-listener', 'true');
	}
}

function filterByPlayerName(playerName: string) : void {
	for (var i = selectedBody.rows.length - 1; i >= 0; i--) {
		var buttonElement = <HTMLButtonElement> selectedBody.rows[i].querySelector('button');
		buttonElement.click();
	}

	for (var i = 0; i < availableBody.rows.length; i++) {
		var timeline = availableBody.rows[i].getAttribute('data-timeline');

		if (allocatedHits.filter(it => it.playerName == playerName && it.timeline == timeline).length == 0) {
			continue;
		}

		var buttonElement = <HTMLButtonElement> availableBody.rows[i].querySelector('button');
		buttonElement.click();
	}
}

function updateViabilityMarkers() : void {
	var borrowStrategy = 'all';
	var chosenTeams = Array.from(selectedBody.rows).map(getMembers);

	var playerNames = Array.from(Object.keys(clanUnits)).sort();

	var tierNames = Object.keys(bossStats[currentCBId].bossHP);
	var bossNames = tierNames.map(it => [it + '1', it + '2', it + '3', it + '4', it + '5']).reduce((acc, it) => acc.concat(it));

	if (bossAllocationStatusElement.childNodes.length < bossNames.length) {
		for (var i = 0; i < bossNames.length; i++) {
			var spanElement = document.createElement('span');
			spanElement.setAttribute('title', bossNames[i]);
			spanElement.textContent = '0';
			bossAllocationStatusElement.appendChild(spanElement);
		}
	}

	if (playerAllocationStatusElement.childNodes.length < playerNames.length) {
		for (var i = 0; i < playerNames.length; i++) {
			var playerName = playerNames[i];
			var spanElement = document.createElement('span');
			spanElement.setAttribute('title', playerName);

			var linkElement = document.createElement('a');
			linkElement.textContent = '0';
			linkElement.onclick = filterByPlayerName.bind(null, playerName);

			spanElement.appendChild(linkElement);
			playerAllocationStatusElement.appendChild(spanElement);
		}
	}

	for (var i = 0; i < availableBody.rows.length; i++) {
		updateViabilityMarkersHelper(chosenTeams, borrowStrategy, playerNames, availableBody.rows[i]);
	}

	for (var i = 0; i < selectedBody.rows.length; i++) {
		updateViabilityMarkersHelper(chosenTeams, borrowStrategy, playerNames, selectedBody.rows[i]);
	}
}

teamUpdateListeners.push(updateViabilityMarkers);