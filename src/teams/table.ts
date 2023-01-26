function addUnit(text: string | null) : void {
	if (!text) {
		return;
	}

	var unitContainer = document.getElementById('units-available');

	if (!unitContainer) {
		return;
	}

	var container = document.createElement('div');
	container.classList.add('checkbox');

	var input = document.createElement('input');

	input.setAttribute('id', 'unit' + unitIds[text]);
	input.setAttribute('type', 'checkbox');
	input.value = text;
	input.onchange = encodeAvailableUnits;

	if (hasUnitAvailable(availableUnits, text)) {
		input.checked = true;
	}

	container.appendChild(input);

	var label = document.createElement('label');

	label.setAttribute('for', 'unit' + unitIds[text]);
	label.textContent = text;

	container.appendChild(label);
	unitContainer.appendChild(container);
};

function addUnits(teams: ClanBattleTeam[]) {
	var unitNames = new Set<string>();

	for (var i = 0; i < teams.length; i++) {
		for (var j = 0; j < teams[i].units.length; j++) {
			unitNames.add(teams[i].units[j].name);
		}
	}

	Array.from(unitNames).sort().forEach(addUnit);
}

function getTeamUnitCell(unit: ClanBattleUnit) {
	var cell = document.createElement('td');
	cell.classList.add('unit-info');

	if (!unit.name) {
		return cell;
	}

	if (!unitIds[unit.name]) {
		console.warn('unknown unit name:', unit.name);
	}

	var img = document.createElement('img');

	img.setAttribute('title', unit.name);
	img.setAttribute('data-unit-name', unit.name);

	if (unitIds[unit.name]) {
		img.setAttribute('src', getUnitIcon(unitIds[unit.name], typeof hasSixStar !== 'undefined' && hasSixStar.has(unitNames[unitIds[unit.name]]) ? 6 : 3));

		img.setAttribute('data-unit-alt-name', altNames[unitIds[unit.name]])
	}

	cell.appendChild(img);

	if (unit.build.level) {
		img.setAttribute('data-level', unit.build.level);
	}

	if (unit.build.star) {
		img.setAttribute('data-star', unit.build.star);
	}

	if (unit.build.rank) {
		img.setAttribute('data-rank', unit.build.rank);
	}

	var buildElement = document.createElement('div');
	buildElement.classList.add('unit-build');
	buildElement.innerHTML = getBuildAsString(unit.build, '<br/>');

	cell.appendChild(buildElement);

	return cell;
};

function getNotesHTML(html: string) : string {
	if (html.indexOf('<') != -1) {
		return html;
	}

	html = html.replace(/</g, 'lt;');
	html = html.replace(/(https:\/\/[\S]+)/g, '<a href="\$1">\$1</a>');
	html = html.replace(/\n/g, '<br/>');

	return html;
}

function getTimelineTimingElements(
	boss: string,
	timeline: string,
	timing: string,
	notes: string | undefined
) : Node[] {

	var timelineElement = document.createTextNode(timeline);

	var timingElement = document.createElement('a');
	timingElement.textContent = timing;

	var urlPos = timeline.indexOf('https://');

	if (urlPos != -1) {
		var videoHREF = timeline.substring(urlPos).trim();

		var timeline = timeline.substring(0, urlPos).trim();

		if (!timeline) {
			if (videoHREF.indexOf('bilibili.com') != -1) {
				var playlist = videoHREF.substring(videoHREF.lastIndexOf('/') + 1, videoHREF.lastIndexOf('?'));
				var videoId = videoHREF.substring(videoHREF.lastIndexOf('=') + 1);

				timeline = playlist + ' ' + videoId;
			}
			else {
				timeline = '(none)';
			}
		}

		timelineElement = document.createTextNode(timeline);

		timingElement.setAttribute('target', '_blank');
		timingElement.href = videoHREF;

		if (videoHREF.indexOf('docs.qq.com') != -1) {
			timingElement.setAttribute('rel', 'noreferrer');
		}
	}
	else if (timeline.indexOf('\n') != -1) {
		timelineElement = document.createTextNode('N/A');

		timingElement.setAttribute('target', '_blank');

		timingElement.onclick = function() {
			Swal.fire({
				title: boss + ' Timeline',
				html: timeline.replace(/\n/g, '<br>')
			});

			return false;
		};
	}
	else if (notes) {
		timingElement.setAttribute('target', '_blank');

		timingElement.onclick = function() {
			Swal.fire({
				title: timeline + ' Notes',
				html: getNotesHTML(notes)
			});

			return false;
		};
	}
	else {
		return [timelineElement, document.createTextNode(timing)];
	}

	return [timelineElement, timingElement];
}

