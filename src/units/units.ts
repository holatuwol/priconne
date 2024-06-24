var positions = unitData.reduce((acc, next) => {
	acc[next[0]] = parseInt(next[1]);
	return acc;
}, <Record<string, number>> {});

var enUnitNames = unitData.reduce((acc, next) => {
	acc[next[0]] = next[2];
	return acc;
}, <Record<string, string>> {});

var jaUnitNames = unitData.reduce((acc, next) => {
	acc[next[0]] = next[3];
	return acc;
}, <Record<string, string>> {});

var unitNames = Object.assign({}, enUnitNames);

var altNames = unitData.reduce((acc, next) => {
	acc[next[0]] = (next.length <= 4) ? next[2] : next[4];
	return acc;
}, <Record<string, string>> {});

function getEnUnitNames(name: string) : string[] {
	var names = [name, name.toLowerCase()];

	var pos = name.indexOf('(');

	if (pos != -1) {
		var invertedName = name.substring(pos + 1, name.length - 1) + " " + name.substring(0, pos - 1);

		names.push(invertedName);
		names.push(invertedName.toLowerCase());
	}

	pos = name.indexOf('.');

	if (pos != -1) {
		var noPeriodName = name.replace(/\./g, '');

		names.push(noPeriodName);
		names.push(noPeriodName.toLowerCase());
	}

	return names;
}

function getJaUnitNames(name: string) : string[] {
	var names = [name, wanakana.toHiragana(name)];

	var codePoints = Array.from(name);
	var pos = -1;

	for (var i = 0; i < codePoints.length; i++) {
		if (codePoints[i] =='（') {
			pos = i;
			break;
		}
	}

	if (pos != -1) {
		var invertedName = codePoints.slice(pos + 1, name.length - 1).join('') + codePoints.slice(0, pos).join('');

		names.push(invertedName);
		names.push(wanakana.toHiragana(invertedName));
	}

	return names;
}

var unitIdsList = unitData.reduce((acc, next) => {
	var names = [next[0]];

	names = names.concat(getEnUnitNames(next[2]));

	names = names.concat(getJaUnitNames(next[3]));

	for (var i = 4; i < next.length; i++) {
		names = names.concat(getEnUnitNames(next[i]));
	}

	acc.push(names);

	return acc;
}, <string[][]> []);

function getMatchingUnitIds(term: string) : string[] {
	if (!term) {
		return [];
	}

	if (wanakana.isJapanese(term)) {
		term = wanakana.toKatakana(term);
	}
	else {
		term = term.toLowerCase();
	}

	term = term.replace(/\./g, '');

	if (term in unitIds) {
		return [unitIds[term]];
	}

	var prefixMatches = unitIdsList.filter(it => {
		for (var i = 1; i < it.length; i++) {
			if (it[i].indexOf(term) == 0) {
				return true;
			}
		}

		return false;
	}).map(it => it[0]);

	if (prefixMatches.length > 0) {
		return prefixMatches;
	}

	var substringMatches = unitIdsList.filter(it => {
		for (var i = 1; i < it.length; i++) {
			if (it[i].indexOf(term) != -1) {
				return true;
			}
		}

		return false;
	}).map(it => it[0]);

	if (substringMatches.length > 0) {
		return substringMatches;
	}

	var re = new RegExp(term.replace(new RegExp('', 'gi'), '.*'));

	return unitIdsList.filter(it => {
		for (var i = 1; i < it.length; i++) {
			if (re.test(it[i])) {
				return true;
			}
		}

		return false;
	}).map(it => it[0]);
}

var unitIds = unitIdsList.reduce((acc, next) => {
	for (var i = 1; i < next.length; i++) {
		acc[next[i]] = next[0];
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
	var unitIds = getMatchingUnitIds(unitName.replace(/[0-9]\. /g, ''));

	if (unitIds.length == 1) {
		return enUnitNames[unitIds[0]];
	}

	return unitName;
}