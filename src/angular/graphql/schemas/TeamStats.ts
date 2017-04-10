export class TeamStats {

    gameCount: number = 0;
    winningGameCount: number = 0;
    goalCount: number = 0;
    winningPercent: number = 0;
    goalsPerGame: number = 0;

    constructor() {
    }

    static fromJson(json: any): TeamStats {
        let teamStats = new TeamStats();
        teamStats.gameCount = json.gameCount || 0;
        teamStats.winningGameCount = json.winningGameCount || 0;
        teamStats.goalCount = json.goalCount || 0;

        teamStats.winningPercent = teamStats.gameCount === 0 ? 0 : teamStats.winningGameCount / teamStats.gameCount;
        teamStats.goalsPerGame = teamStats.gameCount === 0 ? 0 : teamStats.goalCount / teamStats.gameCount;
        return teamStats;
    }
}
