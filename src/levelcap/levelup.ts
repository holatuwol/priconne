var levelUpExp = [6,8,8,16,16,16,24,48,56,56,64,76,82,82,82,82,82,100,110,138,138,142,146,151,155,160,165,170,174,181,185,191,197,202,209,230,252,278,306,342,383,430,481,558,647,750,871,1010,1172,1359,1576];

for (var i = 52; i < 64; i++) {
	levelUpExp.push(1770);
}

for (var i = 64; i < 75; i++) {
	levelUpExp.push(2655);
}

for (var i = 75; i < 100; i++) {
	levelUpExp.push(3540);
}

function getLevelAndExp(exp: number) : number[] {
	var level = 1;

	for (var i = 0; i < levelUpExp.length && exp >= levelUpExp[i]; i++)  {
		exp -= levelUpExp[i];
		level++;
	}

	if (level <= levelUpExp.length) {
		return [level, exp, levelUpExp[level-1]];
	}
	else {
		level += Math.floor(exp / 4425);
		exp = exp % 4425;

		return [level, exp, 4425];
	}
}

var levelUpStamina = [20,21,21,22,22,23,23,24,24,25,25,26,26,27,28,30,35,40,45,50,55,60,70,80,85];

function getNewLevelStamina(
	oldLevel: number,
	newLevel: number
) : number {

	var level = oldLevel;
	var newLevelStamina = 0;

	while ((level < newLevel) && (level < levelUpStamina.length)) {
		newLevelStamina += levelUpStamina[level];
		level++;
	}

	while (level < newLevel) {
		newLevelStamina += (level + 59);
		level++;
	}

	return newLevelStamina;
}

function getTotalExp(
	level: number,
	overflow: number
) : number {

	var levelUps = level - 1;
	var exp = 0;

	for (var i = 0; (i < levelUpExp.length) && (i < levelUps); i++) {
		exp += levelUpExp[i];
	}

	exp += Math.max(0, (levelUps - levelUpExp.length)) * 4425;

	var expToLevelUp = i < levelUpExp.length ? levelUpExp[levelUps] : 4425;

	exp += Math.max(0, ((overflow % expToLevelUp) + expToLevelUp) % expToLevelUp);

	return exp;
}