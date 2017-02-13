import {Game} from './Game';
export class Player {

    id: String;
    displayName: String = 'Unknown player';
    nickname: String;
    rating: number = -1;
    previousRating: number = -1;
    games: Game[] = [];

    constructor(displayName: string) {
        if (!displayName) {
            throw new Error('User.displayName can not be null');
        }
        this.displayName = displayName;
    }

    static fromJson(json: any): Player {
        let p = new Player(json.displayName);
        if (json.id) {
            p.id = json.id;
        }
        if (json.nickname) {
            p.nickname = json.nickname;
        }
        if (json.rating) {
            p.rating = json.rating;
        }
        if (json.previousRating) {
            p.previousRating = json.previousRating;
        }
        if (json.games) {
            p.games = json.games.map(game => Game.fromJson(game))
        }
        return p;
    }

}