function addAvailableTeam(team: ClanBattleTeam) : void {
	var row = document.createElement('tr');

	row.classList.add('filtered-out');

	var damage = getDamage(team.damage);

	row.setAttribute('data-boss', team.boss);
	row.setAttribute('data-damage', team.damage ? damage.toFixed(2) : '');
	row.setAttribute('data-score', team.damage ? (getMultiplier(team.boss) * damage).toFixed(2) : '');
	row.setAttribute('data-region', team.region);
	row.setAttribute('data-timeline', team.timeline);
	row.setAttribute('data-timing', team.timing);

	var membersKey = team.units.map(it => unitIds[it.name]).join('');

	row.setAttribute('data-members', membersKey);

	var button = document.createElement('button');
	button.textContent = 'choose';

	button.onclick = function() {
		var clonedRow = <HTMLTableRowElement> row.cloneNode(true);

		var links = row.querySelectorAll('a');
		var clonedLinks = clonedRow.querySelectorAll('a');

		for (var i = 0; i < links.length; i++) {
			if (!links[i].href) {
				clonedLinks[i].onclick = HTMLAnchorElement.prototype.click.bind(links[i]);
			}
		}

		var clonedButton = <HTMLButtonElement> clonedRow.querySelector('button');
		clonedButton.textContent = 'remove';
		clonedButton.onclick = function() {
			selectedBody.removeChild(clonedRow);
			fireTeamUpdateListeners();
		}

		selectedBody.appendChild(clonedRow);
		fireTeamUpdateListeners();
	}

	var cell = document.createElement('td');
	cell.appendChild(button);
	row.appendChild(cell)

	row.appendChild(createCell(false, team.boss, 'boss'));

	var cell = createCell(false, team.damage ? (damage.toFixed(2) + 'm') : '', 'damage');
	cell.setAttribute('data-value', '' + damage);
	row.appendChild(cell);

	row.appendChild(createCell(false, team.region, 'region'));

	var elements = getTimelineTimingElements(team.boss, team.timeline, team.timing, team.notes);

	cell = document.createElement('td');
	cell.classList.add('timeline');
	cell.appendChild(elements[0]);
	row.appendChild(cell);


	cell = document.createElement('td');
	cell.classList.add('timing');
	cell.appendChild(elements[1]);
	row.appendChild(cell);

	_.sortBy(team.units, it => {
		var unitId = unitIds[it.name] || '0';
		var position = positions[unitId] || 0;
		return (0 - position) * 100000 - parseInt(unitId);
	}).forEach((unit) => row.appendChild(getTeamUnitCell(unit)));

	var altBossesCell = createCell(false, '', 'alt-bosses');

	var altBossesLink = document.createElement('a');

	altBossesLink.onclick = function() {
		var teamFilterElement = <HTMLInputElement> document.getElementById('team-filter');
		teamFilterElement.value = membersKey;
		filterAvailableTeams();
	}

	altBossesCell.appendChild(altBossesLink);
	row.appendChild(altBossesCell);
	availableBody.appendChild(row);
};

function generateAvailableTeams() {
	var availableUnitsElement = document.getElementById('units-available');

	if (availableUnitsElement) {
		availableUnitsElement.innerHTML = '';
	}

	selectedContainer.setAttribute('data-sortable-initialized', 'false');
	selectedHeader.innerHTML = selectedHeader.innerHTML;
	selectedBody.innerHTML = '';

	availableContainer.setAttribute('data-sortable-initialized', 'false');
	availableHeader.innerHTML = availableHeader.innerHTML;
	availableBody.innerHTML = '';

	var allTeams = defaultTeams.concat(extraTeams).concat(labAutoTeams).concat(labManualTeams).concat(pcrgTeams).concat(demiurgeTeams);

	addUnits(allTeams);

	var regions = new Set(allTeams.map(it => it.region));

	document.querySelectorAll('input[name="regions-available"][type="checkbox"]').forEach((it: HTMLInputElement) => {
		it.disabled = !regions.has(it.value);
		var labelElement = <HTMLLabelElement> document.querySelector('label[for="' + it.getAttribute('id') + '"]');
		labelElement.style.opacity = it.disabled ? '0.4' : '1.0';
	});

	var timings = new Set(allTeams.map(it => it.timing));

	document.querySelectorAll('input[name="timings-available"][type="checkbox"]').forEach((it: HTMLInputElement) => {
		it.disabled = !timings.has(it.value);
		var labelElement = <HTMLLabelElement> document.querySelector('label[for="' + it.getAttribute('id') + '"]');
		labelElement.style.opacity = it.disabled ? '0.4' : '1.0';
	});

	allTeams.forEach(addAvailableTeam);
	filterAvailableTeams();

	Sortable.initTable(selectedContainer);
	Sortable.initTable(availableContainer);
};