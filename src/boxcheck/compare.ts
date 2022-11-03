function loadComparison(
	units1List: BoxUnit[] | null,
	units2List: BoxUnit[] | null,
	compareContainerId: string,
	missingContainerId: string
) : void {

	var compareContainer = <HTMLDivElement> document.getElementById(compareContainerId);
	var missingContainer = <HTMLDivElement> document.getElementById(missingContainerId);

	compareContainer.innerHTML = '';
	missingContainer.innerHTML = '';

	if (!units1List || !units2List) {
		return;
	}	

	var units1 = units1List.reduce((acc, next) => {
		acc[next.name] = next;
		return acc;
	}, <Record<string, BoxUnit>> {}); 

	var units2 = units2List.reduce((acc, next) => {
		acc[next.name] = next;
		return acc;
	}, <Record<string, BoxUnit>> {}); 

	for (var name in units1) {
		var unit1 = units1[name];
		var unit2 = units2[name] || {};

		var diffs = <string[]> [];

		for (key in unit1) {
			if (!(key in unit2)) {
				continue;
			}

			if (unit1[key] != unit2[key]) {
				diffs.push(key);
			}
		}

		if (diffs.length == 0) {
			continue;
		}

		if (unit2.level) {
			var renderedUnit = renderUnitFull(unit2);

			var differentRank = diffs.indexOf('rank') != -1;

			if (differentRank) {
				var equippedItemsElement = <HTMLElement> renderedUnit.querySelector('.equipped-items');
				equippedItemsElement.classList.add((unit2['rank'] > unit1['rank']) ? 'value-greater-than' : 'value-less-than');
			}

			for (var i = 0; i < diffs.length; i++) {
				var key = diffs[i];

				var keyContainer = renderedUnit.querySelector('span[data-key="' + key + '"]');

				if (!keyContainer) {
					continue;
				}

				if (differentRank && (key.indexOf('equipLevel') == 0)) {
					continue;
				}

				var value = (unit2[key] > unit1[key]) ? 'value-greater-than' : 'value-less-than';

				keyContainer.classList.add(value);
			}

			compareContainer.appendChild(renderedUnit);
		}
		else {
			var renderedUnit = renderUnitFull(unit1);

			renderedUnit.classList.add('unit-unavailable');

			missingContainer.appendChild(renderedUnit);
		}
	}
}