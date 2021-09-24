import {NamedEntity} from './NamedEntity';
import {ImageService} from '../../app/services/image.service';
import {Handedness, HandednessUtil} from './Handedness';
import {Team} from './Team';
import {LeaguePlayer} from './LeaguePlayer';
import {UrlHelper} from './UrlHelper';
import {PlayerStats} from './PlayerStats';

declare var XPCONFIG: any;

export class Player
    extends NamedEntity {
    fullname: string;
    nationality: string;
    handedness: Handedness;
    description: string;
    teams: Team[] = [];
    leaguePlayers: LeaguePlayer[] = [];
    imageUrl: string;
    email: string;
    stats: PlayerStats;

    constructor(id: string, name: string) {
        super(id, name);
        this.imageUrl = ImageService.playerDefault();
    }

    static fromJson(json: any): Player {
        let player = new Player(json.id, json.name);
        player.fullname = json.fullname || '';
        player.nationality = json.nationality;
        player.handedness = HandednessUtil.parse(json.handedness);
        player.description = json.description;
        player.teams = json.teams ? json.teams.map((team) => Team.fromJson(team)) : [];
        if (json.leaguePlayers) {
            player.leaguePlayers = json.leaguePlayers.map((leaguePlayer) => LeaguePlayer.fromJson(leaguePlayer));
        } else if (json.leaguePlayer) {
            player.leaguePlayers = [LeaguePlayer.fromJson(json.leaguePlayer)];
        } else {
            player.leaguePlayers = [];
        }
        player.imageUrl = json.imageUrl ? (UrlHelper.trimSlash(XPCONFIG.baseHref) + json.imageUrl) : ImageService.playerDefault();
        player.email = json.email || '';
        player.stats = json.stats ? PlayerStats.fromJson(json.stats) : null;
        return player;
    }
}
