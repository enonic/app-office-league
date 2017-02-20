import {NamedEntity} from './NamedEntity';
import {Player} from './Player';
import {LeagueTeam} from './LeagueTeam';

export class Team extends NamedEntity {
    description: string;
    players: Player[] = [];
    leagueTeams: LeagueTeam[] = [];

    constructor(id: string, name: string) {
        super(id, name);
    }

    static fromJson(json: any): Team {
        let team = new Team(json.id, json.name);
        team.description = json.description;
        team.players = json.players && json.players.map((player) => Player.fromJson(player));
        team.leagueTeams = json.leagueTeams && json.leagueTeams.map((leagueTeam) => LeagueTeam.fromJson(leagueTeam));
        return team;
    }

}
