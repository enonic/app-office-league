import {NamedEntity} from './NamedEntity';
import {ImageService} from '../../app/services/image.service';
import {Handedness, HandednessUtil} from './Handedness';
import {Team} from './Team';
import {LeaguePlayer} from './LeaguePlayer';
import {XPCONFIG} from '../../app/app.config';

export class Player
    extends NamedEntity {
    nickname: string;
    nationality: string;
    handedness: Handedness;
    description: string;
    teams: Team[] = [];
    leaguePlayers: LeaguePlayer[] = [];
    imageUrl: string;

    constructor(id: string, name: string) {
        super(id, name);
        this.imageUrl = ImageService.playerDefault();
    }

    static fromJson(json: any): Player {
        let player = new Player(json.id, json.name);
        player.nickname = json.nickname;
        player.nationality = json.nationality;
        player.handedness = HandednessUtil.parse(json.handedness);
        player.description = json.description;
        player.teams = json.teams ? json.teams.map((team) => Team.fromJson(team)) : [];
        player.leaguePlayers = json.leaguePlayers ? json.leaguePlayers.map((leaguePlayer) => LeaguePlayer.fromJson(leaguePlayer)) : [];
        player.imageUrl = json.imageUrl ? (XPCONFIG.baseHref + json.imageUrl) : ImageService.playerDefault();
        return player;
    }
}
