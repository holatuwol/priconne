function updatePlannerNotice() {
	if (!noticeElement || noticeElement.classList.contains('hide')) {
		return;
	}

	if (latestCBId == currentCBId) {
		noticeElement.classList.add('panel', 'panel-info');
		noticeElement.innerHTML = `
<div class="panel-heading">
<strong>Note</strong>:
Firefox is randomly unable to load Google Sheets exports, so if you run into
any problems when using Firefox, please try a different browser.
</div>
		`;
	}
	else {
		noticeElement.classList.add('panel', 'panel-warning');
		noticeElement.innerHTML = `
<div class="panel-heading">
<strong>Warning</strong>:
You are currently looking at the CB${currentCBId} Hits Planner. Please use the
<a href="cb.html">CB${latestCBId} Hits Planner</a> if you wish to plan out hits
for Clan Battle ${latestCBId}.
</div>
		`;
	}
}