import {PlayerResult} from './PlayerResult';
import {Goal} from './Goal';

export class Game {
    id: String;
    displayName: String = "Unknown game";
    date: Date = new Date();//(Format YYYY-MM-DD)
    winners: PlayerResult[] = [];// 1 or 2
    losers: PlayerResult[] = []; // 1 or 2
    goals: Goal[] = [];   //Optional

    constructor(displayName: String) {
        if (!displayName) {
            throw new Error('Game.id can not be null');
        }
        this.displayName = displayName;
    }

    static fromJson(json: any): Game {
        let g = new Game(json.displayName);
        if (json.date) {
            let from = json.date.split("-");
            g.date = new Date(from[0], from[1] - 1, from[2]);
        }
        if (json.id) {
            g.id = json.id;
        }
        if (json.winners && json.winners.length > 0) {
            g.winners = json.winners.map(winner => PlayerResult.fromJson(winner));
        }
        if (json.losers && json.losers.length > 0) {
            g.losers = json.losers.map(loser => PlayerResult.fromJson(loser));
        }
        if (json.goals && json.goals.length > 0) {
            g.goals = json.goals.map(goal => Goal.fromJson(goal));
        }
        return g;
    }
}
