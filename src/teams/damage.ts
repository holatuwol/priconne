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

function isMaxDamage(it: string) : boolean {
	return it.indexOf('OTK') == 0 || it.indexOf(' OTK') != -1 || it.indexOf('OHKO') == 0 || it.indexOf(' OHKO') != -1;
}

function getMaxDamage(boss: string) : number {
	return bossStats[currentCBId]['bossHP'][boss.charAt(0)][parseInt(boss.charAt(1)) - 1] / 1000000;
}

function getDamageMatcher(description: string): RegExpExecArray | null {
	var damageMatcher = otkRE.exec(description);

	if (!damageMatcher) {
		damageMatcher = averageRE.exec(description);
	}

	if (!damageMatcher) {
		damageMatcher = simpleRE.exec(description);
	}

	return damageMatcher;
}