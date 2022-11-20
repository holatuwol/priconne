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

	var estertionPath = 'unit/' + unitId + (unitStars ? ('' + unitStars + '1') : '') + '.webp';

	if (document.location.host.indexOf('localhost') != -1) {
		return estertionPath;
	}

	// return estertionPath;
	// return 'https://s3-us-west-2.amazonaws.com/holatuwol/priconne/' + estertionPath;
	// return '//redive.estertion.win/icon/' + estertionPath;
	return '//pricalc.b-cdn.net/jp/unit/extract/latest/icon_' + estertionPath.replace(/\//, '_').replace(/\.webp$/, '.png');
}

function fixUnitName(unitName: string) : string {
	unitName = unitName.replace(/\. +/g, '.').trim();

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

	if (name.charAt(1) == '.') {
		name = name.charAt(0) + '.' + name.charAt(2).toUpperCase() + name.substring(3);
	}
	else if (name.charAt(2) == '.') {
		name = name.substring(0, 2).toUpperCase + '.' + name.charAt(3).toUpperCase() + name.substring(4);
	}
	else {
		name = name.charAt(0) + '.' + name.charAt(1).toUpperCase() + name.substring(2);
	}

	if (name in unitIds) {
		return unitNames[unitIds[name]];
	}

	if (unitName.indexOf(' ') != -1) {
		return fixUnitName(unitName.substring(0, unitName.indexOf(' ')));
	}

	return name;
}