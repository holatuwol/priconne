declare var unitNames : Record<string, string>;
declare var enUnitNames : Record<string, string>;
declare var jaUnitNames : Record<string, string>;
declare var altNames : Record<string, string>;
declare var positions : Record<string, number>;
declare var unitIds : Record<string, string>;
declare var unitIdsList : string[][];

declare function getMatchingUnitIds(name: string) : string[];

declare function fixUnitName(unitName: string) : string;

declare function updateUnitNames(
	source: Record<string, string>,
	acc: Record<string, string>,
	next: string
) : Record<string, string>;

declare function getUnitIcon(
	unitId: string,
	unitStars?: number
) : string;