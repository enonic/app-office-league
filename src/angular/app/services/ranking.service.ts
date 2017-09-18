import {Injectable} from '@angular/core';
import {LeagueRules} from '../../graphql/schemas/LeagueRules';

@Injectable()
export class RankingService {

    constructor() {
    }

    getExpectedScore(ratings: [number, number], opponentRatings: [number, number], rules: LeagueRules): [number, number] {
        let rating = this.averageRatings(ratings);
        let opponentRating = this.averageRatings(opponentRatings);
        let score = this.calculateExpectedScore(rating, opponentRating, rules);
        return this.scoreToGoals(score, rules);
    }

    defaultRating(): number {
        return 1500;
    }

    private scoreToGoals(score: number, rules: LeagueRules): [number, number] {
        let pointsToWin = rules.pointsToWin;
        let diff = (score * pointsToWin * 2) - pointsToWin;
        if (diff > 0) {
            return [pointsToWin, this.round(pointsToWin - diff)];
        } else {
            return [this.round(pointsToWin + diff), pointsToWin];
        }
    }

    private round(value: number): number {
        return Math.round(value * 10) / 10;
    }

    private calculateExpectedScore(rating: number, opponentRating: number, rules: LeagueRules): number {
        return 1.0 / (1.0 + Math.pow(rules.pointsToWin, (opponentRating - rating) / 400.0));
    }

    private averageRatings(ratings: [number, number]): number {
        return ratings[1] ? (ratings[0] + ratings[1]) / 2 : ratings[0];
    }

}
