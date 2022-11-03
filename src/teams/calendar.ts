function addClanBattleDates() {
	var container = document.getElementById('clan-battle-dates');

	if (!container) {
		return;
	}

	var startTimeString = container.getAttribute('data-start-time');
	var endTimeString = container.getAttribute('data-end-time');

	if (!startTimeString || !endTimeString) {
		return;
	}

	var currentTime = new Date();
	var startTime = new Date(startTimeString);
	var endTime = new Date(endTimeString);

	container.appendChild(getCalendarDateRange(currentTime, startTime, endTime));
	container.appendChild(getTextDateRange(startTime, endTime))
}