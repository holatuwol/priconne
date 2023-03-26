function updateUnitNames(
	source: Record<string, string>,
	acc: Record<string, string>,
	next: string
) : Record<string, string> {

	acc[source[next]] = next;
	return acc;
}

var unitIds = <Record<string, string>> Array.from(Object.keys(unitNames)).reduce(updateUnitNames.bind(null, unitNames), <Record<string, string>> {});
unitIds = Array.from(Object.keys(altNames)).reduce(updateUnitNames.bind(null, altNames), unitIds);

Object.entries(aliases).reduce((acc, next) => {
	unitIds[next[0]] = unitIds[next[1]];

	return unitIds;
}, unitIds);

function getUnitIcon(
	unitId: string,
	unitStars?: number
) : string {

	var estertionPath = 'unit/' + unitId + (unitStars ? ('' + unitStars + '1') : '');

	if (document.location.host.indexOf('localhost') != -1) {
		return estertionPath + '.webp';
	}

	// return estertionPath + '.png';
	// return '//redive.estertion.win/icon/' + estertionPath + '.webp';
	return '//pricalc.b-cdn.net/jp/unit/extract/latest/icon_' + estertionPath.replace(/\//, '_') + '.png';
}

function fixUnitName(unitName: string) : string {
	unitName = unitName.replace(/[0-9]/g, '').replace(/\. +/g, '.').trim();

	if (!unitName) {
		return unitName;
	}

	if (unitName in unitIds) {
		return unitNames[unitIds[unitName]];
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