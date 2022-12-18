declare var hasSixStar : Set<string>;

interface ClanBattleBuild {
	level?: string,
	star?: string,
	rank?: string,
	unique?: string,
	ub?: string,
	s1?: string,
	s2?: string,
	ex?: string,
	extra?: string
}

interface ClanBattleUnit {
	name: string,
	build: ClanBattleBuild
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