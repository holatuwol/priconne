var cbIndexElement = <HTMLElement> document.getElementById('cb-index');
var timestampElement = <HTMLElement> document.getElementById('cb-timestamp');
var cbSelectorElement = <HTMLElement> document.getElementById('cb-selector')

var table = <HTMLTableElement> document.querySelector('table');
var thead = <HTMLTableSectionElement> table.tHead;
var tbody = <HTMLTableSectionElement> table.tBodies[0];

function getCurrentBoss(score: number) : LapBoss {
	var cbId = cbIndexElement.getAttribute('data-cb-id') || '0';
	var anchor = <HTMLAnchorElement> document.querySelector('a[data-cb-id="' + cbId + '"]');

	var bossIds = splitStringAttribute(anchor, 'data-boss-ids');
	var dataTiers = splitIntAttribute(anchor, 'data-tiers');

	var laps = <number[][]> [];

	for (var i = 0; i < dataTiers.length; i++) {
		var multipliers = splitFloatAttribute(anchor, 'data-multipliers-' + (i+1));
		var bossHP = splitIntAttribute(anchor, 'data-boss-hp-' + (i+1));

		if (bossHP.length == 0) {
			bossHP = splitIntAttribute(anchor, 'data-boss-hp');
		}

		var tierScores = bossHP.map((it, i) => it * multipliers[i]);

		for (var j = 0; j < dataTiers[i]; j++) {
			laps.push(tierScores);
		}
	}

	var multipliers = splitFloatAttribute(anchor, 'data-multipliers-' + (dataTiers.length + 1));
	var bossHP = splitIntAttribute(anchor, 'data-boss-hp-' + (dataTiers.length+1));

	if (bossHP.length == 0) {
		bossHP = splitIntAttribute(anchor, 'data-boss-hp');
	}

	var tierScores = bossHP.map((it, i) => it * multipliers[i]);
	laps.push(tierScores);

	return getLapBoss(laps, bossHP, score);
}

function getLapBoss(
	laps: number[][],
	bossHP: number[],
	score: number
) : LapBoss {

	for (var i = 0; i < laps.length; i++) {
		var bosses = laps[i];

		for (var j = 0; j < bosses.length; j++) {
			if (score < bosses[j]) {
				return {
					'lap': i + 1,
					'index': j + 1,
					'hp': (bosses[j] - score) / bosses[j] * bossHP[j]
				}
			}

			score -= bosses[j];
		}
	}

	var bosses = laps[laps.length - 1];

	for (var i = laps.length; ; i++) {
		for (var j = 0; j < bosses.length; j++) {
			if (score < bosses[j]) {
				return {
					'lap': i + 1,
					'index': j + 1,
					'hp': (bosses[j] - score) / bosses[j] * bossHP[j]
				}
			}

			score -= bosses[j];
		}
	}
}

function formatBossHP(hp: number) : string {
	return (hp >= 1000000.0) ? ((hp / 1000000.0).toFixed(2) + 'M') :
		(hp >= 100000.0) ? ((hp / 1000.0).toFixed(0) + 'K') :
		(hp >= 10000.0) ? ((hp / 1000.0).toFixed(1) + 'K') :
		(hp >= 1000.0) ? ((hp / 1000.0).toFixed(2) + 'K') : '' + hp;
}