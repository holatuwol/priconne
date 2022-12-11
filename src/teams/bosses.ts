function getMultiplier(boss: string) : number {
	var bossElement = document.getElementById('boss-' + boss);

	return (bossElement && parseFloat(bossElement.getAttribute('data-multiplier') || '0.0')) || 0.0;
};

function updateStageBossLink(stage : Element | string) : void {
	var container = stage instanceof Element ? stage.closest('span[data-boss-prefix]') : document.querySelector('#bosses-stage-' + stage);

	if (!container) {
		return;
	}

	var enabledCheckboxes = Array.from(container.querySelectorAll('input')).filter(it => !it.disabled);
	var checkedCheckboxes = enabledCheckboxes.filter(it => it.checked);

	var link = <HTMLAnchorElement> container.querySelector('a');

	if (enabledCheckboxes.length == checkedCheckboxes.length) {
		link.href = 'javascript:clearAllBosses(' + stage + ');';
		link.textContent = 'clear all';
	}
	else {
		link.href = 'javascript:selectAllBosses(' + stage + ');';
		link.textContent = 'select all';
	}

	filterAvailableTeams();
}

function clearAllBosses(stage : Element | string) : void {
	var container = <HTMLElement> document.querySelector('#bosses-stage-' + stage);
	var checkboxes = Array.from(container.querySelectorAll('input'));

	checkboxes.filter(it => !it.disabled && it.checked).forEach(it => it.checked = false);

	updateStageBossLink(stage);
}

function selectAllBosses(stage : Element | string) : void {
	var container = <HTMLElement> document.querySelector('#bosses-stage-' + stage);
	var checkboxes = Array.from(container.querySelectorAll('input'));

	checkboxes.filter(it => !it.disabled && !it.checked).forEach(it => it.checked = true);

	updateStageBossLink(stage);
};

function addAvailableBosses() : void {
	var bossesElement = <HTMLElement> document.getElementById('bosses-available');

	var cbBossStats = bossStats[currentCBId];

	var bossIds = cbBossStats.bossIds;

	var prefixes = Object.keys(cbBossStats.multipliers).sort();

	for (var i = 0; i < prefixes.length; i++) {
		var prefix = prefixes[i];
		var multipliers = cbBossStats.multipliers[prefix];

		var x = cbBossStats.lapTiers.indexOf(prefix) + 1;
		var y = cbBossStats.lapTiers.lastIndexOf(prefix) + 1;

		var container = document.createElement('span');

		container.setAttribute('id', 'bosses-stage-' + (i+1));
		container.setAttribute('data-boss-prefix', prefix);

		var h4 = document.createElement('h4');
		h4.appendChild(document.createTextNode('Laps ' + x + (x == y ? '+' : ('-' + y)) + ' ('));

		var selectAllLink = document.createElement('a');
		selectAllLink.textContent = 'select all';
		selectAllLink.href = 'javascript:selectAllBosses(' + (i+1) + ');';
		h4.appendChild(selectAllLink);

		h4.appendChild(document.createTextNode(')'));

		container.appendChild(h4);

		for (var j = 1; j <= bossIds.length; j++) {
			var holder = document.createElement('span');
			holder.classList.add('checkbox-inline');

			var enabled = j <= multipliers.length;

			var bossName = prefix + j;

			var input = document.createElement('input');
			input.setAttribute('name', 'bosses-available');
			input.setAttribute('type', 'checkbox');
			input.setAttribute('value', bossName);

			input.onchange = updateStageBossLink.bind(null, i + 1);

			if (!enabled) {
				input.disabled = true;
			}

			input.setAttribute('id', 'boss-' + bossName);
			input.setAttribute('data-multiplier', '' + (multipliers[j-1] || 0.0));

			var label = document.createElement('label');
			label.setAttribute('for', 'boss-' + bossName);
			label.innerText = bossName;

			var image = document.createElement('img');
			image.setAttribute('src', getUnitIcon('' + bossIds[j-1]));

			label.appendChild(image);

			if (!enabled) {
				label.style.opacity = '0.4';
			}

			holder.appendChild(input);
			holder.appendChild(label);

			container.appendChild(holder);
		}

		bossesElement.appendChild(container);
	}
}