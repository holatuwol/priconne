var positions = unitData.reduce((acc, next) => {
	acc[next[0]] = parseInt(next[1]);
	return acc;
}, <Record<string, number>> {});

var unitNames = unitData.reduce((acc, next) => {
	acc[next[0]] = next[2];
	return acc;
}, <Record<string, string>> {});

var altNames = unitData.reduce((acc, next) => {
	acc[next[0]] = (next.length <= 4) ? next[2] : next[4];
	return acc;
}, <Record<string, string>> {});

var unitIds = unitData.reduce((acc, next) => {
	for (var i = 2; i < next.length; i++) {
		acc[next[i]] = next[0];
		acc[next[i].toLowerCase()] = next[0];
		acc[next[i].toLowerCase().replace('.', '')] = next[0];
	}
	return acc;
}, <Record<string, string>> {});

function getUnitIcon(
	unitId: string,
	unitStars?: number
) : string {

	var estertionPath = 'unit/' + unitId + (unitStars ? ('' + unitStars + '1') : '');

	if (document.location.host.indexOf('localhost') != -1) {
		return estertionPath + '.webp';
	}

	return estertionPath + '.png';
	// return '//redive.estertion.win/icon/' + estertionPath + '.webp';
	// return '//pricalc.b-cdn.net/jp/unit/extract/latest/icon_' + estertionPath.replace(/\//, '_') + '.png';
}

function fixUnitName(unitName: string) : string {
	unitName = unitName.replace(/[0-9]/g, '').replace(/\. +/g, '.').trim();

	if (!unitName) {
		return unitName;
	}

	if (unitName in unitIds) {
		return unitNames[unitIds[unitName]];
	}

	if (unitName.toLowerCase() in unitIds) {
		return unitNames[unitIds[unitName.toLowerCase()]];
	}

	var name = unitName;

	var ch = name.charAt(0);

	if (ch >= 'a' && ch <= 'z') {
		name = ch.toUpperCase() + name.substring(1);
	}

	if (name in unitIds) {
		return unitNames[unitIds[name]];
	}

	var pos = name.indexOf('.');

	if (pos != -1) {
		var testName = name.substring(0, pos).toUpperCase() + '.' + name.charAt(pos + 1).toUpperCase() + name.substring(pos + 2);

		if (testName in unitIds) {
			return unitNames[unitIds[testName]];
		}
	}
	else {
		for (var i = 1; i < name.length && name.charAt(i-1) >= 'A' && name.charAt(i-1) <= 'Z'; i++) {
			var testName = name.substring(0, i) + '.' + name.charAt(i).toUpperCase() + name.substring(i + 1);

			if (testName in unitIds) {
				return unitNames[unitIds[testName]];
			}
		}
	}

	if (unitName.indexOf(' ') != -1) {
		return fixUnitName(unitName.substring(0, unitName.indexOf(' ')));
	}

	return name;
}