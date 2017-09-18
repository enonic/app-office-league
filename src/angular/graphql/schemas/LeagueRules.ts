export class LeagueRules {
    pointsToWin: number = 10;
    halfTimeSwitch: boolean = true;
    minimumDifference: number = 2;

    constructor() {
    }

    static fromJson(json: any): LeagueRules {
        let leagueRules = new LeagueRules();
        leagueRules.pointsToWin = json.pointsToWin || 10;
        leagueRules.halfTimeSwitch = json.halfTimeSwitch == null ? true : json.halfTimeSwitch;
        leagueRules.minimumDifference = json.minimumDifference || 2;
        return leagueRules;
    }
}
