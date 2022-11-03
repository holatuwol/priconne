function prepareSaveData(units: BoxUnit[]) : Record<string, BoxUnit> {
	var saveData = units.filter(unit => unit.level).map(unit => {
		var result = <BoxUnit> {};

		result['unitId'] = unit.unitId || parseInt(unitIds[unit.name]);
		result['level'] = unit.level;
		result['name'] = unit.name;
		result['love'] = (unit.stars > 2) ? 8 : 4;
		result['rank'] = unit.rank;
		result['rarity'] = unit.stars;
		result['uniqueEqLv'] = unit.uniqueEqLv;

		result['equipLevel'] = [
			unit['equipLevel.TL'],
			unit['equipLevel.TR'],
			unit['equipLevel.ML'],
			unit['equipLevel.MR'],
			unit['equipLevel.BL'],
			unit['equipLevel.BR']
		];

		result['skillLevel'] = [
			unit['skillLevel.UB'],
			unit['skillLevel.1'],
			unit['skillLevel.2'],
			unit['skillLevel.EX']
		]

	    return result;
	}).reduce((acc, unit) => {
		var key = '' + unit['unitId'];
		acc[key] = unit;
		return acc;
	}, <Record<string, BoxUnit>> {});

	return saveData;
}