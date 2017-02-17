import {Team} from './Team';
import {LeaguePlayer} from './LeaguePlayer';

export enum PlayerHandedness {
    LEFT, RIGTH, AMBIDEXTER
}

export class Player {

    id: string;
    name: string = 'Unknown player';
    nickname: string;
    nationality: string;
    handedness: PlayerHandedness;
    description: string;
    teams: Team[] = [];
    leaguePlayers: LeaguePlayer[] = [];


    /*    rating: number = -1;
     previousRating: number = -1;
     games: Game[] = [];*/

    constructor(name: string) {
        if (!name) {
            throw new Error('Player.name can not be null');
        }
        this.name = name;
    }

    static fromJson(json: any): Player {
        let p = new Player(json.name);
        p.handedness = this.parseHandedness(json.handedness);
        if (json.id) {
            p.id = json.id;
        }
        if (json.nickname) {
            p.nickname = json.nickname;
        }
        if (json.nationality) {
            p.nationality = json.nationality;
        }
        if (json.teams) {
            p.teams = json.teams.map(team => Team.fromJson(team));
        }
        if (json.leaguePlayers) {
            p.leaguePlayers = json.leaguePlayers.map(leaguePlayer => LeaguePlayer.fromJson(leaguePlayer))
        }
        return p;
    }

    private static parseHandedness(value: any): PlayerHandedness {
        if (typeof value === 'string') {
            return PlayerHandedness[value.toUpperCase()];
        }
        return null;
    }

}
