import {NamedEntity} from './NamedEntity';
import {ImageService} from '../../app/services/image.service';
import {Player} from './Player';
import {LeagueTeam} from './LeagueTeam';
import {XPCONFIG} from '../../app/app.config';

export class Team
    extends NamedEntity {
    description: string;
    players: Player[] = [];
    leagueTeams: LeagueTeam[] = [];
    imageUrl: string;

    constructor(id: string, name: string) {
        super(id, name);
        this.imageUrl = ImageService.teamDefault();
    }

    static fromJson(json: any): Team {
        let team = new Team(json.id, json.name);
        team.description = json.description;
        team.players = json.players && json.players.map((player) => Player.fromJson(player));
        team.leagueTeams = json.leagueTeams && json.leagueTeams.map((leagueTeam) => LeagueTeam.fromJson(leagueTeam));
        team.imageUrl = json.imageUrl ? (XPCONFIG.baseHref + json.imageUrl) : ImageService.teamDefault();
        return team;
    }

}
