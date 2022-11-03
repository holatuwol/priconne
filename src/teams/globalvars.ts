var latestCBId = '22';

var noticeElement = <HTMLDivElement> document.getElementById('planner-notice');
var currentCBId = noticeElement.getAttribute('data-cb-id') || latestCBId;

var defaultURLs = <string[]> [];
var parallelLoadCount = 0;

var defaultTeams = <ClanBattleTeam[]> [];
var extraTeams = <ClanBattleTeam[]> [];
var labAutoTeams = <ClanBattleTeam[]> [];
var labManualTeams = <ClanBattleTeam[]> [];
var pcrgTeams = <ClanBattleTeam[]> [];

var availableUnits = new Set<string>();

var bookmarkElement = <HTMLInputElement> document.getElementById('units-available-bookmark');
var extraTeamElement = <HTMLTextAreaElement> document.getElementById('extra-teams');

var availableContainer = <HTMLTableElement> document.querySelector('#teams-available');
var availableHeader = <HTMLTableSectionElement> availableContainer.tHead;
var availableBody = <HTMLTableSectionElement> availableContainer.tBodies[0];

var selectedContainer = <HTMLTableElement> document.querySelector('#teams-selected');
var selectedHeader = <HTMLTableSectionElement> selectedContainer.tHead;
var selectedBody = <HTMLTableSectionElement> selectedContainer.tBodies[0];

var simpleRE = /([\-+]?[0-9][0-9\.,\s]*[km±])/i;
var averageRE = /Avg:? ([0-9\.,]+)/i;

var rankStarRE = /(?:r?[0-9]+[\*⭐]? ?)?([^\-=,:±<>]*)/i;
var singleSubRE = /([^\-=,:±<>]*)\s+to\s+([^\-=,:±<>]*)/i;