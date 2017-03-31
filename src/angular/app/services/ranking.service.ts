import {Injectable} from '@angular/core';

@Injectable()
export class RankingService {

    constructor() {
    }

    getExpectedScore(ratings: [number, number], opponentRatings: [number, number]): [number, number] {
        let rating = this.averageRatings(ratings);
        let opponentRating = this.averageRatings(opponentRatings);
        let score = this.calculateExpectedScore(rating, opponentRating);
        return this.scoreToGoals(score);
    }

    defaultRating(): number {
        return 1500;
    }

    private scoreToGoals(score: number): [number, number] {
        let diff = (score * 20) - 10;
        if (diff > 0) {
            return [10, this.round(10 - diff)];
        } else {
            return [this.round(10 + diff), 10];
        }
    }

    private round(value: number): number {
        return Math.round(value * 10) / 10;
    }

    private calculateExpectedScore(rating: number, opponentRating: number): number {
        return 1.0 / (1.0 + Math.pow(10.0, (opponentRating - rating) / 400.0));
    }

    private averageRatings(ratings: [number, number]): number {
        return ratings[1] ? (ratings[0] + ratings[1]) / 2 : ratings[0];
    }

}
