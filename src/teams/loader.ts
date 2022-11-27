function parseRawTeam(text: string): ClanBattleTeam[] {
	var team = text.split(',');

	return [{
		boss: team[0],
		damage: getDamage(team[2]),
		region: 'global',
		timing: team[1],
		timeline: "extra team",
		units: team.slice(3).map(it => { return { "name": fixUnitName(it), "build": [] } })
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
			result.units[i] = {name: '', build:[]};
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
				result.units[index].build = row[i].split(/; */g);
			}
		}

		return result;
	});

	return teams;
};

function loadTeams(
	callback: (teams: ClanBattleTeam[]) => void,
	requestURLs: string[]
) {
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

	return false;
}

function initializeTeams() : void {
	var defaultLines = Array.from(document.querySelectorAll('#data-source a')).map((anchor: HTMLAnchorElement) => anchor.href);

	if (defaultLines.length != 0) {
		document.body.style.opacity = '0.1';
	}

	expandURLs(defaultLines, defaultURLs, loadTeams.bind(null, updateDefaultTeams));

	if (document.location.search) {
		extraTeamElement.value = document.location.search.substring(1).split('&').join('\n');
		updateExtraTeams();
	}

	bookmarkElement.value = document.location.href;
}

function getTeamAsCSVRow(team: ClanBattleTeam) : string {
	var baseData = [team.boss, team.region, team.timing, team.timeline, team.damage];
	var unitData = team['units'].map(unit => unit['name'] + '\t' + unit['build'].join('; '));
	return baseData.concat(unitData).concat([team.notes || '']).join('\t');
}
