function getTheLabAutoPageNames() : Record<string, string> {
	var sheetTypes = ['A', 'B', 'C', 'D'];
	var pageNames = <Record<string, string>> {};

	for (var i = 0; i < sheetTypes.length; i++) {
		var sheetType = sheetTypes[i];

		for (var j = 1; j <= 5; j++) {
			pageNames[sheetType + j] = sheetType;
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
	else {
		newDamage = getDamage(newDamageString);
	}

	if (newDamage > maxDamage) {
		console.warn(newDamage, '>', maxDamage, matcher[1]);
	}

	return Math.min(maxDamage, newDamage);
}

function getLabAutoTimelineURL(
	baseURL: string,
	gid: string,
	id: string
) : string {

	if (baseURL.indexOf('edit') == -1) {
		return baseURL + '?gid=' + gid + '#' + id;
	}

	var x = id.indexOf('R');

	return baseURL + '#gid=' + gid + '&range=A' + (parseInt(id.substring(x + 1)) + 1);
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

function hasWord(
	phrase: string,
	word: string
) : boolean {

	return phrase == word || phrase.startsWith(word + ' ') || phrase.endsWith(' ' + word) || phrase.indexOf(' ' + word + ' ') != -1;
}

function isFalseSubstitution(phrase: string) : boolean {
	return hasWord(phrase, 'chance') || hasWord(phrase, 'die') || hasWord(phrase, 'due') || hasWord(phrase, 'end') || hasWord(phrase, 'is') ||
		hasWord(phrase, 'lead') || hasWord(phrase, 'need') || hasWord(phrase, 'needs') || hasWord(phrase, 'or') || hasWord(phrase, 'seems') ||
		hasWord(phrase, 'survive') || hasWord(phrase, 'up');
}

function applySubstitution(
	newTeam: ClanBattleTeam,
	oldUnit: string,
	newUnit: string
) : boolean {

	if (oldUnit.toLowerCase().indexOf('can ') == 0) {
		oldUnit = oldUnit.substring(4);
	}

	if (oldUnit.toLowerCase().indexOf('swap ') == 0) {
		oldUnit = oldUnit.substring(5);
	}

	if (oldUnit.toLowerCase().indexOf('change ') == 0) {
		oldUnit = oldUnit.substring(7);
	}

	if (oldUnit.toLowerCase().indexOf('switch ') == 0) {
		oldUnit = oldUnit.substring(7);
	}

	var newBuild = <ClanBattleBuild> {};

	if ((newUnit.toLowerCase().charAt(0) == 'r') && (newUnit.toLowerCase().charAt(1) >= '0') && (newUnit.toLowerCase().charAt(1) <= '9')) {
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

	if (newUnit.charAt(newUnit.length - 1) >= '0' && newUnit.charAt(newUnit.length - 1) <= '9') {
		newBuild.star = newUnit.charAt(newUnit.length - 1);
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

function getSingleSubstitutions(
	oldTeam: ClanBattleTeam,
	description: string
) : ClanBattleTeam[] {

	var damageMatcher = getDamageMatcher(description);

	if (!damageMatcher && description.toLowerCase().indexOf('same') == -1) {
		return [];
	}

	var newTeam = Object.assign({}, oldTeam);
	var replacements;

	if (damageMatcher) {
		newTeam.damage = getLabAutoDamage(damageMatcher, oldTeam);
		replacements = description.substring(0, damageMatcher.index).split(/(?: and |\+)/i);
	}
	else {
		replacements = description.substring(0, description.toLowerCase().indexOf('same')).split(/(?: and |\+)/i);
	}

	newTeam.units = oldTeam.units.map(it => it);

	var hasSubstitution = true;

	for (var i = 0; i < replacements.length; i++) {
		var singleMatcher = singleSubRE.exec(replacements[i]);

		if (singleMatcher) {
			if (hasSubstitution) {
				var oldUnit = singleMatcher[1].trim();
				var newUnit = singleMatcher[2].trim();

				if (isFalseSubstitution(oldUnit) || isFalseSubstitution(newUnit)) {
					hasSubstitution = false;
				}
				else {
					hasSubstitution = applySubstitution(newTeam, oldUnit, newUnit);

					if (!hasSubstitution) {
						console.warn('could not identify unit substitution:', oldTeam, description);
					}
				}
			}
		}
		else {
			hasSubstitution = false;
		}
	}

	if (hasSubstitution) {
		return [newTeam];
	}
	else {
		return [];
	}
}

function getSingleFlippedSubstitutions(
	oldTeam: ClanBattleTeam,
	description: string
) : ClanBattleTeam[] {

	var damageMatcher = getDamageMatcher(description);

	if (!damageMatcher && description.toLowerCase().indexOf('same') == -1) {
		return [];
	}

	var newTeam = Object.assign({}, oldTeam);
	var replacements;

	if (damageMatcher) {
		newTeam.damage = getLabAutoDamage(damageMatcher, oldTeam);
		replacements = description.substring(0, damageMatcher.index).split(/(?: and |\+)/i);
	}
	else {
		replacements = description.substring(0, description.toLowerCase().indexOf('same')).split(/(?: and |\+)/i);
	}

	newTeam.units = oldTeam.units.map(it => it);

	var hasSubstitution = true;

	for (var i = 0; i < replacements.length; i++) {
		var singleFlippedMatcher = singleFlippedRE.exec(replacements[i]);

		if (singleFlippedMatcher) {
			if (hasSubstitution) {
				var oldUnit = singleFlippedMatcher[2].trim();
				var newUnit = singleFlippedMatcher[1].trim();

				if (isFalseSubstitution(oldUnit) || isFalseSubstitution(newUnit)) {
					hasSubstitution = false;
				}
				else {
					hasSubstitution = applySubstitution(newTeam, oldUnit, newUnit);

					if (!hasSubstitution) {
						console.warn('could not identify unit substitution:', oldTeam, description);
					}
				}
			}
		}
		else {
			hasSubstitution = false;
		}
	}

	if (hasSubstitution) {
		return [newTeam];
	}
	else {
		return [];
	}
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
	baseURL: string,
	gids: Record<string, string>,
	tab: string,
	rows: HTMLTableRowElement[]
) : ClanBattleTeam[] {

	var boss = tab.split(' ')[0];

	if (boss.length != 2 || (!(boss.charAt(0) in bossStats[currentCBId]['bossHP'])) || boss.charAt(1) <= '0' || boss.charAt(1) >= '6') {
		return [];
	}

	var teamRow = rows[0];
	var memberRow = rows[1];
	var levelRow = rows[5]
	var rankRow = rows[6];
	var starRow = rows[8];
	var ueRow = rows[9];

	var teamId = teamRow.cells[2].textContent || '';

	var fullAutoCheckbox = <SVGUseElement> memberRow.cells[9].querySelector('use');
	var isFullAuto = fullAutoCheckbox ? fullAutoCheckbox.href.baseVal.indexOf('#checked') != -1 : false;

	var damageTexts = [rows[2].cells[8].textContent || '', rows[2].cells[9].textContent || ''];

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
			console.warn(teamId, damage, '>', maxDamage, damageString);
		}
	}

	var members = Array.from(memberRow.cells).slice(3, 8).map(it => it.textContent || '');
	var levels = Array.from(levelRow.cells).slice(3, 8).map(it => it.textContent || '');
	var ranks = Array.from(rankRow.cells).slice(3, 8).map(it => it.textContent || '');
	var stars = Array.from(starRow.cells).slice(3, 8).map(it => it.textContent || '');
	var ues = Array.from(ueRow.cells).slice(3, 8).map(it => it.textContent).map(it => !it ? '' : (it != '-' && it.indexOf('UE') == -1 && it.indexOf('BRICK') == -1) ? ('UE' + it) : it);

	var units = <ClanBattleUnit[]> [];

	for (var i = 0; i < members.length; i++) {
		units.push({
			'name': members[i],
			'build': {
				level: levels[i],
				star: stars[i],
				rank: ranks[i].charAt(0) == 'r' ? ('R' + ranks[i].substring(1)) : ranks[i],
				unique: ues[i]
			}
		});
	}

	var notes = memberRow.cells[15].innerHTML;
	var index = 'TheLab Auto ' + teamId;
	var media = getLabAutoTimelineURL(baseURL, gids[tab], teamRow.cells[0].getAttribute('id') || '');

	var team = {
		boss: boss,
		region: 'global',
		timing: isFullAuto ? 'full auto' : 'semi auto',
		index: index,
		id: teamId,
		media: media,
		timeline: index + ' ' + media,
		damage: damage,
		units: units,
		notes: notes.replace(/[\r\n]/g, '')
	}

	var newTeams = <ClanBattleTeam[]> [team];

	var noteLines = notes.split('<br>');

	var singleSubstitutionsTeams = <ClanBattleTeam[][]> noteLines.filter(it => it.indexOf(' to ') != -1 || it.indexOf('->') != -1 || (it.toLowerCase().indexOf(' and ') != 1 && (it.indexOf('*') != -1 || it.indexOf('⭐') != -1))).map(getSingleSubstitutions.bind(null, team));
	newTeams = singleSubstitutionsTeams.reduce(collapseClanBattleTeams, newTeams);

	var singleFlippedSubstitutionsTeams = <ClanBattleTeam[][]> noteLines.filter(it => it.indexOf(' X ') != -1 || it.indexOf(' x ') != -1).map(getSingleFlippedSubstitutions.bind(null, team));
	newTeams = singleFlippedSubstitutionsTeams.reduce(collapseClanBattleTeams, newTeams);

	return newTeams;
}

function updateLabAutoTeams(
	baseURL: string,
	gids: Record<string, string>,
	tab: string,
	container: HTMLElement,
	teams: ClanBattleTeam[]
) : void {

	var rows = Array.from(container.querySelectorAll('tr'));
	var grid = getGoogleSheetsGrid(rows);

	for (var i = 6; i < rows.length - 1; i += 12) {
		var newTeams = getLabAutoTeams(baseURL, gids, tab, rows.slice(i, i + 10));

		Array.prototype.push.apply(teams, newTeams);
	}
}

function retrieveLabAutoTeams(
	baseURL: string,
	gids: Record<string, string>,
	container: HTMLElement,
	tabName: string,
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
		updateLabAutoTeams(baseURL, gids, tabName, tab, teams);
	}
}

function extractLabAutoTeams(
	href: string,
	container: HTMLElement
) : void {

	var tabElements = container.querySelectorAll('#sheet-menu li');

	var gids = <Record<string, string>> Array.from(tabElements).reduce((acc, next) => {
		var listItemId = next.getAttribute('id');

		if (!listItemId) {
			return acc;
		}

		var tabId = listItemId.substring('sheet-button-'.length);
		var tabName = (next.textContent || '').trim();

		acc[tabName] = tabId;

		return acc;
	}, <Record<string, string>> {});

	var pageNames = Object.keys(gids);

	var teams = <ClanBattleTeam[]> [];

	for (var i = 0; i < pageNames.length; i++) {
		var pageName = pageNames[i]

		retrieveLabAutoTeams(href, gids, container, pageName, teams);
	}

	teams.forEach(team => {
		team.units.forEach(unit => {
			unit.name = fixUnitName(unit.name);
		})
	});

	labAutoTeams = teams;

	updateExtraTeamsHelper();
}

function extractLabAutoTeamsLocal(
	baseURL: string,
	gids: Record<string, string>
) : void {

	if (document.location.host.indexOf('localhost') == -1) {
		return;
	}

	var teams = <ClanBattleTeam[]> [];

	var tabs = Object.keys(gids);

	for (var i = 0; i < tabs.length; i++) {
		var tab = tabs[i];

		var xhr = new XMLHttpRequest();
		xhr.open('GET', '/test/thelab_auto/' + encodeURIComponent(tab) + '.html', false)

		xhr.onload = function() {
			if (xhr.status != 200) {
				return;
			}

			var container = document.implementation.createHTMLDocument().documentElement;
			container.innerHTML = xhr.responseText;

			updateLabAutoTeams(baseURL, gids, tab, container, teams);
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