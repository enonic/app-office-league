import {
    Component,
    OnInit,
    Input,
    Output,
    OnChanges,
    SimpleChanges,
    SimpleChange,
    EventEmitter,
    ElementRef,
    AfterViewInit,
    HostListener
} from '@angular/core';
import {ActivatedRoute, Router, Params} from '@angular/router';
import {Player} from '../../../graphql/schemas/Player';
import {GraphQLService} from '../../graphql.service';
import {GameParameters} from '../GameParameters';
import {League} from '../../../graphql/schemas/League';
import {Point} from '../../../graphql/schemas/Point';
import {XPCONFIG} from '../../app.config';
import {Side, SideUtil} from '../../../graphql/schemas/Side';

enum GameState {
    NotStarted, Playing, Paused, Finished
}

enum PlayerPosition {
    Blue1, Blue2, Red1, Red2
}

@Component({
    selector: 'game-play',
    templateUrl: 'game-play.component.html',
    styleUrls: ['game-play.component.less']
})
export class GamePlayComponent implements OnInit, AfterViewInit {

    bluePlayer1: Player;
    bluePlayer2: Player;
    redPlayer1: Player;
    redPlayer2: Player;
    league: League;
    points: Point[];
    gameId: string;
    onlineMode: boolean;

    blueScore: number = 0;
    redScore: number = 0;
    baseTime: Date;
    secondsBeforePause: number;
    elapsedTime: string;
    timerId: number;
    gameState: GameState = GameState.NotStarted;
    showPlay: boolean;
    showUndo: boolean;

    playerSelected: PlayerPosition;

    nameClassesBlue1: {} = {selected: false, unselected: false};
    nameClassesBlue2: {} = {selected: false, unselected: false};
    nameClassesRed1: {} = {selected: false, unselected: false};
    nameClassesRed2: {} = {selected: false, unselected: false};
    nameClassesField: {} = {enabled: false};
    nameClassesGamePlay: {} = {};
    nameClassesGamePlayScoreBlue: {} = {};
    nameClassesGamePlayScoreRed: {} = {};
    nameClassesGamePlayCommentator: {} = {};

