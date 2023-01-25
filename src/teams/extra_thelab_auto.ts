function getTheLabAutoPageNames() : Record<string, string> {
	var sheetTypes = ['Auto', 'Semi-Auto', 'Auto OVF'];

	var tierNames = <Record<string, string>> {
		'I': 'A',
		'II': 'B',
		'III': 'C',
		'IV': 'D',
	};

	var pageNames = <Record<string, string>> {};

	for (var i = 0; i < sheetTypes.length; i++) {
		var sheetType = sheetTypes[i];

		for (var tierName in tierNames) {
			pageNames['Tier ' + tierName + ' ' + sheetType] = tierNames[tierName];
		}
	}

	return pageNames;
}

function getLabAutoDamage(
	matcher: RegExpExecArray,
	oldTeam: ClanBattleTeam
) : number {

	var maxDamage = getMaxDamage(oldTeam.boss);

	if (isMaxDamage(matcher[0])) {
		return maxDamage;
	}

	var newDamage = getDamage(oldTeam.damage);

	if (matcher.length == 1) {
		return newDamage;
	}

	var newDamageString = matcher[1].replace(/,/, '.').trim();

	if (newDamageString.indexOf('±') == newDamageString.length - 1) {
		newDamageString = newDamageString.substring(0, newDamageString.length - 1).trim();
	}

	if (newDamageString.charAt(0) == '-') {
		newDamage += getDamage(newDamageString);
	}
	else if (newDamageString.charAt(0) == '+') {
		newDamage += getDamage(newDamageString.substring(1));
	}

	if (newDamage > maxDamage) {
		console.warn(newDamage, '>', maxDamage, matcher[1]);
	}

	return Math.min(maxDamage, newDamage);
}

function applyBuild(
	newTeam: ClanBattleTeam,
	description: string
) : boolean {

	var hasSubstitution = false;

	var x = description.indexOf(' ');
	var newBuild = description.substring(0, x).replace(/\*/, '⭐').replace(/^r/, 'rank ');
	var oldUnit = description.substring(x + 1).trim();

	for (var i = 0; i < newTeam.units.length; i++) {
		if (newTeam.units[i].name != oldUnit) {
			continue;
		}

		hasSubstitution = true;

		newTeam.units[i] = {
			name: oldUnit,
			build: getStringAsBuild(newBuild)
		};
	}

	return hasSubstitution;
}

function applySubstitution(
	newTeam: ClanBattleTeam,
	oldUnit: string,
	newUnit: string
) : boolean {

	if (oldUnit.toLowerCase().indexOf('swap ') == 0) {
		oldUnit = oldUnit.substring(5);
	}

	if (newUnit.indexOf(' or ') != -1) {
		return false;
	}

	var newBuild = <ClanBattleBuild> {};

	if (newUnit.charAt(0) == 'r') {
		newBuild.rank = newUnit.substring(1, newUnit.indexOf(' '));
		newUnit = newUnit.substring(newUnit.indexOf(' ')).trim();
	}
	else if (newUnit.charAt(1) == '*' || newUnit.charAt(1) == '⭐') {
		newBuild.star = newUnit.charAt(0);
		newUnit = newUnit.substring(2).trim();
	}
	else if (newUnit.charAt(newUnit.length - 1) == '*' || newUnit.charAt(newUnit.length - 1) == '⭐') {
		newBuild.star = newUnit.charAt(newUnit.length - 2);
		newUnit = newUnit.substring(0, newUnit.length - 2).trim();
	}

	oldUnit = fixUnitName(oldUnit);
	newUnit = fixUnitName(newUnit);

	for (var i = 0; i < newTeam.units.length; i++) {
		if (fixUnitName(newTeam.units[i].name) != oldUnit) {
			continue;
		}

		newTeam.units[i] = {
			'name': newUnit,
			'build': newBuild
		};

		return true;
	}

	return false;
}

