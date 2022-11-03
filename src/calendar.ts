const msPerDay = 24 * 60 * 60 * 1000;

function timeWeekday(
	startTime: Date,
	weekday: number
) : Date {
	return new Date(startTime.getTime() + (msPerDay * (weekday - startTime.getDay())));
}

function timeEndOfDay(calendarDate: Date) : Date {
	var end = new Date(calendarDate.getTime());
	end.setHours(23, 59, 59, 999);
	return end;
}

function timeStartOfDay(calendarDate: Date) : Date {
	var start = new Date(calendarDate.getTime());
	start.setHours(0, 0, 0, 0);
	return start;
}

function getCalendarDateRange(
	currentTime: Date,
	startTime: Date,
	endTime: Date
) : HTMLSpanElement {
	var container = document.createElement('span');
	container.classList.add('panel', 'panel-primary');

	var headingContainer = document.createElement('span');
	container.appendChild(headingContainer);
	headingContainer.classList.add('panel-heading');
	headingContainer.textContent = startTime.toLocaleString('default', { year: 'numeric', month: 'long' });

	var weekContainer = document.createElement('span');
	container.appendChild(weekContainer);
	weekContainer.classList.add('panel-content');

	for (var i = 1; i < 8; i++) {
		var span = document.createElement('span');
		span.classList.add('day-names');
		span.textContent = timeWeekday(startTime, i).toLocaleString('default', { weekday: 'short' });
		weekContainer.appendChild(span);
	}

	for (var i = 1; i < 15; i++) {
		var displayTime = timeWeekday(startTime, i);

		var span = document.createElement('span');
		span.classList.add('calendar-day');

		if (displayTime >= timeStartOfDay(startTime) && displayTime <= timeEndOfDay(endTime)) {
			span.classList.add('calendar-clan-battle');
		}

		span.textContent = displayTime.toLocaleString('default', { day: '2-digit' });
		weekContainer.appendChild(span);
	}

	return container;
}

function getTextDateRange(
	startTime: Date,
	endTime: Date
) : HTMLSpanElement {

	var options = {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		timeZoneName: 'long'
	};

	var container = document.createElement('span');

	var listElement = document.createElement('dl');
	container.appendChild(listElement);

	var startDT = document.createElement('dt');
	listElement.appendChild(startDT);
	startDT.textContent = 'Start Time';

	var startDD = document.createElement('dd');
	listElement.appendChild(startDD);
	startDD.textContent = startTime.toLocaleString('default', options) + ' (<t:' + Math.floor(startTime.getTime() / 1000) + ':F>)';

	var endDT = document.createElement('dt');
	listElement.appendChild(endDT);
	endDT.textContent = 'End Time';

	var endDD = document.createElement('dd');
	listElement.appendChild(endDD);
	endDD.textContent = endTime.toLocaleString('default', options) + ' (<t:' + Math.floor(endTime.getTime() / 1000) + ':F>)';

	return container;
}