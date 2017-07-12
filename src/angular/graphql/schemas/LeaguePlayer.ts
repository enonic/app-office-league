import {Entity} from './Entity';
import {Player} from './Player';
import {League} from './League';
import {GamePlayer} from './GamePlayer';


export class LeaguePlayer
    extends Entity {
    rating: number;
    ranking: number;
    player: Player;
    league: League;
    pending: boolean;
    gamePlayers: GamePlayer[] = [];

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
        if (json.gamePlayers) {
            leaguePlayer.gamePlayers = json.gamePlayers.map(gamePlayer => GamePlayer.fromJson(gamePlayer));
        } else {
            leaguePlayer.gamePlayers = [];
        }
        return leaguePlayer;
    }
}
