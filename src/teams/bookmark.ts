function decodeUnit(
	acc: Set<string>,
	next: string,
	index: number
) : Set<string> {

	if (next == '1') {
		var unitId = (1000+index).toString();
		var unitName = unitNames[unitId];

		acc.add(unitName);
	}

	return acc;
}

function decodeAvailableUnits() {
	var hash = document.location.hash;

	if ((hash == '') || (hash == '#')) {
		availableUnits = new Set<string>(Object.keys(unitIds));
	}
	else {
		availableUnits = BigInt('0x' + hash.substring(1)).toString(2).split('').reverse().reduce(decodeUnit, new Set<string>());
	}

	document.querySelectorAll('#units-available input[type="checkbox"]').forEach((it: HTMLInputElement) => {
		it.checked = availableUnits.has(it.value);
	});
};

function encodeUnit(
	acc: number[],
	next: string
) : number[] {

	acc[parseInt(unitIds[next]) - 1000] = 1;
	return acc;
}

function encodeAvailableUnitsHelper() {
	availableUnits = getCheckboxValues('#units-available input[type="checkbox"]:checked');

	var maxUnitId = Math.max.apply(null, Array.from(Object.values(unitIds)).map(it => parseInt(it)));
	var bits = <number[]> new Array(maxUnitId + 1 - 1000).fill(0);
	bits = Array.from(availableUnits).reduce(encodeUnit, bits);

	var bitString = '0b' + bits.reverse().join('');

	var hash = '#' + BigInt(bitString).toString(16);

	var bookmark = location.protocol + '//' + location.host + location.pathname + location.search + hash;

	bookmarkElement.value = bookmark;

	markUnavailableTeams();
}

var encodeAvailableUnits = _.debounce(encodeAvailableUnitsHelper, 300);