function getRankStarVariations(
	oldTeam: ClanBattleTeam,
	description: string
) : ClanBattleTeam[] {

	var damageMatcher = getDamageMatcher(description);

	if (!damageMatcher) {
		return [];
	}

	var newDescription = description.substring(0, damageMatcher.index);

	var rankStarMatcher = rankStarRE.exec(newDescription);

	if (!rankStarMatcher) {
		return [];
	}

	var newTeam = Object.assign({}, oldTeam);

	var matchResults = rankStarMatcher[0].split('/').map(it => it.trim()).filter(it => it);

	for (var i = 0; i < matchResults.length; i++) {
		newTeam.damage = getLabAutoDamage(damageMatcher, oldTeam);
		newTeam.units = oldTeam.units.map(it => it);

		rankStarMatcher = rankStarRE.exec(matchResults[i]);

		if (!rankStarMatcher) {
			continue;
		}

		if (!applySubstitution(newTeam, rankStarMatcher[1], rankStarMatcher[0])) {
			console.warn('could not identify rank/star variation:', oldTeam, description);
			return [];
		}
	}

	return [newTeam];
}

function getBuildVariations(
	oldTeam: ClanBattleTeam,
	description: string
) : ClanBattleTeam[] {

	var damageMatcher = getDamageMatcher(description);

	if (!damageMatcher) {
		return [];
	}

	var newTeams = getRankStarVariations(oldTeam, description);

	var x = description.indexOf(',');

	if (x == -1) {
		return newTeams;
	}

	var y = description.indexOf(' ') + 1;

	var oldUnit = description.substring(y, description.indexOf(' ', y));

	var newDescription = description.substring(x + 1).trim();

	y = newDescription.indexOf(' ');

	newDescription = newDescription.substring(0, y) + ' ' + oldUnit + newDescription.substring(y);

	return newTeams.concat(getBuildVariations(oldTeam, newDescription));
}

function getSingleSubstitutions(
	oldTeam: ClanBattleTeam,
	description: string
) : ClanBattleTeam[] {

	var damageMatcher = getDamageMatcher(description);

	if (!damageMatcher) {
		return [];
	}

	var newTeam = Object.assign({}, oldTeam);

	newTeam.damage = getLabAutoDamage(damageMatcher, oldTeam);
	newTeam.units = oldTeam.units.map(it => it);

	var replacements = description.substring(0, damageMatcher.index).split(/(?: and |\+)/i);

	var hasSubstitution = true;

	for (var i = 0; i < replacements.length; i++) {
		var singleMatcher = singleSubRE.exec(replacements[i]);
		var rankStarMatcher = rankStarRE.exec(replacements[i]);

		if (singleMatcher) {
			if (hasSubstitution) {
				var oldUnit = singleMatcher[1].trim();
				var newUnit = singleMatcher[2].trim();

				if (oldUnit.toLowerCase().indexOf(' due') != -1 ||
					oldUnit.toLowerCase().indexOf(' die') != -1 ||
					oldUnit.toLowerCase().indexOf(' lead') != -1 ||
					oldUnit.toLowerCase().indexOf(' up') != -1 ||
					newUnit.toLowerCase().indexOf('end ') == 0) {

					singleMatcher = null;
				}
				else {
					hasSubstitution = applySubstitution(newTeam, oldUnit, newUnit);

					if (!hasSubstitution) {
						console.warn('could not identify unit substitution:', oldTeam, description);
					}
				}
			}
		}

		if (!singleMatcher) {
			if (rankStarMatcher) {
				if (hasSubstitution) {
					hasSubstitution = applySubstitution(newTeam, rankStarMatcher[1].trim(), rankStarMatcher[0].trim());

					if (!hasSubstitution) {
						console.warn('could not identify rank/star substitution:', oldTeam, description);
					}
				}
			}
			else {
				hasSubstitution = false;
			}
		}
	}

	if (hasSubstitution) {
		return [newTeam];
	}
	else {
		return [];
	}
}

function getMultiSubstitutions(
	oldTeam: ClanBattleTeam,
	description: string
) : ClanBattleTeam[] {

	var x = description.indexOf(' to:')

	var oldUnit = description.substring(description.lastIndexOf(' ', x - 1) + 1, x);

	var substitutions = description.substring(x + 4).split(', ');

	var newTeams = [];

	for (var i = 0; i < substitutions.length; i++) {
		var substitution = substitutions[i];

		var damageMatcher = getDamageMatcher(substitution);

		if (!damageMatcher) {
			continue;
		}

		var newUnit = substitution.substring(0, substitution.lastIndexOf(' ', damageMatcher.index)).trim();

		var x = newUnit.indexOf(' ');

		if (x != -1) {
			newUnit = newUnit.substring(0, x);
		}

		var newTeam = Object.assign({}, oldTeam);

		newTeam.damage = getLabAutoDamage(damageMatcher, oldTeam);
		newTeam.units = oldTeam.units.map(it => it);

		if (applySubstitution(newTeam, oldUnit, newUnit)) {
			newTeams.push(newTeam);
		}
	}

	return newTeams;
}

