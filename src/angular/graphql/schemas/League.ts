import {ImageService} from '../../app/services/image.service';
import {NamedEntity} from './NamedEntity';
import {Sport, SportUtil} from './Sport';
import {Game} from './Game';
import {LeaguePlayer} from './LeaguePlayer';
import {Player} from './Player';
import {LeagueTeam} from './LeagueTeam';
import {XPCONFIG} from '../../app/app.config';

export class League
    extends NamedEntity {
    sport: Sport;
    description: string;
    config: { [key: string]: any } = {};
    leaguePlayers: LeaguePlayer[];
    leagueTeams: LeagueTeam[];
    nonMemberPlayers: Player[];
    games: Game[];
    imageUrl: string;

    constructor(id: string, name: string) {
        super(id, name);
        this.imageUrl = ImageService.leagueDefault();
    }

    static fromJson(json: any): League {
        let league = new League(json.id, json.name);
        league.sport = SportUtil.parse(json.sport);
        league.description = json.description;
        //TODO Config
        league.leaguePlayers = json.leaguePlayers && json.leaguePlayers.map(leaguePlayer => LeaguePlayer.fromJson(leaguePlayer));
        league.leagueTeams = json.leagueTeams && json.leagueTeams.map(leagueTeam => LeagueTeam.fromJson(leagueTeam));
        league.nonMemberPlayers = json.nonMemberPlayers && json.nonMemberPlayers.map(nonMemberPlayer => Player.fromJson(nonMemberPlayer));
        league.games = json.games && json.games.map(game => Game.fromJson(game));
        league.imageUrl = json.imageUrl ? (XPCONFIG.baseHref + json.imageUrl) : ImageService.leagueDefault();
        return league;
    }
}
