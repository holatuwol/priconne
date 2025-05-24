function getColumnId(columnIndex: number) : string {
	var prefix = '';

	if (columnIndex >= 26) {
		prefix = String.fromCharCode(64 + Math.floor(columnIndex / 26));
	}

	return prefix + String.fromCharCode(65 + (columnIndex % 26));
}

function convertToCSV(
	container: HTMLElement,
	tabId: string
) : string[][] {

	var rows = <HTMLTableRowElement[]> Array.from(container.querySelectorAll('div[id="' + tabId + '"] table tbody tr'));

	return rows.map(it => Array.from(it.cells).slice(1).map(it => it.textContent || ''));
}

function expandGoogleSheetURL(
	href: string,
	gid?: string,
	csv?: boolean
) : string {

	if ((href.indexOf('http') != 0) && (href.indexOf('/') == -1)) {
		href = (href.length > 80) ? ('https://docs.google.com/spreadsheets/d/e/' + href + '/pub') : ('https://docs.google.com/spreadsheets/d/' + href + '/htmlview');
	}

	if (gid) {
		if (href.indexOf('?') == -1) {
			href += '?gid=' + gid;
		}
		else {
			href += '&gid=' + gid;
		}
	}

	if (csv) {
		if (href.indexOf('/pubhtml?') != -1) {
			href = href.replace('/pubhtml?', '/pub?');
		}

		if (href.indexOf('/pub') != -1) {
			if (href.indexOf('?') == -1) {
				href += '?output=csv';
			}
			else if (href.indexOf('&output=csv') == -1) {
				href += '&output=csv';
			}

			if (href.indexOf('&single=true') == -1) {
				href += '&single=true';
			}
		}
	}

	return href;
}

function expandGoogleSheetURLs(
	href : string | null,
	gids : string[] | null,
	xhrCallback? : (responseText: string, href: string | null, container : HTMLElement) => boolean,
	gidsCallback? : (gids: string[]) => void
) : void {

	if (href == null) {
		if (gidsCallback) {
			gidsCallback([]);
		}

		return;
	}

	if (href.indexOf('.json') != -1 || href.indexOf('.csv') != -1) {
		if (gidsCallback) {
			gidsCallback([href]);
		}

		return;
	}

	if ((href.indexOf('http') != 0) && (href.indexOf('/') == -1)) {
		href = expandGoogleSheetURL(href);
	}

	if (href.indexOf('gid=') != -1) {
		if (gidsCallback) {
			gidsCallback([href]);
		}

		return;
	}

	if (gids) {
		if (gidsCallback) {
			gidsCallback(gids.map(gid => href + '?gid=' + gid));
		}

		return;
	}

	var xhr = new XMLHttpRequest();

	xhr.onload = function() {
		if (this.readyState != XMLHttpRequest.DONE) {
			return;
		}

		if (this.status != 200) {
			setTimeout(expandGoogleSheetURLs.bind(null, href, gids, xhrCallback, gidsCallback), 500);
			return;
		}

		var container = document.implementation.createHTMLDocument().documentElement;
		container.innerHTML = xhr.responseText;

		if (xhrCallback && xhrCallback(xhr.responseText, href, container)) {
			gids = [];
		}
		else {
			gids = Array.from(container.querySelectorAll('#sheet-menu li')).map(it => it.id.substring('sheet-button-'.length));

			if (gids.length == 0) {
				gids = [''];
			}
		}

		if (gidsCallback) {
			gidsCallback(gids.map(gid => href + (gid ? ('?gid=' + gid) : '')));
		}
	};

	xhr.open('GET', href.indexOf('pub') != -1 ? href + '?output=html' : href);

	xhr.setRequestHeader("Cache-Control", "no-cache, no-store, max-age=0");
	xhr.setRequestHeader("Pragma", "no-cache");

	xhr.send();
}

function loadURL(
	requestURL: string,
	parseCSV: Function,
	parseRaw: Function,
	callback: Function
) : void {

	if (requestURL.indexOf(',') != -1) {
		callback(parseRaw(requestURL));

		return;
	}

	requestURL = expandGoogleSheetURL(requestURL, undefined, true);

	var request = new XMLHttpRequest();

	request.onreadystatechange = function() {
		if (this.readyState != 4) {
			return;
		}

		if (!this.responseText || (this.status != 200)) {
			callback([]);
			return;
		}

		if (this.responseText.charAt(0) == '[') {
			callback(JSON.parse(this.responseText));
		}
		else {
			callback(parseCSV(this.responseText));
		}
	};

	if (requestURL.indexOf('?') != -1) {
		requestURL += '&t=' + Date.now();
	}
	else {
		requestURL += '?t=' + Date.now();
	}

	request.open('GET', requestURL, true);
	request.send();
};

function mergeVertically(
	grid: number[][],
	i: number,
	j: number,
	rowspan: number
) : void {

	if (rowspan == 1) {
		return;
	}

	var desiredX = 0;

	for (var k = 0; k < j; k++) {
		desiredX += grid[i][k];
	}

	for (var y = 1; y < rowspan; y++) {
		var k = 0;
		var x = 0;

		for (var x = 0; x < desiredX; k++) {
			x += grid[i+y][k];
		}

		grid[i+y][k-1] += grid[i][j];
	}
}

function getGoogleSheetsGrid(rows : HTMLTableRowElement[]) : HTMLTableCellElement[][] {
	var grid = <Array<Array<HTMLTableCellElement | undefined>>> [];

	for (var i = 0; i < rows.length; i++) {
		var x = 0;

		if (grid[i] == undefined) {
			grid.push(<Array<HTMLTableCellElement | undefined>> []);
		}

		for (var j = 0; j < rows[i].cells.length; j++) {
			while (grid[i][x] != undefined) {
				x++;
			}

			var colspan = parseInt(rows[i].cells[j].getAttribute('colspan') || '1') || 1;
			var rowspan = parseInt(rows[i].cells[j].getAttribute('rowspan') || '1') || 1;

			for (var k = 0; k < rowspan; k++) {
				if (grid[i+k] == undefined) {
					grid.push(<Array<HTMLTableCellElement | undefined>> []);
				}

				for (var l = 0; l < colspan; l++) {
					grid[i+k][x+l] = rows[i].cells[j];
				}
			}

			x += colspan;
		}
	}

	return <HTMLTableCellElement[][]> grid;
}


// https://stackoverflow.com/a/58181757

function csv2arr(str : string) : string[][] {
	let line = ["",];
	const ret = [line,];
	let quote = false;

	for (let i = 0; i < str.length; i++) {
		const cur = str[i];
		const next = str[i + 1];

		if (!quote) {
			const cellIsEmpty = line[line.length - 1].length === 0;
			if (cur === '"' && cellIsEmpty) quote = true;
			else if (cur === ",") line.push("");
			else if (cur === "\r" && next === "\n") { line = ["",]; ret.push(line); i++; }
			else if (cur === "\n" || cur === "\r") { line = ["",]; ret.push(line); }
			else line[line.length - 1] += cur;
		} else {
			if (cur === '"' && next === '"') { line[line.length - 1] += cur; i++; }
			else if (cur === '"') quote = false;
			else line[line.length - 1] += cur;
		}
	}
	return ret;
};