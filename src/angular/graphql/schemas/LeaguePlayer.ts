import {Player} from './Player';
import {League} from './League';


export class LeaguePlayer {

    id: string;
    rating: number = -1;
    player: Player;
    league: League;

    constructor(player: Player, league: League) {
        if (!player) {
            throw new Error('LeaguePlayer.player can not be null');
        }
        if (!league) {
            throw new Error('LeaguePlayer.league can not be null');
        }
        this.player = player;
        this.league = league;
    }

    static fromJson(json: any): LeaguePlayer {
        let lp = new LeaguePlayer(Player.fromJson(json.player), League.fromJson(json.league));
        if (json.id) {
            lp.id = json.id;
        }
        if (json.rating) {
            lp.rating = json.rating;
        }
        return lp;
    }

}