    constructor(private graphQLService: GraphQLService, private route: ActivatedRoute, private router: Router, private elRef: ElementRef) {
    }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            let gameParams: GameParameters = <GameParameters> params;
            this.loadGameData(gameParams).then(() => this.startGame());
        });
    }

    ngAfterViewInit() {
        setTimeout(() => this.handleResize(), 500);
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.handleResize();
    }

    onPlayerClicked(p: Player) {
        if (this.gameState === GameState.Paused && this.playerSelected === this.getPlayerPosition(p)) {
            this.unselectAll();
            this.resumeGame();
            return;
        }
        if (this.gameState !== GameState.Playing) {
            return;
        }

        this.pauseGame();

        this.playerSelected = this.getPlayerPosition(p);
        this.nameClassesBlue1['selected'] = this.playerSelected === PlayerPosition.Blue1;
        this.nameClassesBlue2['selected'] = this.playerSelected === PlayerPosition.Blue2;
        this.nameClassesRed1['selected'] = this.playerSelected === PlayerPosition.Red1;
        this.nameClassesRed2['selected'] = this.playerSelected === PlayerPosition.Red2;
        this.nameClassesBlue1['unselected'] = this.playerSelected !== PlayerPosition.Blue1;
        this.nameClassesBlue2['unselected'] = this.playerSelected !== PlayerPosition.Blue2;
        this.nameClassesRed1['unselected'] = this.playerSelected !== PlayerPosition.Red1;
        this.nameClassesRed2['unselected'] = this.playerSelected !== PlayerPosition.Red2;

        this.nameClassesField['enabled'] = true;

        this.nameClassesGamePlay['game-play--player-clicked'] = true;
    }

    private unselectAll() {
        this.nameClassesBlue1['selected'] = false;
        this.nameClassesBlue2['selected'] = false;
        this.nameClassesRed1['selected'] = false;
        this.nameClassesRed2['selected'] = false;
        this.nameClassesBlue1['unselected'] = false;
        this.nameClassesBlue2['unselected'] = false;
        this.nameClassesRed1['unselected'] = false;
        this.nameClassesRed2['unselected'] = false;
        this.nameClassesField['enabled'] = false;

        this.nameClassesGamePlay['game-play--player-clicked'] = false;
    }

    onPauseClicked() {
        this.unselectAll();
        this.pauseGame();
    }

    onPlayClicked() {
        this.unselectAll();
        this.resumeGame();
    }

    onUndoClicked() {

    }

    onGameTimeClicked() {
        this.unselectAll();

        if (this.gameState === GameState.Paused) {
            this.resumeGame();
        }
        else {
            this.pauseGame();
        }

    }

    onBlueFieldClick() {
        if (this.gameState !== GameState.Paused || (this.playerSelected == null)) {
            return;
        }

        const p = this.getPlayerByPosition(this.playerSelected);
        const blueTeamScoring = this.playerSelected === PlayerPosition.Blue1 || this.playerSelected === PlayerPosition.Blue2;
        this.handlePointScored(p, blueTeamScoring);
        this.unselectAll();
        this.resumeGame();
    }

    onRedFieldClick() {
        if (this.gameState !== GameState.Paused || (this.playerSelected == null)) {
            return;
        }

        const p = this.getPlayerByPosition(this.playerSelected);
        const redTeamScoring = this.playerSelected === PlayerPosition.Red1 || this.playerSelected === PlayerPosition.Red2;
        this.handlePointScored(p, redTeamScoring);
        this.unselectAll();
        this.resumeGame();
    }

    private startGame() {
        this.blueScore = 0;
        this.redScore = 0;
        this.baseTime = new Date();
        this.secondsBeforePause = 0;
        this.elapsedTime = '';
        this.gameState = GameState.Playing;
        if (this.gameId && this.points) {
            this.replayPoints();
            this.secondsBeforePause = this.points.length > 0 ? this.points[this.points.length - 1].time : 0;
        } else {
            this.points = [];
        }

        this.updateElapsedTime();
        this.startGameTimer();

        if (!this.gameId) {
            this.createGame().then((gameId) => {
                console.log('Initial game created: ' + gameId);
                this.gameId = gameId;
                this.onlineMode = true;
            }).catch((ex) => {
                console.log('Could not create game. Offline mode On.');
                this.onlineMode = false;
            });
        }
    }

    private pauseGame() {
        this.gameState = GameState.Paused;
        this.showPlay = true;
        this.stopGameTimer();

        this.secondsBeforePause = this.getElapsedSeconds(new Date());
        this.baseTime = null;
        this.updateElapsedTime();
    }

    private resumeGame() {
        this.gameState = GameState.Playing;
        this.showPlay = false;

        this.nameClassesField['paused'] = false;

        this.baseTime = new Date();
        this.updateElapsedTime();
        this.startGameTimer();
    }

    private scoreGoal(team: string) {
        if (team === 'blue') {
            this.nameClassesGamePlayScoreBlue['game-play__blue-score--goal'] = true;
            this.blueScore++;
            setTimeout(() => {
                this.nameClassesGamePlayScoreBlue['game-play__blue-score--goal'] = false;
            }, 2000);
        }
        else {
            this.nameClassesGamePlayScoreRed['game-play__red-score--goal'] = true;
            this.redScore++;
            setTimeout(() => {
                this.nameClassesGamePlayScoreRed['game-play__red-score--goal'] = false;
            }, 2000);
        }

        this.nameClassesGamePlayCommentator['game-play__commentator--active'] = true;
        setTimeout(() => {
            this.nameClassesGamePlayCommentator['game-play__commentator--active'] = false;
        }, 2000);
    }

    private handlePointScored(p: Player, against: boolean) {
        let now = new Date();
        let side = this.getPlayerSide(p);
        let point = new Point();
        point.player = p;
        point.time = this.getElapsedSeconds(now);
        point.against = against;
        this.points.push(point);

        if (side === Side.RED) {
            if (against) {
                this.scoreGoal('blue');
                //this.blueScore++;
            } else {
                this.scoreGoal('red');
                //this.redScore++;
            }
        } else {
            if (against) {
                this.scoreGoal('red');
                //this.redScore++;
            } else {
                this.scoreGoal('blue');
                //this.blueScore++;
            }
        }

        if (this.hasGameEnded()) {
            this.stopGameTimer();
            this.gameState = GameState.Finished;
            this.saveGame().then((gameId) => {
                console.log('Game created: ' + gameId);
                this.router.navigate(['games', gameId]);
            }).catch((ex) => {
                console.warn('Could not save final game. TODO: Save data in local storage');
                this.onlineMode = false;
            });
        } else {
            this.saveGame().then((gameId) => {
                // TODO show point feedback
            }).catch((ex) => {
                console.log('Could not update game. Offline mode On.');
                this.onlineMode = false;
            });
        }
    }

    private hasGameEnded(): boolean {
        return (this.blueScore >= 10 || this.redScore >= 10) && Math.abs(this.blueScore - this.redScore) >= 2;
    }

    private loadGameData(gameParams: GameParameters) {
        if (gameParams.gameId) {
            // load existing game data
            return this.graphQLService.post(GamePlayComponent.getGamePlayersLeagueQuery,
                {gameId: gameParams.gameId}).then(
                data => {
                    this.gameId = gameParams.gameId;
                    this.league = League.fromJson(data.game.league);
                    let playerMap: {[id: string]: Player} = {};

                    data.game.gamePlayers.forEach((gp) => {
                        const p = Player.fromJson(gp.player);
                        playerMap[p.id] = p;
                        const side = SideUtil.parse(gp.side);
                        if (side === Side.BLUE) {
                            if (this.bluePlayer1) {
                                this.bluePlayer2 = p;
                            } else {
                                this.bluePlayer1 = p;
                            }
                        } else if (side === Side.RED) {
                            if (this.redPlayer1) {
                                this.redPlayer2 = p;
                            } else {
                                this.redPlayer1 = p;
                            }
                        }
                    });

                    this.points = [];
                    data.game.points.map((p) => {
                        const point = new Point();
                        point.time = p.time;
                        point.against = p.against;
                        point.player = playerMap[p.player.id];
                        this.points.push(point);
                    });
                });
        }

        // load league and players for new game
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

    private saveGame(): Promise<string> {
        if (this.gameId) {
            return this.updateGame();
        } else {
            return this.createGame();
        }
    }

    private buildSaveGameParams(): {[key: string]: any} {
        let players = [this.bluePlayer1, this.redPlayer1, this.bluePlayer2, this.redPlayer2].filter((p) => !!p).map((p) => {
            return {"playerId": p.id, "side": Side[this.getPlayerSide(p)].toLowerCase()};
        });
        let points = this.points.map((p) => {
            return {time: p.time, playerId: p.player.id, against: p.against}
        });
        return {points: points, players: players};
    }

    private createGame(): Promise<string> {
        let createGameParams = this.buildSaveGameParams();
        createGameParams['leagueId'] = this.league.id;
        return this.graphQLService.post(GamePlayComponent.createGameMutation, createGameParams).then(
            data => {
                console.log('Game created', data);
                return data.createGame.id;
            });
    }

    private updateGame(): Promise<string> {
        let updateGameParams = this.buildSaveGameParams();
        updateGameParams['gameId'] = this.gameId;
        return this.graphQLService.post(GamePlayComponent.updateGameMutation, updateGameParams).then(
            data => {
                console.log('Game updated', data);
                return data.updateGame.id;
            });
    }

    private replayPoints() {
        this.blueScore = 0;
        this.redScore = 0;
        this.points.forEach((point) => {
            let side = this.getPlayerSide(point.player);
            if (side === Side.RED) {
                if (point.against) {
                    this.blueScore++;
                } else {
                    this.redScore++;
                }
            } else {
                if (point.against) {
                    this.redScore++;
                } else {
                    this.blueScore++;
                }
            }
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
            this.elapsedTime = this.formatTimeDiff(this.getElapsedSeconds(new Date()));
        }
    }

    private getElapsedSeconds(t: Date): number {
        const msSinceBase = this.baseTime ? Math.abs(t.getTime() - this.baseTime.getTime()) : 0;
        return this.secondsBeforePause + Math.floor(msSinceBase / 1000);
    }

    private formatTimeDiff(totalSeconds: number) {
        let days = Math.floor(totalSeconds / 86400);
        totalSeconds -= days * 86400;
        let hours = Math.floor(totalSeconds / 3600) % 24;
        totalSeconds -= hours * 3600;
        let minutes = Math.floor(totalSeconds / 60) % 60;
        totalSeconds -= minutes * 60;
        let seconds = Math.floor(totalSeconds % 60);

        let hoursStr = (hours < 10) ? "0" + String(hours) : String(hours);
        let minutesStr = (minutes < 10) ? "0" + String(minutes) : String(minutes);
        let secondsStr = (seconds < 10) ? "0" + String(seconds) : String(seconds);
        return (hoursStr === '00') ? minutesStr + ':' + secondsStr : hoursStr + ':' + minutesStr + ':' + secondsStr;
    };

    private getPlayerSide(p: Player): Side {
        if (p.id === this.bluePlayer1.id || (this.bluePlayer2 && (p.id === this.bluePlayer2.id))) {
            return Side.BLUE;
        }
        if (p.id === this.redPlayer1.id || (this.redPlayer2 && (p.id === this.redPlayer2.id))) {
            return Side.RED;
        }
        return null;
    }

    private getPlayerPosition(p: Player): PlayerPosition {
        if (p.id === this.bluePlayer1.id) {
            return PlayerPosition.Blue1;
        }
        if (p.id === this.redPlayer1.id) {
            return PlayerPosition.Red1;
        }
        if (this.bluePlayer2 && (p.id === this.bluePlayer2.id)) {
            return PlayerPosition.Blue2;
        }
        if (this.redPlayer2 && (p.id === this.redPlayer2.id)) {
            return PlayerPosition.Red2;
        }
        return null;
    }

    private getPlayerByPosition(playerPosition: PlayerPosition): Player {
        switch (playerPosition) {
        case PlayerPosition.Blue1:
            return this.bluePlayer1;
        case PlayerPosition.Red1:
            return this.redPlayer1;
        case PlayerPosition.Blue2:
            return this.bluePlayer2;
        case PlayerPosition.Red2:
            return this.redPlayer2;
        }
        return null;
    }

    private handleResize() {
        let imgRed = this.elRef.nativeElement.querySelector('.field-red');
        let divRed = this.elRef.nativeElement.querySelector('.field-overlay-red');
        let imgBlue = this.elRef.nativeElement.querySelector('.field-blue');
        let divBlue = this.elRef.nativeElement.querySelector('.field-overlay-blue');
        //divRed.style.width = imgRed.width + 'px';
        //divBlue.style.width = imgBlue.width + 'px';
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

    private static readonly getGamePlayersLeagueQuery = `query ($gameId: ID!) {
      game(id: $gameId) {
        id
        finished
        points {
          time
          against
          player {
            id
          }
        }
        gamePlayers {
          side
          player {
            id
            name
            nickname
            nationality
            handedness
            description
          }
        }
        league {
          id
          name
          description
        }
      }
    }`;

    static readonly createGameMutation = `mutation ($leagueId: ID!, $points: [PointCreation], $players: [GamePlayerCreation]!) {
        createGame(leagueId: $leagueId, points: $points, gamePlayers: $players) {
            id
        }
    }`;

    private static readonly updateGameMutation = `mutation ($gameId: ID!, $points: [PointCreation], $players: [GamePlayerCreation]!) {
        updateGame(gameId: $gameId, points: $points, gamePlayers: $players) {
            id
        }
    }`;

    leftFieldImgUrl(): string {
        return `${XPCONFIG.assetsUrl}/img/foostable-v2.svg`;
    }

    rightFieldImgUrl(): string {
        return `${XPCONFIG.assetsUrl}/img/foostable-v2-rev.svg`;
    }
}
