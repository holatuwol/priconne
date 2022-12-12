declare var availableContainer : HTMLTableElement;
declare var availableHeader : HTMLTableSectionElement;
declare var availableBody : HTMLTableSectionElement;

declare var selectedContainer : HTMLTableElement;
declare var selectedHeader : HTMLTableSectionElement;
declare var selectedBody : HTMLTableSectionElement;

declare function getMembers(row : HTMLTableRowElement) : Record<string, ClanBattleBuild>;

declare function hasUnitAvailable(
	units: Record<string, ClanBattleBuild>,
	key: string,
	desiredBuild?: ClanBattleBuild
) : boolean;

declare function isViableChoice(
	usableUnits: Record<string, ClanBattleBuild>,
	borrowStrategy: string,
	usedUnits: Set<string>,
	remainingTeams: Record<string, ClanBattleBuild>[]
) : boolean;

declare function loadTeams(
	callback: (teams: ClanBattleTeam[]) => void,
	requestURLs: string[]
) : void;

declare function markUnavailableTeam(
	borrowStrategy: string,
	chosenTeams: Record<string, ClanBattleBuild>[],
	row: HTMLTableRowElement
) : void;

declare function updateDefaultTeams(teams: ClanBattleTeam[]) : void;