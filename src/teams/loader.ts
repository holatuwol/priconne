function parseRawTeam(text: string): ClanBattleTeam[] {
	var team = text.split(',');

	return [{
		boss: team[0],
		damage: getDamage(team[2]),
		region: 'global',
		timing: team[1],
		timeline: "extra team",
		units: team.slice(3).map(it => { return { name: fixUnitName(it), build: {} } })
	}];
}

function parseCSVTeams(text: string) : ClanBattleTeam[] {
	var rows = csv2arr(text);

	var header = rows[0];

	var teams = rows.slice(1).filter(it => it[0]).map(row => {
		var result = <ClanBattleTeam> {
			boss: '',
			damage: 0.0,
			region: '',
			timing: '',
			timeline: '',
			units: <ClanBattleUnit[]> new Array(5)
		};

		for (var i = 0; i < 5; i++) {
			result.units[i] = {name: '', build: {}};
		}

		for (var i = 0; i < header.length; i++) {
			if (header[i] == 'boss') {
				result.boss = row[i];
			}
			else if (header[i] == 'damage') {
				result.damage = getDamage(row[i]);
			}
			else if (header[i] == 'notes') {
				result.notes = row[i];
			}
			else if (header[i] == 'region') {
				result.region = row[i];
			}
			else if (header[i] == 'timing') {
				result.timing = row[i];
			}
			else if (header[i] == 'timeline') {
				result.timeline = row[i];
			}
			else if ((header[i].indexOf('slot') == 0) || (header[i].indexOf('unit') == 0)) {
				var index = parseInt(header[i].substring(4)) - 1;
				result.units[index].name = fixUnitName(row[i]);
			}
			else if (header[i].indexOf('build') == 0) {
				var index = parseInt(header[i].substring(5)) - 1;
				result.units[index].build = getStringAsBuild(row[i]);
			}
		}

		return result;
	});

	return teams;
};

function loadTeams(
	callback: (teams: ClanBattleTeam[]) => void,
	requestURLs: string[]
) : void {
	++parallelLoadCount;

	var remainingRequestCount = requestURLs.length;

	var teams = <ClanBattleTeam[]> [];

	var joinCallback = function(newTeams: ClanBattleTeam[]) : void {
		Array.prototype.push.apply(teams, newTeams.filter(it => it.boss));

		if (--remainingRequestCount == 0) {
			if (--parallelLoadCount == 0) {
				document.body.style.removeProperty('opacity');
			}

			callback(teams);
			markUnavailableTeams();
		}
	}

	if (requestURLs.length > 0) {
		for (var i = 0; i < requestURLs.length; i++) {
			loadURL(requestURLs[i], parseCSVTeams, parseRawTeam, joinCallback);
		}
	}
	else {
		if (--parallelLoadCount == 0) {
			document.body.style.removeProperty('opacity');
		}

		generateAvailableTeams();
		markUnavailableTeams();
	}
};

function setTeamCount(prefix: string, count: number) : void {
	var countElement = <HTMLElement> document.getElementById(prefix + '-teams-count');
	var pluralElement = <HTMLElement> document.getElementById(prefix + '-teams-plural');

	if (!countElement || !countElement) {
		return;
	}

	countElement.innerText = '' + count;
	pluralElement.style.display = (count == 1) ? 'none' : 'inline';

}

function updateDefaultTeams(teams: ClanBattleTeam[]) : void {
	defaultTeams = teams;

	setTeamCount('default', defaultTeams.length);

	generateAvailableTeams();
};

function updateExtraTeams() : void {
	if (!extraTeamElement) {
		return;
	}

	var extraTeamValue = extraTeamElement.value;

	if (!extraTeamValue) {
		generateAvailableTeams();
		return;
	}

	if (extraTeamValue.indexOf('[') == 0) {
		extraTeams = JSON.parse(extraTeamValue);

		setTeamCount('extra', extraTeams.length);

		generateAvailableTeams();

		return;
	}

	document.body.style.opacity = '0.1';

	expandURLs(extraTeamValue.split('\n'), [], loadTeams.bind(null, updateExtraTeamsHelper));
};

function updateExtraTeamsHelper(teams?: ClanBattleTeam[]) : void {
	if (teams) {
		extraTeams = teams;
	}

	var totalExtraTeams = extraTeams.length + labAutoTeams.length + labManualTeams.length + pcrgTeams.length + demiurgeTeams.length;

	setTeamCount('extra', totalExtraTeams);

	generateAvailableTeams();
}

