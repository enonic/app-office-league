import {League} from './League';
import {Team} from './Team';

export class LeagueTeam {

    id: string;
    rating: number = -1;
    team: Team;
    league: League;

    constructor(team: Team, league: League) {
        if (!team) {
            throw new Error('LeagueTeam.team can not be null');
        }
        if (!league) {
            throw new Error('LeagueTeam.league can not be null');
        }
        this.team = team;
        this.league = league;
    }

    static fromJson(json: any): LeagueTeam {
        let lp = new LeagueTeam(Team.fromJson(json.team), League.fromJson(json.league));
        if (json.id) {
            lp.id = json.id;
        }
        if (json.rating) {
            lp.rating = json.rating;
        }
        return lp;
    }

}
