import {Component, OnInit, Input, Output, OnChanges, SimpleChanges, SimpleChange, EventEmitter} from '@angular/core';
import {ActivatedRoute, Router, Params} from '@angular/router';
import {Player} from '../../../graphql/schemas/Player';
import {GraphQLService} from '../../graphql.service';
import {GameParameters} from '../GameParameters';
import {League} from '../../../graphql/schemas/League';

@Component({
    selector: 'game-play',
    templateUrl: 'game-play.component.html',
    styleUrls: ['game-play.component.less']
})
export class GamePlayComponent implements OnInit, OnChanges {

    bluePlayer1: Player;
    bluePlayer2: Player;
    redPlayer1: Player;
    redPlayer2: Player;
    league: League;

    blueScore: number = 7;
    redScore: number = 3;

    constructor(private graphQLService: GraphQLService, private route: ActivatedRoute, private router: Router) {

    }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            let gameParams: GameParameters = <GameParameters> params;
            this.loadGameData(gameParams);
        });
    }

    ngOnChanges(changes: SimpleChanges): void {

    }

    onClicked() {

    }

    onSelected(p: Player) {

    }

    private loadGameData(gameParams: GameParameters) {
        let playerIds = [gameParams.bluePlayer1, gameParams.redPlayer1, gameParams.bluePlayer2, gameParams.redPlayer2].filter((p) => !!p);
        this.graphQLService.post(GamePlayComponent.getPlayersLeagueQuery, {playerIds: playerIds, leagueId: gameParams.leagueId}).then(
            data => {
                this.league = League.fromJson(data.league);
                let playerMap: {[id: string]: Player} = {};
                data.players.forEach((p) => playerMap[p.id] = Player.fromJson(p));
                this.bluePlayer1 = playerMap[gameParams.bluePlayer1];
                this.bluePlayer2 = playerMap[gameParams.bluePlayer2];
                this.redPlayer1 = playerMap[gameParams.redPlayer1];
                this.redPlayer2 = playerMap[gameParams.redPlayer2];
            });
    }

    private static readonly getPlayersLeagueQuery = `query ($leagueId: ID!, $playerIds: [ID]!) {
        league(id: $leagueId) {
            id
            name
            description
        }
        
        players(ids: $playerIds) {
            id
            name
            nickname
            nationality
            handedness
            description
        }
    }`;
}
