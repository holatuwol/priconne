var mainElement = <HTMLDivElement> document.querySelector('div[role="main"]');
var optionsElement = <HTMLDivElement> document.getElementById('options');
var newMaxLevelElement = <HTMLSpanElement> document.getElementById('new-max-level');
var scheduleElement = <HTMLDListElement> document.getElementById('schedule');

newMaxLevelElement.addEventListener('input', updateBreakdown);

var breakdownElement = <HTMLTableElement> document.getElementById('level-up-breakdown');
var initialLevelElement = <HTMLInputElement> document.getElementById('initial-level');
var initialOverflowElement = <HTMLInputElement> document.getElementById('initial-overflow-exp');
var useAfterNewAreaElement = <HTMLInputElement> document.getElementById('use-after-new-area');
var useBeforeNewAreaElement = <HTMLInputElement> document.getElementById('use-before-new-area');
var staminaRefreshCountElement = <HTMLSelectElement> document.getElementById('stamina-refresh-count');
var quickSelectElement = <HTMLSelectElement> document.getElementById('quick-select');

var options = { 
	year: 'numeric',
	month: 'long',
	day: '2-digit',
	hour: '2-digit',
	minute: '2-digit',
	timeZoneName: 'long'
};

var startTimeElement = jQuery('#start-time');
var startTimeFormat = '[released on] MMMM DD, yyyy [(UTC)]';
mainElement.setAttribute('data-start-time', moment(startTimeElement.val(), startTimeFormat).format('yyyy-MM-DD') + 'T13:00:00.000Z');

var startTimePicker = startTimeElement.daterangepicker({
	singleDatePicker: true,
	locale: {
		format: startTimeFormat
	}
});

startTimeElement.on('apply.daterangepicker', updateStartTime.bind(null, 'data-start-time'));

var cbStartTimeElement = jQuery('#cb-start-time');
var cbStartTimeFormat = '[starts on] MMMM DD, yyyy [(UTC)]';
mainElement.setAttribute('data-cb-start-time', moment(cbStartTimeElement.val(), cbStartTimeFormat).format('yyyy-MM-DD') + 'T13:00:00.000Z');

var cbStartTimePicker = cbStartTimeElement.daterangepicker({
	singleDatePicker: true,
	locale: {
		format: cbStartTimeFormat
	}
});

cbStartTimeElement.on('apply.daterangepicker', updateStartTime.bind(null, 'data-cb-start-time'));

var startTime = moment(mainElement.getAttribute('data-start-time'));
var cbStartTime = moment(mainElement.getAttribute('data-cb-start-time'));
var cbEndTime = moment(cbStartTime.valueOf() + ((24 * 5 - 5) * 60 * 60 * 1000));

function updateDiscordTimeByOffset(timeElement: HTMLTimeElement) : Moment {
	var offset = timeElement.getAttribute('data-offset') || '0';
	var timestamp = moment(startTime.valueOf() + parseInt(offset));
	timeElement.textContent = '<t:' + (timestamp.valueOf() / 1000) + ':F>';
	return timestamp;
}

function updateTimeByOffset(timeElement: HTMLTimeElement) : Moment {
	var offset = timeElement.getAttribute('data-offset') || '0';
	var timestamp = moment(startTime.valueOf() + parseInt(offset));
	timeElement.textContent = timestamp.toDate().toLocaleString('default', options);
	return timestamp;	
}

function updatePreparationTimes() : void {
	var discordOption = <HTMLInputElement> document.getElementById('discord-timestamps');

	var useDiscordTimestamps = discordOption.checked;

	document.querySelectorAll('#schedule time').forEach(useDiscordTimestamps ? updateDiscordTimeByOffset : updateTimeByOffset);
}

function updateQuickSelect() : void {
	var quickSelectOption = quickSelectElement.options[quickSelectElement.selectedIndex];

	if (quickSelectElement.value == 'custom') {
		initialLevelElement.disabled = false;
		initialOverflowElement.disabled = false;
		useAfterNewAreaElement.disabled = false;
		useBeforeNewAreaElement.disabled = false;
		staminaRefreshCountElement.disabled = false;
	}
	else {
		initialLevelElement.disabled = true;
		initialOverflowElement.disabled = true;
		useAfterNewAreaElement.disabled = true;
		useBeforeNewAreaElement.disabled = true;
		staminaRefreshCountElement.disabled = true;

		initialLevelElement.value = quickSelectOption.getAttribute('data-initial-level') || '1';
		initialOverflowElement.value = quickSelectOption.getAttribute('data-initial-overflow-exp') || '0';
		useAfterNewAreaElement.checked = (quickSelectOption.getAttribute('data-use-after-new-area') == 'true');
		useBeforeNewAreaElement.checked = (quickSelectOption.getAttribute('data-use-before-new-area') == 'true');
		staminaRefreshCountElement.selectedIndex = parseInt(quickSelectOption.getAttribute('data-refresh-count') || '-1');
	}

	updateBreakdown();
}

function updateStartTime(
	attributeId: string,
	event: Event,
	picker: BootstrapDateRangePicker
) : void {

	mainElement.setAttribute(attributeId, picker.startDate.format('yyyy-MM-DD') + 'T13:00:00.000Z');

	startTime = moment(mainElement.getAttribute('data-start-time'));

	quickSelectElement.selectedIndex = 0;
	quickSelectElement.setAttribute('disabled', 'true');

	updateQuickSelect();
	updatePreparationTimes();
}