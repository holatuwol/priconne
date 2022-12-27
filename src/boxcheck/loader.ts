function parseUnquotedCSV(text: string) : Record<string, any>[] {
	var rows = csv2arr(text)
	var header = rows[0];

	return rows.slice(1).filter(it => it[0]).map(row => {
		var result = <Record<string, string | number>> {};

		for (var i = 0; i < header.length; i++) {
			if ((header[i] == 'id') || (header[i] == 'name') || (header[i] == 'date') || (header[i].indexOf('.full') != -1)) {
				result[header[i]] = row[i];
			}
			else if (row[i]) {
				result[header[i]] = parseInt(row[i]);
			}
		}

		return result;
	});
}

function updateBoxCheckURL() : void {
	var boxCheckElement = <HTMLInputElement> document.getElementById('box-check-url');
	boxCheckElement.value = '';

	var rosterElement = <HTMLInputElement> document.getElementById('roster-url');
	var rosterURL = rosterElement.value;

	if (!rosterURL) {
		return;
	}

	rosterURL = rosterURL.substring(0, rosterURL.indexOf('?'));

	var xhr = new XMLHttpRequest();

	xhr.onload = function() {
		var container = document.implementation.createHTMLDocument().documentElement;
		container.innerHTML = xhr.responseText;

		var tabs = Array.from(container.querySelectorAll('#sheet-menu li')).reduce((acc, it) => {
			acc[(it.textContent || '').trim()] = it.id.substring('sheet-button-'.length);
			return acc;
		}, <Record<string, string>> {});

		if (!('Resources' in tabs) && !('Roster' in tabs)) {
			boxCheckElement.value = 'missing required tabs in shared document';

			return;
		}

		var endPos = rosterURL.lastIndexOf('/');
		var startPos = rosterURL.lastIndexOf('/', endPos - 1);

		var sheetId = rosterURL.substring(startPos + 1, endPos);
		
		boxCheckElement.value = [
			document.location.protocol, '//', document.location.host, document.location.pathname,
			'?', sheetId, '=', tabs['Roster'], ',', tabs['Resources']
		].join('');
	};

	rosterURL += '?t=' + Date.now();

	xhr.open('GET', rosterURL, true);
	xhr.send();
}

function updateDocumentFragmentLink(
	fragment: DocumentFragment,
	selector: string,
	href: string,
	content: string
) : void {

	var anchorElement = <HTMLAnchorElement> fragment.querySelector(selector);

	anchorElement.href = href;
	anchorElement.textContent = content;
}

function checkUnits() {
	var search = (document.location.search || '?').substring(1).split('&').filter(it => it);

	var navContainer = <HTMLUListElement> document.getElementById('nav-container');
	var navTemplate = (<HTMLTemplateElement> document.getElementById('nav-template')).content;

	var tabContainer = <HTMLDivElement> document.getElementById('tab-container');
	var tabTemplate = (<HTMLTemplateElement> document.getElementById('tab-template')).content;

    var tabCount = tabContainer.querySelectorAll('.tab-pane.unit-box').length / 2;

	for (var i = 0; i < search.length; i++) {
		var id = tabCount + i + 1;

		var splitParam = search[i].split('=');
		var sheetId = splitParam[0];
		var gids = (splitParam[1] || '0').split(',');

		if (gids.length == 0) {
			continue;
		}

		var rosterRequestURL = null;
		var resourceRequestURL = null;
		var playerId = null;

		if (gids.length > 2) {
			playerId = gids[2];
			gids = gids.splice(0, 2);
		}

		if (gids.length == 2) {
			rosterRequestURL = expandGoogleSheetURL(sheetId, gids[0], true);
			resourceRequestURL = expandGoogleSheetURL(sheetId, gids[1], true);
		}
		else {
			rosterRequestURL = expandGoogleSheetURL(sheetId, gids[0], true);
		}

		var navElement = <DocumentFragment> navTemplate.cloneNode(true);
		updateDocumentFragmentLink(navElement, '.box-link', '#box' + id, 'Box ' + id);
		updateDocumentFragmentLink(navElement, '.list-link', '#list' + id, 'Details ' + id);

		if (playerId) {
			updateDocumentFragmentLink(navElement, '.mofumofu-link', 'https://mofumofu.live/profile/view/' + playerId, 'MofuMofu ' + id);
		}
		else {
			(<HTMLAnchorElement> navElement.querySelector('.mofumofu-link')).style.display = 'none';
		}

		navContainer.appendChild(navElement);

		var tabElement = <DocumentFragment> tabTemplate.cloneNode(true);
		(<HTMLElement> tabElement.querySelector('.box-tab')).setAttribute('id', 'box' + id);
		(<HTMLElement> tabElement.querySelector('.list-tab')).setAttribute('id', 'list' + id);

		tabContainer.appendChild(tabElement);

		var boxContainer = <HTMLDivElement> document.querySelector('#box' + id + ' .unit-box');
		var listContainer = <HTMLUListElement> document.querySelector('#list' + id + ' .unit-list');
		var jsonLink = <HTMLAnchorElement> document.querySelector('#box' + id + ' a[download="SaveData.json"], #list' + id + ' a[download="SaveData.json"]');

		loadRoster(boxContainer, listContainer, jsonLink, rosterRequestURL, resourceRequestURL);
	}

	document.querySelectorAll('.sort-options a').forEach((it: HTMLAnchorElement) => it.onclick = renderUnits.bind(null, it));
	
	var newBoxLink = <HTMLAnchorElement | null> document.querySelector('a[href="#box' + (tabCount + 1) + '"]');

	if (newBoxLink) {
		newBoxLink.click();
	}
}

function filterUnitsHelper(
	container: HTMLElement,
	filter: HTMLInputElement
) : void {

	var units = container.querySelectorAll('.unit-description, .unit-image').forEach((it: HTMLElement) => {
		it.style.display = 'none';
	});

	var filterValues = filter.value.trim().split(/\s+/g);

	for (var i = 0; i < filterValues.length; i++) {
		var filterValue = filterValues[i].toLowerCase().replace(/[^a-z]/g, '').replace(/\./g, '');
		var titleSelector = filterValue ? '[data-name*="' + filterValue + '"]' : '';

		container.querySelectorAll('.unit-description' + titleSelector + ', .unit-image' + titleSelector).forEach((it: HTMLElement) => {
			it.style.display = 'flex';
		});
	}
}

var filterUnits = _.debounce(filterUnitsHelper, 300);