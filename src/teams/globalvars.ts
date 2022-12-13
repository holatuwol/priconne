var latestCBId = '23';

var noticeElement = document.getElementById('planner-notice');
var currentCBId = noticeElement ? noticeElement.getAttribute('data-cb-id') || latestCBId : latestCBId;

var defaultURLs = <string[]> [];
var parallelLoadCount = 0;

var defaultTeams = <ClanBattleTeam[]> [];
var extraTeams = <ClanBattleTeam[]> [];
var labAutoTeams = <ClanBattleTeam[]> [];
var labManualTeams = <ClanBattleTeam[]> [];
var pcrgTeams = <ClanBattleTeam[]> [];
var demiurgeTeams = <ClanBattleTeam[]> [];

var availableUnits = <Record<string, ClanBattleBuild>> {};

var bookmarkElement = <HTMLInputElement | null> document.getElementById('units-available-bookmark');
var extraTeamElement = <HTMLTextAreaElement | null> document.getElementById('extra-teams');

var availableContainer = <HTMLTableElement> document.querySelector('#teams-available');
var availableHeader = <HTMLTableSectionElement> availableContainer.tHead;
var availableBody = <HTMLTableSectionElement> availableContainer.tBodies[0];

var selectedContainer = <HTMLTableElement> document.querySelector('#teams-selected');
var selectedHeader = <HTMLTableSectionElement> selectedContainer.tHead;
var selectedBody = <HTMLTableSectionElement> selectedContainer.tBodies[0];

var simpleRE = /([\-+]?[0-9][0-9\.,\s]*[km±])/i;
var averageRE = /Avg:? ([0-9\.,]+)/i;
var otkRE = /((?:\d+%\s)?(?:OTK|OHKO))/i;

var rankStarRE = /(?:r?[0-9]+[\*⭐]? ?)?([^\-=,:±<>]*)/i;
var singleSubRE = /([^\-=,:±<>]*)\s+to\s+([^\-=,:±<>]*)/i;