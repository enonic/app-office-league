import {ImageService} from '../../app/services/image.service';
import {NamedEntity} from './NamedEntity';
import {Sport, SportUtil} from './Sport';
import {Game} from './Game';
import {LeaguePlayer} from './LeaguePlayer';
import {Player} from './Player';
import {LeagueTeam} from './LeagueTeam';
import {UrlHelper} from './UrlHelper';
import {LeagueStats} from './LeagueStats';
import {LeagueRules} from './LeagueRules';

declare var XPCONFIG: any;

export class League
    extends NamedEntity {
    sport: Sport;
    description: string;
    config: { [key: string]: any } = {};
    leaguePlayers: LeaguePlayer[];
    leagueTeams: LeagueTeam[];
    nonMemberPlayers: Player[];
    games: Game[];
    adminPlayers: Player[];
    imageUrl: string;
    stats: LeagueStats;
    rules: LeagueRules;

    constructor(id: string, name: string) {
        super(id, name);
        this.imageUrl = ImageService.leagueDefault();
    }

    static fromJson(json: any): League {
        let league = new League(json.id, json.name);
        league.sport = SportUtil.parse(json.sport);
        league.description = json.description;
        league.leaguePlayers = json.leaguePlayers && json.leaguePlayers.map(leaguePlayer => LeaguePlayer.fromJson(leaguePlayer));
        league.leagueTeams = json.leagueTeams && json.leagueTeams.map(leagueTeam => LeagueTeam.fromJson(leagueTeam));
        league.nonMemberPlayers = json.nonMemberPlayers && json.nonMemberPlayers.map(nonMemberPlayer => Player.fromJson(nonMemberPlayer));
        league.games = json.games && json.games.map(game => Game.fromJson(game));
        league.imageUrl = json.imageUrl ? (UrlHelper.trimSlash(XPCONFIG.baseHref) + json.imageUrl) : ImageService.leagueDefault();
        league.stats = json.stats ? LeagueStats.fromJson(json.stats) : null;
        league.adminPlayers = json.adminPlayers ? json.adminPlayers.map(p => Player.fromJson(p)) : [];
        league.rules = json.rules ? LeagueRules.fromJson(json.rules) : new LeagueRules();
        return league;
    }
}
