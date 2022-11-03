function createCell(
    text: string | HTMLElement,
    customClass?: string
) : HTMLTableCellElement {

    var cell = document.createElement('td');

    if (typeof text === 'string') {
        cell.textContent = text;
    }
    else if (text) {
        cell.appendChild(text);
    }

    if (customClass) {
        cell.classList.add(customClass);
    }

    return cell;
};

function getCheckboxValues(selector: string) : Set<string> {
    var checkboxes = <HTMLInputElement[]> Array.from(document.querySelectorAll(selector));
    var values = checkboxes.map((it) => it.value);
    return new Set(values);
}

function getSiblingRowElement(
    element: HTMLTableRowElement,
    count: number
) : HTMLTableRowElement {

    for (var i = 0; i < count; i++) {
        element = <HTMLTableRowElement> element.nextSibling;
    }

    return element;
}

function splitStringAttribute(
    element: HTMLElement,
    attributeName: string
) : string[] {

    var value = element.getAttribute(attributeName);

    if (!value)  {
        return [];
    }

    return value.split(',');
}

function splitIntAttribute(
    element: HTMLElement,
    attributeName: string
) : number[] {

    return splitStringAttribute(element, attributeName).map(it => parseInt(it));
}

function splitFloatAttribute(
    element: HTMLElement,
    attributeName: string
) : number[] {

    return splitStringAttribute(element, attributeName).map(it => parseFloat(it));
}