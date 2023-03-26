function getBossDamage(
	boss: string,
	damage: string
) : number {

	return (damage.indexOf('s') != -1 || damage.indexOf('초') != -1) ? getMaxDamage(boss) : getDamage(damage);
}

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

	if (value.indexOf('w') == (value.length - 1) || value.indexOf('만') == (value.length - 1)) {
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
	it = it.toLowerCase();

	return it.indexOf('otk') == 0 || it.indexOf(' otk') != -1 || it.indexOf('ohko') == 0 || it.indexOf(' ohko') != -1 ||
		it.indexOf('same ot') == 0 || it.indexOf('s ot') != -1 || it.charAt(it.length - 1) == 's';
}

function getMaxDamage(boss: string) : number {
	return bossStats[currentCBId]['bossHP'][boss.charAt(0)][parseInt(boss.charAt(1)) - 1] / 1000000;
}

function getDamageMatcher(description: string): RegExpExecArray | null {
	var damageMatcher = overtimeRE.exec(description);

	if (!damageMatcher) {
		damageMatcher = otkRE.exec(description);
	}

	if (!damageMatcher) {
		damageMatcher = averageRE.exec(description);
	}

	if (!damageMatcher) {
		damageMatcher = simpleRE.exec(description);
	}

	return damageMatcher;
}