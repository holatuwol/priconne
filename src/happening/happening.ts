var now = moment().utc();
var nowTime = moment().valueOf() / 1000;

// https://stackoverflow.com/a/6150060

function selectAll(el: HTMLElement) : void {
    var range = document.createRange();

    range.selectNodeContents(el);

    var sel = window.getSelection();

    if (!sel) {
    	return;
    }

    sel.removeAllRanges();
    sel.addRange(range);
}

function addEvent(
	eventName: string,
	startDate: string,
	startTime: number,
	endDate: string,
	endTime: number
) : void {

	var eventDetails = [];
	eventDetails.push('**' + eventName.replace('*', '\\*') + '**');

	if (endTime < nowTime) {
		eventDetails.push('ended: <t:' + endTime + ':R>');
	}
	else if (startDate == endDate) {
		if (startTime < nowTime) {
			eventDetails.push('released: <t:' + startTime + ':R>');
		}
		else {
			eventDetails.push('releases: <t:' + startTime + ':R>');
		}
	}
	else {
		eventDetails.push('starts: <t:' + startTime + ':R>');
		eventDetails.push('/');
		eventDetails.push('ends: <t:' + endTime + ':R>');
	}

	var eventPostElement = <HTMLParagraphElement> document.getElementById('event-post');

	eventPostElement.innerText += eventDetails.join(' ') + '\n';
}

var sixMonths = 6 * 30 * 24 * 60 * 60;

function fixYear(
	partialDateString: string,
	timeString: string
) : [string, number] {

	var dateString = now.year() + '-' + partialDateString;
	var dateSeconds = Math.floor(moment(dateString + 'T' + timeString + ':00.000Z').valueOf() / (60 * 1000)) * 60;

	var nowSeconds = now.valueOf() / 1000;

	if (nowSeconds - dateSeconds > sixMonths) {
		dateString = (now.year() + 1) + '-' + partialDateString;
		dateSeconds = Math.floor(moment(dateString + 'T' + timeString + ':00.000Z').valueOf() / (60 * 1000)) * 60;
	}
	else if (dateSeconds - nowSeconds > sixMonths) {
		dateString = (now.year() - 1) + '-' + partialDateString;
		dateSeconds = Math.floor(moment(dateString + 'T' + timeString + ':00.000Z').valueOf() / (60 * 1000)) * 60;
	}

	return [dateString, dateSeconds];
}

var eventPattern1 = /(\d+\/\d+)(?:\/\d+)? (\d+:\d+) UTC to (\d+\/\d+)(?:\/\d+)? (\d+:\d+) UTC/;
var eventPattern2 = /\((\d+\/\d+)(?:\/\d+)? (\d+:\d+) UTC\)/;
var eventPattern3 = /\(After (\d+\/\d+)(?:\/\d+)? (\d+:\d+) UTC\)/;

function addExtractedEvent(
	eventName: string,
	startDayString: string,
	startTimeString: string,
	endDayString: string,
	endTimeString: string
) : void {

	startDayString = startDayString.replace(/^([0-9])\//, '0$1/').replace(/\/([0-9])$/, '/0$1').replace(/\//g, '-');
	endDayString = endDayString.replace(/^([0-9])\//, '0$1/').replace(/\/([0-9])$/, '/0$1').replace(/\//g, '-');

	startTimeString = startTimeString.replace(/^([0-9]):/, '0$1:');
	endTimeString = endTimeString.replace(/^([0-9]):/, '0$1:');

	var [startDate, startTime] = fixYear(startDayString, startTimeString);
	var [endDate, endTime] = fixYear(endDayString, endTimeString);

	addEvent(eventName, startDate, startTime, endDate, endTime);
}

function extractEvent(
	eventText: string,
	index: number,
	eventTexts: string[]
) : void {

	var result = eventPattern1.exec(eventText);
	var eventName, startDate, startTime, endDate, endTime;

	if (result) {
		eventName = eventText.substring(0, result.index - 1).trim();
		addExtractedEvent(eventName, result[1], result[2], result[3], result[4]);
		return;
	}

	result = eventPattern2.exec(eventText);

	if (result) {
		eventName = eventText.substring(0, result.index - 1).trim();

		if (eventName.indexOf('Content Update') != -1) {
			eventName = eventTexts[index + 1].replace(/\./g, '');
		}

		addExtractedEvent(eventName, result[1], result[2], result[1], result[2]);
		return;
	}

	result = eventPattern3.exec(eventText);

	if (result) {
		eventName = eventText.substring(0, result.index - 1).trim();
		addExtractedEvent(eventName, result[1], result[2], result[1], result[2]);
	}
}

function extractEvents() : void {
	var el = <HTMLTextAreaElement> document.getElementById('crunchyroll-events');
	
	el.value.split('\n').forEach(extractEvent);	
}

function addCustomEvent(
	event: Event,
	picker: BootstrapDateRangePicker
) : void {

	var startDate = picker.startDate.format('yyyy-MM-DD');
	var endDate = picker.endDate.format('yyyy-MM-DD');

	var eventType = jQuery('#event-type').val();
	var eventName = jQuery('#event-name').val();

	var startTime, endTime;

	if (eventType == 'banner') {
		startTime = startDate + 'T23:00:00.000Z';
		endTime = endDate + 'T22:59:59.999Z';
	}
	else if (eventType == 'clan-battle') {
		startTime = startDate + 'T13:00:00.000Z';
		endTime = endDate + 'T07:59:59.999Z';
	}
	else if (eventType == 'drop-campaign') {
		startTime = startDate + 'T13:00:00.000Z';
		endTime = endDate + 'T12:59:59.999Z';
	}
	else if (eventType == 'luna-tower') {
		startTime = startDate + 'T13:00:00.000Z';
		endTime = endDate + 'T15:59:59.999Z';
	}
	else if (eventType == 'story-event') {
		startTime = startDate + 'T23:00:00.000Z';
		endTime = endDate + 'T22:59:59.999Z';
	}
	else {
		return;
	}

	startTime = Math.floor(moment(startTime).valueOf() / (60 * 1000)) * 60;
	endTime = Math.floor(moment(endTime).valueOf() / (60 * 1000)) * 60;

	addEvent(eventName, startDate, startTime, endDate, endTime);
}

var eventTimesElement = jQuery('#event-times');

eventTimesElement.daterangepicker({
	locale: {
		format: 'MMMM DD, yyyy'
	}
});

eventTimesElement.on('apply.daterangepicker', addCustomEvent);