var refreshTemplate = (<HTMLTemplateElement> document.getElementById('daily-refresh')).content;
var levelUpTemplate = (<HTMLTemplateElement> document.getElementById('level-up')).content;
var missionsTemplate = (<HTMLTemplateElement> document.getElementById('daily-missions')).content;
var clanBattleTemplate = (<HTMLTemplateElement> document.getElementById('clan-battle')).content;

var beforeNewAreaTemplate = (<HTMLTemplateElement> document.getElementById('before-new-area')).content;
var afterNewAreaTemplate = (<HTMLTemplateElement> document.getElementById('after-new-area')).content;
var beforeAfterNewAreaTemplate = (<HTMLTemplateElement> document.getElementById('before-after-new-area')).content;

function updateExp(newCapExp: number) : number {
	var totalExp = parseInt(breakdownElement.getAttribute('data-exp') || '0');

	breakdownElement.querySelectorAll('.level-exp:empty').forEach(it => {
		var addedExp = parseInt((<HTMLElement> it.previousSibling).textContent || '0');

		totalExp = Math.min(totalExp + addedExp, newCapExp);

		var values = getLevelAndExp(totalExp);

		it.textContent =  "Level " + values[0] + ", " + values[1] + "/" + values[2];
	})

	breakdownElement.setAttribute('data-exp', '' + totalExp);

	return totalExp;
}

function getDateRow(offset: number) {
	var row = document.createElement('tr');

	var header = document.createElement('th');
	header.setAttribute('colspan', '4');

	var time = document.createElement('time');
	time.setAttribute('data-offset', '' + offset);
	var rowTime = updateTimeByOffset(time);
	header.appendChild(time);

	if ((rowTime >= cbStartTime) && (rowTime <= cbEndTime)) {
		var cbDayNumberElement = document.createElement('div');
		cbDayNumberElement.textContent = 'Clan Battle, Day ' + (Math.floor((rowTime.valueOf() - cbStartTime.valueOf()) / msPerDay) + 1);
		header.appendChild(cbDayNumberElement);
	}

	row.appendChild(header);
	return row;
}

function appendTemplate(
	tbody: HTMLTableSectionElement,
	dayNumber: number,
	elements: DocumentFragment,
	newCapExp: number
) : void {

	if (dayNumber != 0) {
		appendLevelUp(tbody, dayNumber, newCapExp);
	}

	elements.querySelectorAll('td.day-number').forEach(it => {
		it.textContent = '' + dayNumber;
	});

	elements.querySelectorAll('tr').forEach(it => {
		tbody.appendChild(it);

		if (dayNumber != 0) {
			appendLevelUp(tbody, dayNumber, newCapExp);
		}
	});
}

function appendMissions(
	tbody: HTMLTableSectionElement,
	dayNumber: number,
	newCapExp: number
) : void {

	appendTemplate(tbody, dayNumber, <DocumentFragment> missionsTemplate.cloneNode(true), newCapExp);

	var rowTime = moment(startTime.valueOf()).add(dayNumber, 'days');

	if ((rowTime >= cbStartTime) && (rowTime <= cbEndTime)) {
		appendTemplate(tbody, dayNumber, <DocumentFragment> clanBattleTemplate.cloneNode(true), newCapExp);
	}
}

function appendRefreshes(
	tbody: HTMLTableSectionElement,
	dayNumber: number,
	refreshCount: number,
	newCapExp: number
) : void {

	if (refreshCount == 0) {
		return;
	}

	var elements = <DocumentFragment> refreshTemplate.cloneNode(true);

	var quickSelectOption = quickSelectElement.options[quickSelectElement.selectedIndex];

	var lastRefreshDayNumber = parseInt(quickSelectOption.getAttribute('data-last-refresh-day') || '-1');

	if (dayNumber == lastRefreshDayNumber) {
		refreshCount = parseInt(quickSelectOption.getAttribute('data-last-refresh-count') || '0');
	}

	elements.querySelectorAll('.refresh-amount').forEach(it => {
		it.textContent = '' + refreshCount;
	});

	elements.querySelectorAll('.stamina-amount').forEach(it => {
		it.textContent = '' + (refreshCount * 120);
	});

	appendTemplate(tbody, dayNumber, elements, newCapExp);
}

