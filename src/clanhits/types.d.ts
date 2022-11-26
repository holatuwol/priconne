declare var cbId: string;
declare var cbStartDate: Date;
declare var defaultSheetId : string;

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
}

interface Allocation {
	completed: AllocatedHit[]
	remaining: AllocatedHit[]
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