function collapseClanBattleTeams(
	acc: ClanBattleTeam[],
	next: ClanBattleTeam[]
) : ClanBattleTeam[] {

	if (next == null) {
		return acc;
	}

	return acc.concat(next);
}

function getLabAutoTeams(
	boss: string,
	rows: HTMLTableRowElement[],
	memberIndex: number,
	damageIndices: number[]
) : ClanBattleTeam[] {

	var teamRow = rows[0];
	var memberRow = rows[1];
	var rankRow = rows[5];
	var starRow = rows[6];
	var ueRow = rows[7];

	var teamIdIndex = memberIndex;
	var timingIndex = memberIndex + 6;

	for (var i = 0; i < teamIdIndex; i++) {
		var adjust = parseInt(teamRow.cells[i].getAttribute('colspan') || '1') - 1;
		teamIdIndex -= adjust;
		timingIndex -= adjust;
	}

	for (var i = teamIdIndex; i < timingIndex; i++) {
		timingIndex -= parseInt(teamRow.cells[i].getAttribute('colspan') || '1') - 1;
	}

	var teamId = teamRow.cells[teamIdIndex].textContent || '';
	var isFullAuto = teamId.indexOf('FA') != -1;

	var damageTexts = rows.map((it, i) => damageIndices[i] == -1 ? '' : it.cells[damageIndices[i]].textContent || '');

	var damages = damageTexts.filter(isMaxDamage);

	if (damages.length == 0) {
		damages = damageTexts.map(it => getDamageMatcher(it)).filter(it => it).map((it: RegExpExecArray) => it[1]).map(it => it.indexOf(',') != -1 ? (it.replace(/,/g, '') + 'k') : it);
	}

	if (damages.length == 0) {
		return [];
	}

	var damageString = damages[0];
	var damage = 0.0;
	var maxDamage = getMaxDamage(boss);

	if (isMaxDamage(damageString)) {
		damage = maxDamage;
	}
	else {
		damage = getDamage(damageString);

		if (damage > maxDamage) {
			console.warn(damage, '>', maxDamage, damageString);
		}
	}

	var members = Array.from(memberRow.cells).slice(memberIndex, memberIndex + 5).map(it => it.textContent || '');

	var rankIndex = damageIndices[5] - 5;
	var ranks = Array.from(rankRow.cells).slice(rankIndex, rankIndex + 5).map(it => it.textContent || '');

	var starsIndex = damageIndices[6] - 5;
	var stars = Array.from(starRow.cells).slice(starsIndex, starsIndex + 5).map(it => it.textContent || '');

	var ueIndex = damageIndices[7] - 5;
	var ues = Array.from(ueRow.cells).slice(ueIndex, ueIndex + 5).map(it => it.textContent).map(it => !it ? '' : (it != '-' && it.indexOf('UE') == -1 && it.indexOf('BRICK') == -1) ? ('UE' + it) : it);

	var units = <ClanBattleUnit[]> [];

	for (var i = 0; i < members.length; i++) {
		units.push({
			'name': members[i],
			'build': {
				star: stars[i],
				rank: ranks[i].charAt(0) == 'r' ? ('R' + ranks[i].substring(1)) : ranks[i],
				unique: ues[i]
			}
		});
	}

	var notes = rows[2].cells[damageIndices[2]+1].innerHTML;

	var team = {
		'boss': boss,
		'region': 'global',
		'timing': notes.indexOf('AUTO OFF, only spam Nyaru') != -1 ? 'spam nyaru' : isFullAuto ? 'full auto' : 'semi auto',
		'timeline': 'TheLab Auto ' + teamId,
		'damage': damage,
		'units': units,
		'notes': notes.replace(/[\r\n]/g, '')
	}

	var newTeams = <ClanBattleTeam[]> [team];

	var noteLines = notes.split('<br>');

	var buildVariationsTeams = <ClanBattleTeam[][]> noteLines.filter(it => it.indexOf(' to ') == -1 && ((it.charAt(0) == 'r' && it.charAt(1) >= '0' && it.charAt(1) <= '9') || (it.toLowerCase().indexOf(' and ') == -1 && (it.charAt(1) == '*' || it.charAt(1) == '⭐')))).map(getBuildVariations.bind(null, team));
	newTeams = buildVariationsTeams.reduce(collapseClanBattleTeams, newTeams);

	var singleSubstitutionsTeams = <ClanBattleTeam[][]> noteLines.filter(it => it.indexOf(' to ') != -1 || (it.toLowerCase().indexOf(' and ') != 1 && (it.indexOf('*') != -1 || it.indexOf('⭐') != -1))).map(getSingleSubstitutions.bind(null, team));
	newTeams = singleSubstitutionsTeams.reduce(collapseClanBattleTeams, newTeams);

	var multiSubstitutionsTeams = <ClanBattleTeam[][]> noteLines.filter(it => it.indexOf(' to:') != -1).map(getMultiSubstitutions.bind(null, team));
	newTeams = multiSubstitutionsTeams.reduce(collapseClanBattleTeams, newTeams);

	return newTeams;
}

