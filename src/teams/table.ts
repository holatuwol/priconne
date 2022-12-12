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

	if (!unitIds[unit.name]) {
		console.log('unknown unit name:', unit.name);
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
			markUnavailableTeams();
			updateCountElement();
		}

		selectedBody.appendChild(clonedRow);
		markUnavailableTeams();
		updateCountElement();
	}

	var cell = document.createElement('td');
	cell.appendChild(button);
	row.appendChild(cell)

	row.appendChild(createCell(false, team.boss, 'boss'));

	var damage = getDamage(team.damage);

	var damageCell = createCell(false, team.damage ? (damage.toFixed(2) + 'm') : '', 'damage');
	damageCell.setAttribute('data-value', '' + damage);

	row.appendChild(damageCell);

	row.appendChild(createCell(false, team.region, 'region'));

	var urlPos = team.timeline.indexOf('https://');

	if (urlPos != -1) {
		var videoHREF = team.timeline.substring(urlPos).trim();

		var timeline = team.timeline.substring(0, urlPos).trim();

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

		row.appendChild(createCell(false, timeline, 'timeline'));

		var timingLink = document.createElement('a');
		timingLink.textContent = team.timing;
		timingLink.setAttribute('target', '_blank');
		timingLink.href = videoHREF;

		if (videoHREF.indexOf('docs.qq.com') != -1) {
			timingLink.setAttribute('rel', 'noreferrer');
		}

		row.appendChild(createCell(false, timingLink, 'timing'));
	}
	else if (team.timeline && team.timeline.indexOf('\n') != -1) {
		row.appendChild(createCell(false, 'N/A', 'timeline'));

		var timingLink = document.createElement('a');
		timingLink.textContent = team.timing;
		timingLink.setAttribute('target', '_blank');

		timingLink.onclick = function() {
			Swal.fire({
				title: team.boss + ' Timeline',
				html: team.timeline.replace(/\n/g, '<br>')
			});

			return false;
		};

		row.appendChild(createCell(false, timingLink, 'timing'));
	}
	else if (team.notes) {
		row.appendChild(createCell(false, team.timeline, 'timeline'));

		var timingLink = document.createElement('a');
		timingLink.textContent = team.timing;
		timingLink.setAttribute('target', '_blank');

		timingLink.onclick = function() {
			Swal.fire({
				title: team.timeline + ' Notes',
				html: team.notes
			});

			return false;
		};

		row.appendChild(createCell(false, timingLink, 'timing'));
	}
	else {
		row.appendChild(createCell(false, team.timeline, 'timeline'));
		row.appendChild(createCell(false, team.timing, 'timing'));
	}

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