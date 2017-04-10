export class PlayerStats {

    gameCount: number = 0;
    winningGameCount: number = 0;
    goalCount: number = 0;
    winningPercent: number = 0;
    goalsPerGame: number = 0;

    constructor() {
    }

    static fromJson(json: any): PlayerStats {
        let playerStats = new PlayerStats();
        playerStats.gameCount = json.gameCount || 0;
        playerStats.winningGameCount = json.winningGameCount || 0;
        playerStats.goalCount = json.goalCount || 0;

        playerStats.winningPercent = playerStats.gameCount === 0 ? 0 : playerStats.winningGameCount / playerStats.gameCount;
        playerStats.goalsPerGame = playerStats.gameCount === 0 ? 0 : playerStats.goalCount / playerStats.gameCount;
        return playerStats;
    }
}
