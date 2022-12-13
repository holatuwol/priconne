var playerRequirementsElement = <HTMLDivElement> document.querySelector('#player-requirements');

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

			if (!hasUnitAvailable(usableUnits, key, desiredBuild)) {
				borrows.push({
					name: key,
					build: desiredBuild
				});
			}
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

function addPlayerRequirementsRow(
	chosenTeams: Record<string, ClanBattleBuild>[],
	borrowStrategy: string,
	playerName: string
) : void {

	var usableUnits = clanUnits[playerName];

	if (!isViableChoice(usableUnits, borrowStrategy, new Set<string>(), chosenTeams)) {
		return;
	}

	var playerNameElement = document.createElement('h3');
	playerNameElement.textContent = playerName;
	playerRequirementsElement.appendChild(playerNameElement);

	var raises = getPlayerRaises(chosenTeams, usableUnits);

	var raiseElementHeader = document.createElement('h4');
	raiseElementHeader.textContent = 'Must Raise';
	playerRequirementsElement.appendChild(raiseElementHeader);

	var raiseElement = raises.reduce((acc, it) => {
		acc.appendChild(getUnitComparisonItem(it.name, it.build, usableUnits[it.name]));

		return acc;
	}, document.createElement('div'));

	if (raises.length == 0) {
		raiseElement.appendChild(document.createTextNode('none'));		
	}

	playerRequirementsElement.appendChild(raiseElement);

	var borrowElementHeader = document.createElement('h4');
	borrowElementHeader.textContent = 'Must Borrow (Cannot Raise / Missing Unit)';
	playerRequirementsElement.appendChild(borrowElementHeader);

	var borrows = getPlayerBorrows(chosenTeams, usableUnits);

	var borrowElement = borrows.reduce((acc, it) => {
		acc.appendChild(getUnitComparisonItem(it.name, it.build, usableUnits[it.name]));

		return acc;
	}, document.createElement('div'));

	if (borrows.length == 0) {
		borrowElement.appendChild(document.createTextNode('none'));		
	}

	playerRequirementsElement.appendChild(borrowElement);
}

function updatePlayerRequirements(
	chosenTeams: Record<string, ClanBattleBuild>[],
	borrowStrategy: string
) : void {

	playerRequirementsElement.innerHTML = '';

	if (chosenTeams.length == 0) {
		return;
	}

	for (var playerName in clanUnits) {
		addPlayerRequirementsRow(chosenTeams, borrowStrategy, playerName);
	}
}

function markUnavailableTeams() : void {
	var borrowStrategy = 'all';

	var chosenTeams = Array.from(selectedBody.rows).map(getMembers);

	Array.from(availableBody.rows).forEach(markUnavailableTeam.bind(null, borrowStrategy, chosenTeams));

	updatePlayerRequirements(chosenTeams, borrowStrategy);
}