function expandURLs(
	lines: string[],
	urls: string[],
	callback: Function
) : void {

	var resolvedCount = 0;

	var expandURLsHelper = function(newURLs: string[]) : void {
		Array.prototype.push.apply(urls, newURLs);

		if (++resolvedCount == lines.length) {
			callback(urls);
		}
	}

	for (var i = 0; i < lines.length; i++) {
		var line = lines[i];

		if (line.indexOf('http') == 0) {
			expandGoogleSheetURLs(line, null, checkForExtraTeamsSheet, expandURLsHelper);
		}

		else if (line.indexOf('=') != -1) {
			var splitParam = line.split('=');

			var href = splitParam[0];
			var gids = splitParam[1].split(',');

			expandGoogleSheetURLs(href, gids, checkForExtraTeamsSheet, expandURLsHelper);
		}
		else if (line.indexOf(',') == -1) {
			expandGoogleSheetURLs(line, null, checkForExtraTeamsSheet, expandURLsHelper);
		}
		else {
			expandURLsHelper([line]);
		}
	}
}

function checkForExtraTeamsSheet(
	responseText: string,
	href: string,
	container: HTMLElement
) : boolean {

	var titleElement = container.querySelector('#doc-title .name');

	if (!titleElement) {
		return false;
	}

	var title = titleElement.textContent || '';

	if (title.indexOf('TheLab Sheet') != -1) {
		extractLabManualTeams(href, container);
		return true;
	}
	else if (title.indexOf('TheLab Auto') != -1) {
		extractLabAutoTeams(href, container);
		return true;
	}
	else if (title.indexOf('CB TLs') != -1 && responseText.indexOf('Demiurge') != -1) {
		extractDemiurgeTeams(href, container);
		return true;
	}

	return false;
}

function initializeTeams() : void {
	var defaultLines = Array.from(document.querySelectorAll('#data-source a')).map((anchor: HTMLAnchorElement) => anchor.href);

	if (defaultLines.length != 0) {
		document.body.style.opacity = '0.1';
	}

	expandURLs(defaultLines, defaultURLs, loadTeams.bind(null, updateDefaultTeams));

	if (document.location.search && extraTeamElement) {
		extraTeamElement.value = document.location.search.substring(1).split('&').join('\n');
		updateExtraTeams();
	}

	if (bookmarkElement) {
		bookmarkElement.value = document.location.href;
	}
}

function getStringAsBuild(str: string) : ClanBattleBuild {
	var build = <ClanBattleBuild> {};

	var pattern = /([^;]+)⭐/g;
	var matcher = pattern.exec(str);

	if (matcher) {
		build.star = matcher[1].trim();
		str = str.substring(0, matcher.index) + str.substring(matcher.index + matcher[0].length);
	}

	pattern = /R?([0-9]+-[0-9]+)/ig;
	matcher = pattern.exec(str);

	if (matcher) {
		build.rank = matcher[1];
		str = str.substring(0, matcher.index) + str.substring(matcher.index + matcher[0].length);
	}

	pattern = /UE\s*([^;]+)/ig;
	matcher = pattern.exec(str);

	if (matcher) {
		build.unique = matcher[1];
		str = str.substring(0, matcher.index) + str.substring(matcher.index + matcher[0].length);
	}

	pattern = /UB\s*([^\s;]+)/ig;
	matcher = pattern.exec(str);

	if (matcher) {
		build.ub = matcher[1];
		str = str.substring(0, matcher.index) + str.substring(matcher.index + matcher[0].length);
	}

	pattern = /S1\s*([^\s;]+)/ig;
	matcher = pattern.exec(str);

	if (matcher) {
		build.s1 = matcher[1];
		str = str.substring(0, matcher.index) + str.substring(matcher.index + matcher[0].length);
	}

	str = str.replace(/^(?:\s*;)+/g, '').trim();

	pattern = /^([0-9]+)[\s\*]*;/g;
	matcher = pattern.exec(str);

	if (matcher) {
		build.level = matcher[1];
		str = str.substring(0, matcher.index) + str.substring(matcher.index + matcher[0].length);
	}

	str = str.replace(/^(?:\s*;)+/g, '').trim();

	if (str) {
		build.extra = str;
	}

	return build;
}

function getBuildAsString(
	build: ClanBattleBuild,
	separator: string
) : string {

	var buildArray = [
		build.level || '',
		build.star ? (build.star.indexOf('⭐') != -1 ? build.star : (build.star + '⭐')) : '',
		build.rank ? (build.rank.charAt(0) == 'R' ? build.rank : ('R' + build.rank)) : '',
		build.unique ? (build.unique.indexOf('UE') == 0 ? build.unique : ('UE ' + build.unique)) : '', 
		build.ub ? 'UB ' + build.ub : '',
		build.s1 ? 'S1 ' + build.s1 : '',
		build.extra || ''
	].filter(it => it);

	return buildArray.length ? buildArray.join(separator) : 'no data';
}

function getTeamAsCSVRow(team: ClanBattleTeam) : string {
	var baseData = [team.boss, team.region, team.timing, team.timeline, team.damage];
	var unitData = team['units'].map(unit => unit['name'] + '\t' + getBuildAsString(unit['build'], '; '));
	return baseData.concat(unitData).concat([team.notes || '']).join('\t');
}
