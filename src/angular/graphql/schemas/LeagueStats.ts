export class LeagueStats {

    gameCount: number = 0;
    playerCount: number = 0;
    teamCount: number = 0;

    constructor() {
    }

    static fromJson(json: any): LeagueStats {
        let league = new LeagueStats();
        league.gameCount = json.gameCount || 0;
        league.playerCount = json.playerCount || 0;
        league.teamCount = json.teamCount || 0;
        return league;
    }
}
