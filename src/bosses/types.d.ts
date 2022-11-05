interface BossStats {
	bossIds: number[]
	bossHP: Record<string, number[]>
	lapTiers: string[]
	multipliers: Record<string, number[]>
}