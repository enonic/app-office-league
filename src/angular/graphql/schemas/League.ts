import {ImageService} from '../../app/image.service';
import {Game} from './Game';
import {LeaguePlayer} from './LeaguePlayer';
import {LeagueTeam} from './LeagueTeam';

export enum LeagueSport {
    FOOS, TENNIS, DARTS
}

export class League {
    name: string;
    id: string;
    sport: LeagueSport = LeagueSport.FOOS;
    imageUrl: string;
    description: string;
    config: {[key: string]: string|number} = {};
    leaguePlayers: LeaguePlayer[];
    leagueTeams: LeagueTeam[];
    games: Game[];

    constructor(name: string) {
        if (!name) {
            throw new Error('League.name can not be null');
        }
        this.name = name;
        this.imageUrl = ImageService.forLeague(name);
    }

    static fromJson(json: any): League {
        let l = new League(json.name);
        l.sport = League.parseSport(json.sport);
        if (json.description) {
            l.description = json.description;
        }
        if (json.id) {
            l.id = json.id;
        }
        if (json.leaguePlayers && json.leaguePlayers.length > 0) {
            l.leaguePlayers = json.leaguePlayers.map(player => LeaguePlayer.fromJson(player));
        }
        if (json.leagueTeams && json.leagueTeams.length > 0) {
            l.leagueTeams = json.leagueTeams.map(team => LeagueTeam.fromJson(team));
        }
        if (json.games && json.games.length > 0) {
            l.games = json.games.map(game => Game.fromJson(game));
        }
        return l;
    }

    private static parseSport(value: any): LeagueSport {
        if (typeof value === 'string') {
            return LeagueSport[value.toUpperCase()];
        }
        return null;
    }
}
