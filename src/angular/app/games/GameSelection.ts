import {Injectable} from '@angular/core';
import {Player} from '../../graphql/schemas/Player';
import {League} from '../../graphql/schemas/League';

@Injectable()
export class GameSelection {

    bluePlayer1: Player;
    bluePlayer2: Player;
    redPlayer1: Player;
    redPlayer2: Player;
    league: League;
    gameId: string;

    constructor() {
    }

}