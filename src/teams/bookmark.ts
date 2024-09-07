function storeUnit(
	acc: Record<string, ClanBattleBuild>,
	next: string
) : Record<string, ClanBattleBuild> {

	acc[next] = {};

	return acc;
}

function decodeUnit(
	acc: Record<string, ClanBattleBuild>,
	next: string,
	index: number
) : Record<string, ClanBattleBuild> {

	if (next == '1') {
		var unitId = (1000+index).toString();
		var unitName = unitNames[unitId];

		acc[unitName] = {};
	}

	return acc;
}

function decodeAvailableUnits() {
	var hash = document.location.hash;

	if ((hash == '') || (hash == '#')) {
		availableUnits = Array.from(Object.keys(unitIds)).reduce(
			storeUnit,
			<Record<string, ClanBattleBuild>> {});
	}
	else {
		var encodedUnitList = hash.substring(1);

		if (encodedUnitList.charAt(0) == 'z') {
			availableUnits = Array.from(Object.keys(unitIds)).reduce(
				storeUnit,
				<Record<string, ClanBattleBuild>> {});

			var missingUnits = BigInt('0x' + encodedUnitList.substring(1)).toString(2).split('').reverse().reduce(
				decodeUnit,
				<Record<string, ClanBattleBuild>> {});

			for (var key in missingUnits) {
				delete availableUnits[key];
			}
		}
		else {
			availableUnits = BigInt('0x' + encodedUnitList).toString(2).split('').reverse().reduce(
				decodeUnit,
				<Record<string, ClanBattleBuild>> {});
		}
	}
};

function encodeUnit(
	acc: number[],
	next: string
) : number[] {

	acc[parseInt(next) - 1000] = 1;

	return acc;
}

function encodeAvailableUnitsHelper() {
	if (!bookmarkElement) {
		return;
	}

	availableUnits = Array.from(getCheckboxValues('#units-available input[type="checkbox"]:checked')).reduce(
		storeUnit,
		<Record<string, ClanBattleBuild>> {});

	var missingUnitIds = Array.from(Object.keys(unitNames)).filter(it => !(unitNames[it] in availableUnits));

	var maxUnitId = Math.max.apply(null, Array.from(Object.values(unitIds)).map(it => parseInt(it)));
	var bits = <number[]> new Array(maxUnitId + 1 - 1000).fill(0);
	bits = missingUnitIds.reduce(encodeUnit, bits);

	var bitString = '0b' + bits.reverse().join('');

	var hash = '#z' + BigInt(bitString).toString(16);

	var bookmark = location.protocol + '//' + location.host + location.pathname + location.search + hash;

	bookmarkElement.value = bookmark;

	fireTeamUpdateListeners();
}

var encodeAvailableUnits = _.debounce(encodeAvailableUnitsHelper, 300);