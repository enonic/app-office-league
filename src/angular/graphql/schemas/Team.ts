import {Player} from './Player';

export class Team {
    id: String;
    displayName: String = 'Unknown team';
    players: Player[] = [];
    rating: number = -1;
    previousRating: number = -1;

    constructor(displayName: String) {
        if (!displayName) {
            throw new Error('Team.id can not be null');
        }
        this.displayName = displayName;
    }

    static fromJson(json: any): Team {
        let t = new Team(json.displayName);
        if (json.id) {
            t.id = json.id;
        }
        if (json.players) {
            t.players = json.players.map(player => Player.fromJson(player));
        }
        if (json.rating) {
            t.rating = json.rating;
        }
        if (json.previousRating) {
            t.previousRating = json.previousRating;
        }
        return t;
    }

}
