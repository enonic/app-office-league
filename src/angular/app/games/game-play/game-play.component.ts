import {Component, OnInit, Input, Output, OnChanges, SimpleChanges, SimpleChange, EventEmitter} from '@angular/core';
import {ActivatedRoute, Router, Params} from '@angular/router';
import {Player} from '../../../graphql/schemas/Player';
import {GraphQLService} from '../../graphql.service';
import {GameParameters} from '../GameParameters';
import {League} from '../../../graphql/schemas/League';
import {Point} from '../../../graphql/schemas/Point';

enum GameState {
    NotStarted, Playing, Paused, Finished
}

enum TeamSide {
    Red, Blue
}

@Component({
    selector: 'game-play',
    templateUrl: 'game-play.component.html',
    styleUrls: ['game-play.component.less']
})
export class GamePlayComponent implements OnInit {

    bluePlayer1: Player;
    bluePlayer2: Player;
    redPlayer1: Player;
    redPlayer2: Player;
    league: League;
    points: Point[];

    blueScore: number = 0;
    redScore: number = 0;
    startTime: Date;
    elapsedTime: string;
    timerId: number;
    gameState: GameState = GameState.NotStarted;


    constructor(private graphQLService: GraphQLService, private route: ActivatedRoute, private router: Router) {

    }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            let gameParams: GameParameters = <GameParameters> params;
            this.loadGameData(gameParams).then(() => this.startGame());
        });
    }

    onClicked(p: Player) {
        if (this.gameState !== GameState.Playing) {
            return;
        }
        console.log('Player selected: ' + p.name, TeamSide[this.getPlayerSide(p)]);
        this.handlePointScored(p);
    }

    private startGame() {
        this.blueScore = 0;
        this.redScore = 0;
        this.startTime = new Date();
        this.elapsedTime = '';
        this.gameState = GameState.Playing;
        this.points = [];
        this.updateElapsedTime();
        this.startGameTimer();
    }

    private pauseGame() {
        this.gameState = GameState.Paused;
        this.updateElapsedTime();
    }

    private handlePointScored(p: Player) {
        let now = new Date();
        let side = this.getPlayerSide(p);
        let point = new Point();
        point.player = p;
        point.time = this.getElapsedSeconds(now);
        point.against = false;
        this.points.push(point);

        if (side === TeamSide.Red) {
            this.redScore++;
        } else {
            this.blueScore++;
        }

        if (this.hasGameEnded()) {
            this.stopGameTimer();
            this.gameState = GameState.Finished;
            this.createGame().then((gameId) => {
                console.log('Game created: ' + gameId);
                this.router.navigate(['games', gameId]);
            });
        }
    }

    private hasGameEnded(): boolean {
        return (this.blueScore >= 10 || this.redScore >= 10) && Math.abs(this.blueScore - this.redScore) >= 2;
    }

    private loadGameData(gameParams: GameParameters) {
        let playerIds = [gameParams.bluePlayer1, gameParams.redPlayer1, gameParams.bluePlayer2, gameParams.redPlayer2].filter((p) => !!p);
        return this.graphQLService.post(GamePlayComponent.getPlayersLeagueQuery,
            {playerIds: playerIds, leagueId: gameParams.leagueId}).then(
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

    private createGame(): Promise<string> {
        let players = [this.bluePlayer1, this.redPlayer1, this.bluePlayer2, this.redPlayer2].filter((p) => !!p).map((p) => {
            return {"playerId": p.id, "side": TeamSide[this.getPlayerSide(p)].toLowerCase()};
        });
        let points = this.points.map((p) => {
            return {time: p.time, playerId: p.player.id, against: p.against}
        });
        return this.graphQLService.post(GamePlayComponent.createGameMutation,
            {leagueId: this.league.id, points: points, players: players}).then(
            data => {
                console.log('Game created', data);
                return data.createGame.id;
            });
    }

    private startGameTimer() {
        window.clearInterval(this.timerId);
        this.timerId = window.setInterval(() => this.updateElapsedTime(), 1000);
    }

    private stopGameTimer() {
        window.clearInterval(this.timerId);
    }

    private updateElapsedTime() {
        if (this.gameState === GameState.NotStarted) {
            this.elapsedTime = '';
        } else {
            this.elapsedTime = this.formatTimeDiff(this.startTime, new Date());
        }
    }

    private getElapsedSeconds(t: Date): number {
        return Math.abs(t.getTime() - this.startTime.getTime());
    }

    private formatTimeDiff(from: Date, to: Date) {
        let delta = Math.abs(to.getTime() - from.getTime()) / 1000;
        let days = Math.floor(delta / 86400);
        delta -= days * 86400;
        let hours = Math.floor(delta / 3600) % 24;
        delta -= hours * 3600;
        let minutes = Math.floor(delta / 60) % 60;
        delta -= minutes * 60;
        let seconds = Math.floor(delta % 60);

        let hoursStr = (hours < 10) ? "0" + String(hours) : String(hours);
        let minutesStr = (minutes < 10) ? "0" + String(minutes) : String(minutes);
        let secondsStr = (seconds < 10) ? "0" + String(seconds) : String(seconds);
        return (hoursStr === '00') ? minutesStr + ':' + secondsStr : hoursStr + ':' + minutesStr + ':' + secondsStr;
    };

    private getPlayerSide(p: Player): TeamSide {
        if (p.id === this.bluePlayer1.id || (this.bluePlayer2 && (p.id === this.bluePlayer2.id))) {
            return TeamSide.Blue;
        }
        if (p.id === this.redPlayer1.id || (this.redPlayer2 && (p.id === this.redPlayer2.id))) {
            return TeamSide.Red;
        }
        return null;
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

    private static readonly createGameMutation = `mutation ($leagueId: ID!, $points: [PointCreation], $players: [GamePlayerCreation]!) {
        createGame(leagueId: $leagueId, points: $points, gamePlayers: $players) {
            id
        }
    }`;

}
