declare var bossStats : Record<string, BossStats>;

declare function getLapTier(cbId: string, lap: number) : string;
declare function getBossMaxHP(cbId: string, lap: number, index: number) : number;
declare function getBossName(cbId: string, lap: number, index: number) : string;
declare function renderBossData(
	row: HTMLTableRowElement,
	cbId: string,
	lap: number,
	index: number,
	remainingHP: number,
) : void;

interface BossStats {
	bossIds: number[]
	bossHP: Record<string, number[]>
	lapTiers: string[]
	multipliers: Record<string, number[]>
}