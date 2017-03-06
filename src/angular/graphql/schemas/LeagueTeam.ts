import {Entity} from './Entity';
import {Team} from './Team';
import {League} from './League';


export class LeagueTeam extends Entity {
    rating: number;
    ranking: number;
    team: Team;
    league: League;

    constructor(id: string) {
        super(id);
    }

    static fromJson(json: any): LeagueTeam {
        let leagueTeam = new LeagueTeam(json.id);
        leagueTeam.rating = json.rating;
        leagueTeam.ranking = json.ranking;
        leagueTeam.team = json.team && Team.fromJson(json.team);
        leagueTeam.league = json.league && League.fromJson(json.league);
        return leagueTeam;
    }
}