function appendLevelUp(
	tbody: HTMLTableSectionElement,
	dayNumber: number,
	newCapExp: number
) : void {

	var oldExp = parseInt(breakdownElement.getAttribute('data-exp') || '0');
	var newExp = updateExp(newCapExp);

	var oldLevel = getLevelAndExp(oldExp)[0];
	var newLevel = getLevelAndExp(newExp)[0];

	if (oldLevel == newLevel) {
		return;
	}

	var stamina = getNewLevelStamina(oldLevel, newLevel);

	var elements = <DocumentFragment> levelUpTemplate.cloneNode(true);

	elements.querySelectorAll('td.day-number').forEach(it => {
		it.textContent = '' + dayNumber;
	});

	elements.querySelectorAll('.stamina-amount').forEach(it => {
		it.textContent = '' + stamina;
	});

	elements.querySelectorAll('.old-level').forEach(it => {
		it.textContent = '' + oldLevel;
	});

	elements.querySelectorAll('.new-level').forEach(it => {
		it.textContent = '' + newLevel;
	});

	tbody.appendChild(elements);
}

function updateBreakdown() : void {
	breakdownElement.setAttribute(
		'data-exp',
		'' + getTotalExp(parseInt(initialLevelElement.value), parseInt(initialOverflowElement.value))
	);

	var maxExp = getTotalExp(parseInt(newMaxLevelElement.textContent || '1'), 0);
	var newCapExp = getTotalExp(parseInt(newMaxLevelElement.textContent || '1') + 1, -1);
	var refreshCount = parseInt(staminaRefreshCountElement.value);

	var refreshAmountElement = <HTMLSpanElement> document.querySelector('#preparations .refresh-amount');
	refreshAmountElement.textContent = '' + refreshCount;

	var staminaAmountElement = <HTMLSpanElement> document.querySelector('#preparations .stamina-amount');
	refreshAmountElement.textContent = '' + (refreshCount * 120);

	breakdownElement.querySelectorAll('time').forEach(updateTimeByOffset);

	var tbody = breakdownElement.tBodies[0];
	tbody.innerHTML = '';

	if (useBeforeNewAreaElement.checked) {
		scheduleElement.classList.remove('not-before-new-area');
		tbody.appendChild(getDateRow(-1200000));

		if (useAfterNewAreaElement.checked) {
			appendTemplate(tbody, 0, <DocumentFragment> beforeAfterNewAreaTemplate.cloneNode(true), newCapExp);
		}

		appendTemplate(tbody, 0, <DocumentFragment> beforeNewAreaTemplate.cloneNode(true), newCapExp);
		appendRefreshes(tbody, 0, refreshCount, newCapExp);
	}
	else {
		scheduleElement.classList.add('not-before-new-area');
	}

	tbody.appendChild(getDateRow(0));

	if (useAfterNewAreaElement.checked) {
		scheduleElement.classList.remove('not-after-new-area');
		appendTemplate(tbody, 1, <DocumentFragment> afterNewAreaTemplate.cloneNode(true), newCapExp);
	}
	else {
		scheduleElement.classList.add('not-after-new-area');
	}

	appendRefreshes(tbody, 1, refreshCount, newCapExp);
	appendMissions(tbody, 1, newCapExp);

	for (var dayNumber = 2; updateExp(newCapExp) < maxExp; dayNumber++) {
		tbody.appendChild(getDateRow(msPerDay * (dayNumber - 1)));
		appendRefreshes(tbody, dayNumber, refreshCount, newCapExp);
		appendMissions(tbody, dayNumber, newCapExp);
	}
}