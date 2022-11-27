function expandGoogleSheetURLs(
	href : string | null,
	gids : string[] | null,
	xhrCallback: (responseText: string, href: string | null, container : HTMLElement) => boolean,
	gidsCallback: (gids: string[]) => void
) : void {

	if (href == null) {
		gidsCallback([]);
		return;
	}

	if (href.indexOf('.json') != -1 || href.indexOf('.csv') != -1) {
		gidsCallback([href]);
		return;
	}

	if ((href.indexOf('http') != 0) && (href.indexOf('/') == -1)) {
		href = 'https://docs.google.com/spreadsheets/d/e/' + href + '/pub';
	}

	if (href.indexOf('gid=') != -1) {
		gidsCallback([href]);
		return;
	}

	if (gids) {
		gidsCallback(gids.map(gid => href + '?gid=' + gid));
		return;
	}

	var xhr = new XMLHttpRequest();

	xhr.onload = function() {
		var container = document.implementation.createHTMLDocument().documentElement;
		container.innerHTML = xhr.responseText;

		if (xhrCallback(xhr.responseText, href, container)) {
			gids = [];
		}
		else {
			gids = Array.from(container.querySelectorAll('#sheet-menu li')).map(it => it.id.substring('sheet-button-'.length));

			if (gids.length == 0) {
				gids = [''];
			}
		}

		gidsCallback(gids.map(gid => href + (gid ? ('?gid=' + gid) : '')));
	};

	xhr.open('GET', href + '?output=html');

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

	if (requestURL.indexOf('https://docs.google.com/spreadsheets/') == 0) {
		if (requestURL.indexOf('/pub') == -1) {
			return;
		}

		if (requestURL.indexOf('/pubhtml?') != -1) {
			requestURL = requestURL.replace('/pubhtml?', '/pub?');
		}

		if (requestURL.indexOf('?') == -1) {
			requestURL += '?output=csv';
		}
		else if (requestURL.indexOf('&output=csv') == -1) {
			requestURL += '&output=csv';
		}

		if (requestURL.indexOf('&single=true') == -1) {
			requestURL += '&single=true';
		}
	}

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

function getGoogleSheetsGrid(rows : HTMLTableRowElement[]) : number[][] {
	var grid = <number[][]> [];

	for (var i = 0; i < rows.length; i++) {
		grid.push(<number[]> []);
		for (var j = 0; j < rows[i].cells.length; j++) {
			var colspan = parseInt(rows[i].cells[j].getAttribute('colspan') || '1') || 1;
			grid[i].push(colspan);
		}
	}

	for (var j = 0; j < 46; j++) {
		for (var i = 0; i < rows.length; i++) {
			if (j >= rows[i].cells.length) {
				continue;
			}

			var rowspan = parseInt(rows[i].cells[j].getAttribute('rowspan') || '1') || 1;
			mergeVertically(grid, i, j, rowspan);
		}
	}

	return grid;
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