function updateLabAutoTeams(
	tier: string,
	container: HTMLElement,
	teams: ClanBattleTeam[]
) : void {

	var rows = Array.from(container.querySelectorAll('tr'));
	var grid = getGoogleSheetsGrid(rows);

	// columns: 7, 16, 25, 34, 43

	for (var j = 1; j <= 5; j++) {
		var desiredX = -2 + (j * 9);

		for (var i = 7; i < rows.length - 1; i += 8) {
			var damageIndices = [-1, -1];

			for (var y = 2; y < 8; y++) {
				var k = 0;

				for (var x = 0; x < desiredX; k++) {
					x += grid[i+y][k];
				}

				damageIndices.push(k);
			}

			var newTeams = getLabAutoTeams(tier + j, rows.slice(i, i+8), -7 + (9*j), damageIndices);

			Array.prototype.push.apply(teams, newTeams);
		}
	}
}

function retrieveLabAutoTeams(
	container: HTMLElement,
	tabName: string,
	tier: string,
	teams: ClanBattleTeam[]
) : void {

	var tabElements = Array.from(container.querySelectorAll('#sheet-menu li')).filter(it => it.textContent && it.textContent.trim() == tabName);

	if (tabElements.length == 0) {
		return;
	}

	var tabElement = <HTMLLIElement> tabElements[0];
	var listItemId = tabElement.getAttribute('id');

	if (!listItemId) {
		return
	}

	var tabId = listItemId.substring('sheet-button-'.length);
	var tab = <HTMLDivElement |  null> container.querySelector('div[id="' + tabId + '"]');

	if (tab) {
		updateLabAutoTeams(tier, tab, teams);
	}
}

function extractLabAutoTeams(
	href: string,
	container: HTMLElement
) : void {

	var teams = <ClanBattleTeam[]> [];

	var pageNames = getTheLabAutoPageNames();

	var tabs = Array.from(Object.keys(pageNames));

	for (var i = 0; i < tabs.length; i++) {
		var tab = tabs[i];
		var tier = pageNames[tab];

		retrieveLabAutoTeams(container, tab, tier, teams);
	}

	teams.forEach(team => {
		team.units.forEach(unit => {
			unit.name = fixUnitName(unit.name);
		})
	});

	labAutoTeams = teams;

	updateExtraTeamsHelper();
}

function extractLabAutoTeamsLocal() : void {
	if (document.location.host.indexOf('localhost') == -1 || document.location.search) {
		return;
	}

	var teams = <ClanBattleTeam[]> [];

	var pageNames = getTheLabAutoPageNames();

	var tabs = Object.keys(pageNames);

	for (var i = 0; i < tabs.length; i++) {
		var tab = tabs[i];
		var tier = pageNames[tab];

		var xhr = new XMLHttpRequest();
		xhr.open('GET', '/test/thelab_auto/' + encodeURIComponent(tab) + '.html', false)

		xhr.onload = function() {
			if (xhr.status != 200) {
				return;
			}

			var container = document.implementation.createHTMLDocument().documentElement;
			container.innerHTML = xhr.responseText;

			updateLabAutoTeams(tier, container, teams);
		}

		xhr.send(null);
	}

	teams.forEach(team => {
		team.units.forEach(unit => {
			unit.name = fixUnitName(unit.name);
		})
	});

	labAutoTeams = teams;

	updateExtraTeamsHelper();

	console.log(teams.map(getTeamAsCSVRow).join('\n'));
}