import {Player} from './Player';
import {LeagueTeam} from './LeagueTeam';

export class Team {
    id: string;
    name: string = 'Unknown team';
    description: string;
    players: Player[] = [];
    leagueTeams: LeagueTeam[] = [];

    /*    rating: number = -1;
     previousRating: number = -1;*/

    constructor(name: string) {
        if (!name) {
            throw new Error('Team.name can not be null');
        }
        this.name = name;
    }

    static fromJson(json: any): Team {
        let t = new Team(json.name);
        if (json.id) {
            t.id = json.id;
        }
        if (json.description) {
            t.description = json.description;
        }
        if (json.players) {
            t.players = json.players.map(player => Player.fromJson(player));
        }
        if (json.leagueTeams) {
            t.leagueTeams = json.leagueTeams.map(leagueTeam => LeagueTeam.fromJson(leagueTeam));
        }
        return t;
    }

}
