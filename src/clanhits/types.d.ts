declare var cbId: string;
declare var cbStartDate: Date;

declare var hitRecordSheetId: string | undefined;
declare var allocationSheetId: string | undefined;

interface AllocatedHit {
	borrow?: string
	bossName: string
	damage?: number
	day: string
	lap?: number
	pilot?: string
	playerName: string
	timeline?: string
	carryover?: string
	carryoverBossName?: string
	carryoverTimeline?: string
}

interface Allocation {
	completed: AllocatedHit[]
	remaining: AllocatedHit[]
	latest?: AllocatedHit
}

interface ClanBattleStatus {
	allocation: Allocation
	carryover: Record<string, string>
	day: string
	hitNumber: number
	index: number
	lap: number
	latestHit: CompletedHit | null
	remainingHP: number
}