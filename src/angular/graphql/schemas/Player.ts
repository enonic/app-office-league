import {NamedEntity} from './NamedEntity';
import {Handedness, HandednessUtil} from './Handedness';
import {Team} from './Team';
import {LeaguePlayer} from './LeaguePlayer';


export class Player extends NamedEntity {
    nickname: string;
    nationality: string;
    handedness: Handedness;
    description: string;
    teams: Team[] = [];
    leaguePlayers: LeaguePlayer[] = [];

    constructor(id: string, name: string) {
        super(id, name);
    }

    static fromJson(json: any): Player {
        let player = new Player(json.id, json.name);
        player.nickname = json.nickname;
        player.nationality = json.nationality;
        player.handedness = HandednessUtil.parse(json.handedness);
        player.description = json.description;
        player.description = json.teams && json.teams.map((team) => Team.fromJson(team));
        return player;
    }
}
