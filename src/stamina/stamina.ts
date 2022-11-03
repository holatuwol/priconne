var now = moment();

var options = { 
	year: 'numeric',
	month: 'long',
	day: '2-digit',
	hour: '2-digit',
	minute: '2-digit',
	timeZoneName: 'long'
};

var eventTimesElement = <HTMLInputElement> document.getElementById('event-times');
var eventTypeElement = <HTMLSelectElement> document.getElementById('event-type');
var mainElement = <HTMLDivElement> document.querySelector('div[role="main"]');
var optionsElement = <HTMLDivElement> document.getElementById('options');

function updateDiscordTimeByOffset(
	timeElement: HTMLTimeElement
) : Moment {

	var scheduleElement = <HTMLElement> timeElement.closest('.schedule');
	var startTime = moment(scheduleElement.getAttribute('data-start-time'));

	var offset = timeElement.getAttribute('data-offset') || '0';
	var timestamp = moment(startTime.valueOf() + parseInt(offset));
	timeElement.textContent = '<t:' + (timestamp.valueOf() / 1000) + ':F>';
	return timestamp;
}

function updateTimeByOffset(
	timeElement: HTMLTimeElement
) : Moment {

	var scheduleElement = <HTMLElement> timeElement.closest('.schedule');
	var startTime = moment(scheduleElement.getAttribute('data-start-time'));

	var offset = timeElement.getAttribute('data-offset') || '0';
	var timestamp = moment(startTime.valueOf() + parseInt(offset));
	timeElement.textContent = timestamp.toDate().toLocaleString('default', options);
	return timestamp;	
}

function updateStartTime(
	picker?: BootstrapDateRangePicker
) : void {

	var startDate = picker ? picker.startDate.format('yyyy-MM-DD') : optionsElement.getAttribute('data-start-date') || '';

	optionsElement.setAttribute('data-start-date', startDate);

	document.querySelectorAll('.schedule').forEach(it => {
		if (it.id == 'drop-campaign') {
			it.setAttribute('data-start-time', startDate + 'T13:00:00.000Z');
		}
		else {
			it.setAttribute('data-start-time', startDate + 'T23:00:00.000Z');
		}
	});
}

function updatePreparationTimes(
	event?: Event,
	picker?: BootstrapDateRangePicker
) : void {

	updateStartTime(picker);

	var discordOption = <HTMLInputElement> document.getElementById('discord-timestamps');

	document.querySelectorAll('.schedule time').forEach(discordOption.checked ? updateDiscordTimeByOffset : updateTimeByOffset);
}

function updateSchedule() : void {
	document.querySelectorAll('.schedule').forEach((it: HTMLElement) => it.style.display = 'none');

	var eventElement = <HTMLElement> document.getElementById(eventTypeElement.value);

	eventElement.style.display = 'block';
}

function setEventType(index: number) : void {
	eventTypeElement.selectedIndex = index;

	var upcomingDatesString = <string> eventTypeElement.options[index].getAttribute('data-upcoming-dates')

	var upcomingDates = upcomingDatesString.split(';').map(it => moment(it, 'MMMM DD, yyyy'));

	var minEventDate = upcomingDates.filter(it => now.isBefore(it))[0];

	optionsElement.setAttribute('data-start-date', minEventDate.format('yyyy-MM-DD'));

	eventTimesElement.value = minEventDate.format('[event starts on] MMMM DD, yyyy [(UTC)]');

	updatePreparationTimes();
	updateSchedule();
}

function selectClosestEventType() : void {
	var eventDates = Array.from(eventTypeElement.options).map(function(next) {
		var upcomingDates = (next.getAttribute('data-upcoming-dates') || '').split(';').map(it => moment(it, 'MMMM DD, yyyy'));

		return upcomingDates.filter(it => now.isBefore(it))[0];
	});

	var minEventIndex = 0;
	var minEventDate = eventDates[0];

	for (var i = 1; i < eventDates.length; i++) {
		if (eventDates[i] && (!minEventDate || eventDates[i].isBefore(minEventDate))) {
			minEventIndex = i;
			minEventDate = eventDates[i];
		}
	}

	if (minEventDate) {
		setEventType(minEventIndex);
	}
	else {
		eventTimesElement.value = now.format('[event starts on] MMMM DD, yyyy [(UTC)]');
		optionsElement.setAttribute('data-start-date', now.format('yyyy-MM-DD'));

		updatePreparationTimes();
		updateSchedule();
	}
}

jQuery(eventTimesElement).daterangepicker({
	singleDatePicker: true,
	locale: {
		format: '[event starts on] MMMM DD, yyyy [(UTC)]'
	}
});

jQuery(eventTimesElement).on('apply.daterangepicker', updatePreparationTimes);

selectClosestEventType();