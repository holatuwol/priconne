declare var hasSixStar : Set<string>;

interface ClanBattleUnit {
	name: string,
	build: string[]
}

interface ClanBattleTeam {
	boss: string,
	damage: string | number | null,
	id?: string | null,
	index?: string | null,
	media?: string | null,
	notes?: string,
	region: string,
	timing: string,
	timeline: string,
	units: ClanBattleUnit[]
}

interface ClanBattleTeamValue {
	row: HTMLTableRowElement,
	value: number
}