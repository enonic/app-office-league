import {NamedEntity} from './NamedEntity';
import {ImageService} from '../../app/services/image.service';
import {Player} from './Player';
import {LeagueTeam} from './LeagueTeam';
import {UrlHelper} from './UrlHelper';
import {TeamStats} from './TeamStats';

declare var XPCONFIG: any;

export class Team
    extends NamedEntity {
    description: string;
    players: Player[] = [];
    leagueTeams: LeagueTeam[] = [];
    imageUrl: string;
    stats: TeamStats;

    constructor(id: string, name: string) {
        super(id, name);
        this.imageUrl = ImageService.teamDefault();
    }

    static fromJson(json: any): Team {
        let team = new Team(json.id, json.name);
        team.description = json.description;
        team.players = json.players && json.players.map((player) => Player.fromJson(player));
        team.leagueTeams = json.leagueTeams && json.leagueTeams.map((leagueTeam) => LeagueTeam.fromJson(leagueTeam));
        team.imageUrl = json.imageUrl ? (UrlHelper.trimSlash(XPCONFIG.baseHref) + json.imageUrl) : ImageService.teamDefault();
        team.stats = json.stats ? TeamStats.fromJson(json.stats) : null;
        return team;
    }

}
