import {Entity} from './Entity';
import {DateUtil} from './DateUtil';
import {Team} from './Team';
import {Side, SideUtil} from './Side';

export class GameTeam extends Entity {
    time: Date;
    score: number;
    scoreAgainst: number;
    side: Side;
    winner: boolean;
    ratingDelta: number;
    team: Team;

    constructor(id: string) {
        super(id);
    }

    static fromJson(json: any) {
        let gameTeam = new GameTeam(json.id);
        gameTeam.time = json.time && DateUtil.parseDate(json.time);
        gameTeam.score = json.score || 0;
        gameTeam.scoreAgainst = json.scoreAgainst || 0;
        gameTeam.side = SideUtil.parse(json.side);
        gameTeam.winner = json.winner;
        gameTeam.ratingDelta = json.ratingDelta;
        gameTeam.team = json.team && Team.fromJson(json.team);
        return gameTeam;
    }
}