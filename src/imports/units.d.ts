declare var unitIds : Record<string, string>;
declare var unitNames : Record<string, string>;
declare var altNames : Record<string, string>;
declare var positions : Record<string, number>;

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