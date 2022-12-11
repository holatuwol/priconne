function updatePlannerNotice() {
	if (!noticeElement) {
		return;
	}

	if (latestCBId == currentCBId) {
		noticeElement.classList.add('panel', 'panel-info');
		noticeElement.innerHTML = `
<div class="panel-heading">
<strong>Note</strong>:
Firefox is randomly unable to load Google Sheets CSV exports, so if Firefox (or one of its derivatives) is your preferred browser, please use a different browser.
The header is editable, so if you are using this planner to plan out a strategy for multiple accounts, edit the header to help differentiate between them.
</div>
		`;
	}
	else {
		noticeElement.classList.add('panel', 'panel-warning');
		noticeElement.innerHTML = `
<div class="panel-heading">
<strong>Warning</strong>:
You are currently looking at the CB${currentCBId} Hits Planner. Please use the <a href="cb${latestCBId}.html">CB${latestCBId} Hits Planner</a> if you wish to plan out hits for Clan Battle ${latestCBId}.
</div>
		`;
	}
}