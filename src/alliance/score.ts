var cbIndexElement = <HTMLElement> document.getElementById('cb-index');
var timestampElement = <HTMLElement> document.getElementById('cb-timestamp');
var cbSelectorElement = <HTMLElement> document.getElementById('cb-selector')

var table = <HTMLTableElement> document.querySelector('table');
var thead = <HTMLTableSectionElement> table.tHead;
var tbody = <HTMLTableSectionElement> table.tBodies[0];

function getLapBoss(score: number) : LapBoss {
	var cbId = cbIndexElement.getAttribute('data-cb-id') || '0';

	var anchor = <HTMLAnchorElement> document.querySelector('a[data-cb-id="' + cbId + '"]');

	var bossIds = bossStats[cbId].bossIds;
	var lapTiers = bossStats[cbId].lapTiers;

	for (var i = 0; i < lapTiers.length; i++) {
		var tier = lapTiers[i];
		var multipliers = bossStats[cbId].multipliers[tier];
		var bossHP = bossStats[cbId].bossHP[tier];
		var tierScores = bossHP.map((it, i) => it * multipliers[i]);

		for (var j = 0; j < tierScores.length; j++) {
			if (score < tierScores[j]) {
				return {
					'lap': i + 1,
					'tier': tier,
					'index': j,
					'hp': (tierScores[j] - score) / tierScores[j] * bossHP[j]
				}
			}

			score -= tierScores[j];
		}
	}

	var tier = lapTiers[lapTiers.length - 1];
	var multipliers = bossStats[cbId].multipliers[tier];
	var bossHP = bossStats[cbId].bossHP[tier];
	var tierScores = bossHP.map((it, i) => it * multipliers[i]);

	for (var i = lapTiers.length; ; i++) {
		for (var j = 0; j < tierScores.length; j++) {
			if (score < tierScores[j]) {
				return {
					'lap': i + 1,
					'tier': tier,
					'index': j,
					'hp': (tierScores[j] - score) / tierScores[j] * bossHP[j]
				}
			}

			score -= tierScores[j];
		}
	}
}