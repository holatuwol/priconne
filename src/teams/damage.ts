function getDamage(value : string | number | null) : number {
	if (!value) {
		return 0.0;
	}

	if (typeof(value) != 'string') {
		return value;
	}

	value = value.toLowerCase();

	if (value.indexOf('m') == (value.length - 1)) {
		return parseFloat(value.substring(0, value.length - 1));
	}

	if (value.indexOf('w') == (value.length - 1)) {
		return parseFloat(value.substring(0, value.length - 1)) / 100;
	}

	if (value.indexOf('k') == (value.length - 1)) {
		return parseFloat(value.substring(0, value.length - 1)) / 1000;
	}

	if ((value.length > 3) && /^[0-9,]+$/.exec(value)) {
		return parseFloat(value.replace(/,/g, '')) / 1000000.0;
	}

	return parseFloat(value);
}

function getMaxDamage(boss: string) : number {
	return boss == 'A1' ? 6 : boss == 'A2' ? 8 : boss == 'A3' ? 10 : boss == 'A4' ? 12 : boss == 'A5' ? 15 :
		boss == 'B1' ? 6 : boss == 'B2' ? 8 : boss == 'B3' ? 10 : boss == 'B4' ? 12 : boss == 'B5' ? 15 :
		boss == 'C1' ? 7 : boss == 'C2' ? 9 : boss == 'C3' ? 12 : boss == 'C4' ? 14 : boss == 'C5' ? 17 :
		0;
}

function getDamageMatcher(description: string): RegExpExecArray | null {
	var damageMatcher = averageRE.exec(description);

	if (!damageMatcher) {
		damageMatcher = simpleRE.exec(description);
	}

	return damageMatcher;
}