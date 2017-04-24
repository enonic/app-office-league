import {Entity} from './Entity';
import {Player} from './Player';
import {League} from './League';


export class LeaguePlayer
    extends Entity {
    rating: number;
    ranking: number;
    player: Player;
    league: League;
    pending: boolean;

    constructor(id: string) {
        super(id);
    }

    static fromJson(json: any): LeaguePlayer {
        let leaguePlayer = new LeaguePlayer(json.id);
        leaguePlayer.rating = json.rating;
        leaguePlayer.ranking = json.ranking;
        leaguePlayer.pending = json.pending || false;
        leaguePlayer.player = json.player && Player.fromJson(json.player);
        leaguePlayer.league = json.league && League.fromJson(json.league);
        return leaguePlayer;
    }
}
