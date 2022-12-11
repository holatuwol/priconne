// https://stackoverflow.com/a/15302448

function choose(
    n: number,
    k: number
) : number {

	if (k == 0) {
		return 1;
    }

    return (n * choose(n-1, k-1)) / k;
};

function getBestAllocation(
	borrowStrategy: string,
	visibleRows: HTMLTableRowElement[],
	visibleTeams: Record<string, number>[],
	visibleValues: number[],
	currentIndices: number[],
	nextIndex: number
) : number[] {

	var bestAllocation = currentIndices;
	var bestAllocationValue = 0;

	for (var j = 0; j < bestAllocation.length; j++) {
		bestAllocationValue += visibleValues[bestAllocation[j]];
	}

	if (currentIndices.length == 3) {
		return bestAllocation;
	}

	for (var i = nextIndex; i < visibleTeams.length; i++) {
		var nextIndices = currentIndices.concat([i]);
		var nextTeams = nextIndices.map(it => visibleTeams[it]);

		if (hasMemberConflict(borrowStrategy, nextTeams)) {
			continue;
		}

		var nextAllocation = null;

		if (currentIndices.length < 2) {
			nextAllocation = getBestAllocation(borrowStrategy, visibleRows, visibleTeams, visibleValues, nextIndices, i + 1);
		}
		else {
			nextAllocation = currentIndices.concat([i]);
		}

		var nextAllocationValue = 0;

		for (var j = 0; j < nextAllocation.length; j++) {
			nextAllocationValue += visibleValues[nextAllocation[j]];
		}

		if (nextAllocationValue > bestAllocationValue) {
			bestAllocation = nextAllocation;
			bestAllocationValue = nextAllocationValue;
		}
	}

	return bestAllocation;
};

function getBestTeamValue(
	valueAttribute: string,
	acc: Record<string, ClanBattleTeamValue>,
	row: HTMLTableRowElement
) : Record<string, ClanBattleTeamValue> {

	var membersKey = row.getAttribute('data-members');

	if (!membersKey) {
		return acc;
	}

	var value = parseFloat(row.getAttribute(valueAttribute) || '0.0');

	if (!(membersKey in acc) || (value > acc[membersKey].value)) {
		acc[membersKey] = {
			'row': row,
			'value': value
		};
	}

	return acc;
}

function allocateVisibleTeams(valueAttribute: string) : void {
	var currentRows = Array.from(selectedBody.rows);

	if (currentRows.length == 3) {
		return;
	}

	var availableRows = Array.from(availableBody.rows).filter(it => it.offsetWidth != 0 || it.offsetHeight != 0);

	var bestTeamValue = availableRows.reduce(getBestTeamValue.bind(null, valueAttribute), <Record<string, ClanBattleTeamValue>> {})

	availableRows = availableRows.filter(row => row == bestTeamValue[<string> row.getAttribute('data-members')]['row']);

	var visibleRows = currentRows.concat(availableRows);
	var visibleTeams = visibleRows.map(getMembers);
	var visibleValues = visibleRows.map(it => parseFloat(it.getAttribute(valueAttribute) || '0.0'));

	var currentIndices = new Array(currentRows.length);

	for (var i = 0; i < currentIndices.length; i++) {
		currentIndices[i] = i;
	}

	var inProgressElement = <HTMLDivElement> document.getElementById('allocation-in-progress');
	inProgressElement.textContent = 'Checking ' + choose(availableRows.length, 3 - currentRows.length) + ' team combinations...';

	var borrowStrategyElement = <HTMLInputElement> document.querySelector('input[name="borrow-strategy"]:checked');
	var borrowStrategy = borrowStrategyElement.value;

	setTimeout(function() {
		var bestAllocation = getBestAllocation(borrowStrategy, visibleRows, visibleTeams, visibleValues, currentIndices, currentIndices.length);

		bestAllocation.slice(currentRows.length).map(it => visibleRows[it]).map(it => it.querySelector('button')).filter(it => it).forEach((it: HTMLButtonElement) => it.click());

		inProgressElement.textContent = '';
	}, 500);
};