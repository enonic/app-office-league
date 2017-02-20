import {ImageService} from '../../app/image.service';
import {NamedEntity} from './NamedEntity';
import {Game} from './Game';
import {LeaguePlayer} from './LeaguePlayer';
import {LeagueTeam} from './LeagueTeam';

export enum LeagueSport {
    FOOS
}

export class League extends NamedEntity {
    sport: LeagueSport;
    description: string;
    config: {[key: string]: any} = {};
    leaguePlayers: LeaguePlayer[];
    leagueTeams: LeagueTeam[];
    games: Game[];
    imageUrl: string;

    constructor(id: string, name: string) {
        super(id, name);
        this.imageUrl = ImageService.forLeague(name);
    }

    static fromJson(json: any): League {
        let league = new League(json.id, json.name);
        league.sport = League.parseSport(json.sport);
        league.description = json.description;
        //TODO Config
        league.leaguePlayers = json.leaguePlayers && json.leaguePlayers.map(leaguePlayer => LeaguePlayer.fromJson(leaguePlayer));
        league.leagueTeams = json.leagueTeams && json.leagueTeams.map(leagueTeam => LeagueTeam.fromJson(leagueTeam));
        league.games = json.games && json.games.map(game => Game.fromJson(game));
        return league;
    }

    private static parseSport(value: any): LeagueSport {
        if (typeof value === 'string') {
            return LeagueSport[value.toUpperCase()];
        }
        return null;
    }
}
