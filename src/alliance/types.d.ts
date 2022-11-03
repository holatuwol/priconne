interface LapBoss {
	lap: number
	index: number
	hp: number
}

type ClanRanking = Record<string, any> & {
	name: string
	rank: number
	score: number
	unitName: string
	unitStars: number
}