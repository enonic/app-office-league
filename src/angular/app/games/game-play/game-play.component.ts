import {AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Player} from '../../../graphql/schemas/Player';
import {GraphQLService} from '../../services/graphql.service';
import {League} from '../../../graphql/schemas/League';
import {Point} from '../../../graphql/schemas/Point';
import {Side, SideUtil} from '../../../graphql/schemas/Side';
import {OfflinePersistenceService} from '../../services/offline-persistence.service';
import {Game} from '../../../graphql/schemas/Game';
import {GamePlayer} from '../../../graphql/schemas/GamePlayer';
import {GameTeam} from '../../../graphql/schemas/GameTeam';
import {Team} from '../../../graphql/schemas/Team';
import {GameSelection} from '../GameSelection';
import {XPCONFIG} from '../../app.config';
import {WebSocketManager} from '../../services/websocket.manager';
import {EventType, RemoteEvent} from '../../../graphql/schemas/RemoteEvent';
import {RankingService} from '../../services/ranking.service';
import {AudioService, WebAudioSound} from '../../services/audio.service';

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
export class GamePlayComponent
    implements OnInit, AfterViewInit, OnDestroy {

    bluePlayer1: Player;
    bluePlayer2: Player;
    redPlayer1: Player;
    redPlayer2: Player;
    league: League;
    points: Point[];
    gameTeams: GameTeam[];
    gameId: string;
    onlineMode: boolean;

    blueScore: number = 0;
    redScore: number = 0;
    expectedBlueScore: number = -1;
    expectedRedScore: number = -1;
    firstPeriod = true;
    halfTime: boolean = false;
    baseTime: Date;
    secondsBeforePause: number;
    elapsedTime: string;
    timerId: number;
    gameState: GameState = GameState.NotStarted;
    showMenu: boolean = false;
    showPlay: boolean;
    showUndo: boolean;

    playerSelected: PlayerPosition;
    messagePlayer: Player;
    message: string;
    messageTimerId: any;
    commentatorMessage: string = 'GOAL!';

    nameClassesBlue1: {} = {
        'game-play__player--selected': false,
        'game-play__player--unselected': false
    };
    nameClassesBlue2: {} = {
        'game-play__player--selected': false,
        'game-play__player--unselected': false
    };
    nameClassesRed1: {} = {
        'game-play__player--selected': false,
        'game-play__player--unselected': false
    };
    nameClassesRed2: {} = {
        'game-play__player--selected': false,
        'game-play__player--unselected': false
    };
    nameClassesField: {} = {enabled: false};
    nameClassesGamePlay: {} = {};
    nameClassesGamePlayScoreBlue: {} = {};
    nameClassesGamePlayScoreRed: {} = {};
    nameClassesGamePlayCommentator: {} = {};
    nameClassesGameTopBarItems: {} = {
        'game-top-bar-items__hide': false
    };
    nameClassesGameBottomBarMsg: {} = {
        'game-bottom-bar-message__hide': true
    };

    private wsMan: WebSocketManager;

    private goalSound: WebAudioSound;
    private ownGoalSound: WebAudioSound;
    private gameEndSound: WebAudioSound;
    private halfTimeSound: WebAudioSound;
    private firstGoalSound: WebAudioSound;
    private strike3Sound: WebAudioSound;
    private strike5Sound: WebAudioSound;
    private strike7Sound: WebAudioSound;
    private strike9Sound: WebAudioSound;

    constructor(private graphQLService: GraphQLService, private route: ActivatedRoute, private router: Router, private elRef: ElementRef,
                private offlineService: OfflinePersistenceService, private gameSelection: GameSelection,
                private rankingService: RankingService, private audioService: AudioService) {
    }

    ngOnInit(): void {
        this.loadSounds();
        this.route.queryParams.subscribe(params => {
            if (!this.gameSelection.gameId) {
                this.gameSelection.gameId = params['gameId'];
            }
            if (!this.gameSelection.league) {
                let leagueId = this.route.snapshot.params['leagueId'];
                if (leagueId) {
                    this.gameSelection.league = new League(leagueId, 'League');
                }
            }

            this.wsMan = new WebSocketManager(this.getWsUrl(this.gameId), true);
            this.wsMan.onMessage(this.onWsMessage.bind(this));

            this.loadGameData()
                .catch((error) => {
                    console.log('Could not start game', error);
                })
                .then(() => {
                    if (!this.league) {
                        this.router.navigate([''], {replaceUrl: true});
                        return;
                    }
                    this.startGame();
                })
            ;
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
        if (this.hasGameEnded()) {
            return;
        }
        if (this.gameState === GameState.Paused && this.playerSelected === this.getPlayerPosition(p)) {
            this.unselectAll();
            this.resumeGame();
            return;
        }
        if (this.gameState !== GameState.Playing) {
            return;
        }

        clearTimeout(this.messageTimerId);
        this.hideMessage();
        this.pauseGame();

        this.playerSelected = this.getPlayerPosition(p);
        this.nameClassesBlue1['game-play__player--selected'] = this.playerSelected === PlayerPosition.Blue1;
        this.nameClassesBlue2['game-play__player--selected'] = this.playerSelected === PlayerPosition.Blue2;
        this.nameClassesRed1['game-play__player--selected'] = this.playerSelected === PlayerPosition.Red1;
        this.nameClassesRed2['game-play__player--selected'] = this.playerSelected === PlayerPosition.Red2;
        this.nameClassesBlue1['game-play__player--unselected'] = this.playerSelected !== PlayerPosition.Blue1;
        this.nameClassesBlue2['game-play__player--unselected'] = this.playerSelected !== PlayerPosition.Blue2;
        this.nameClassesRed1['game-play__player--unselected'] = this.playerSelected !== PlayerPosition.Red1;
        this.nameClassesRed2['game-play__player--unselected'] = this.playerSelected !== PlayerPosition.Red2;

        this.nameClassesField['enabled'] = true;

        this.nameClassesGamePlay['game-play--player-clicked'] = true;
        let side = this.getPlayerSide(p);
        this.nameClassesGamePlay['game-play--player-red-clicked'] = side === Side.RED;
        this.nameClassesGamePlay['game-play--player-blue-clicked'] = side === Side.BLUE;
    }

    private unselectAll() {
        this.nameClassesBlue1['game-play__player--selected'] = false;
        this.nameClassesBlue2['game-play__player--selected'] = false;
        this.nameClassesRed1['game-play__player--selected'] = false;
        this.nameClassesRed2['game-play__player--selected'] = false;
        this.nameClassesBlue1['game-play__player--unselected'] = false;
        this.nameClassesBlue2['game-play__player--unselected'] = false;
        this.nameClassesRed1['game-play__player--unselected'] = false;
        this.nameClassesRed2['game-play__player--unselected'] = false;
        this.nameClassesField['enabled'] = false;

        this.nameClassesGamePlay['game-play--player-clicked'] = false;
        this.nameClassesGamePlay['game-play--player-red-clicked'] = false;
        this.nameClassesGamePlay['game-play--player-blue-clicked'] = false;
    }

    onPauseClicked() {
        this.unselectAll();
        this.pauseGame();
    }

    onPlayClicked() {
        this.unselectAll();
        this.resumeGame();
    }

    onUndoLastGoalClicked() {
        let point = this.points.pop();

        if (point) {
            let side = this.getPlayerSide(point.player);
            let against = point.against;

            if (side === Side.RED) {
                if (against) {
                    this.blueScore--;
                } else {
                    this.redScore--;
                }
            } else {
                if (against) {
                    this.redScore--;
                } else {
                    this.blueScore--;
                }
            }
            this.onScoreChange();

            this.saveGame().then((gameId) => {

                // TODO show point feedback
            }).catch((ex) => {
                console.log('Could not update game. Offline mode On.');
                this.onlineMode = false;
            });
        }


        this.unselectAll();
        this.resumeGame();
        this.showMenu = false;
    }

    onGameTimeClicked() {
        this.unselectAll();

        if (this.gameState !== GameState.Paused) {
            this.pauseGame();
            this.showMenu = true;
        }
        else if (!this.showMenu) {
            this.resumeGame();
        }
    }

    onContinueGameClicked() {
        this.resumeGame();
        this.showMenu = false;
    }

    private redirectAfterGameDeleted() {
        if (this.league) {
            this.router.navigate(['leagues', this.league.name], {replaceUrl: true});
        } else {
            this.router.navigate([], {replaceUrl: true});
        }
    }

    onEndGameClicked() {
        this.deleteGame().then(() => {
            this.redirectAfterGameDeleted();
        }).catch((error) => {
            this.redirectAfterGameDeleted();
        });
    }

    onBlueGoalClick() {
        if (this.gameState !== GameState.Paused || (this.playerSelected == null)) {
            return;
        }

        const p = this.getPlayerByPosition(this.playerSelected);
        const blueTeamScoring = this.playerSelected === PlayerPosition.Blue1 || this.playerSelected === PlayerPosition.Blue2;
        this.handlePointScored(p, blueTeamScoring);
        this.unselectAll();
        this.resumeGame();
    }

    onRedGoalClick() {
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
        this.onScoreChange();
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

        if (this.hasGameEnded()) {
            this.gameState = GameState.Finished;
            this.router.navigate(['games', this.gameId], {replaceUrl: true});
        } else {
            this.startGameTimer();

            if (!this.gameId) {
                this.createGame().then((gameId) => {
                    console.log('Initial game created: ' + gameId);
                    this.gameId = gameId;
                    this.onlineMode = true;

                    this.wsMan.setUrl(this.getWsUrl(this.gameId));
                    this.wsMan.connect();
                }).catch((ex) => {
                    console.log('Could not create game. Offline mode On.');
                    this.onlineMode = false;
                });
            } else {
                this.wsMan.setUrl(this.getWsUrl(this.gameId));
                this.wsMan.connect();
            }
        }
    }

    private pauseGame() {
        this.showPlay = true;
        if (this.hasGameEnded()) {
            return;
        }

        this.gameState = GameState.Paused;
        this.stopGameTimer();

        this.secondsBeforePause = this.getElapsedSeconds(new Date());
        this.baseTime = null;
        this.updateElapsedTime();
    }

    private resumeGame() {
        this.showPlay = false;
        this.nameClassesField['paused'] = false;

        if (this.hasGameEnded()) {
            return;
        }
        this.gameState = GameState.Playing;

        this.baseTime = new Date();
        this.updateElapsedTime();
        this.startGameTimer();
    }

    private scoreGoal(scorerSide: Side, against: boolean) {
        let pointWinner: Side;
        if (scorerSide === Side.RED) {
            pointWinner = against ? Side.BLUE : Side.RED;
        } else {
            pointWinner = against ? Side.RED : Side.BLUE;
        }

        if (pointWinner === Side.BLUE) {
            this.blueScore++;
        }
        else {
            this.redScore++;
        }

        if (scorerSide === Side.BLUE) {
            this.nameClassesGamePlayScoreBlue['game-play__blue-score--goal'] = true;
            this.nameClassesGamePlayCommentator['game-play__commentator--blue'] = true;
            setTimeout(() => {
                this.nameClassesGamePlayScoreBlue['game-play__blue-score--goal'] = false;
                this.nameClassesGamePlayCommentator['game-play__commentator--blue'] = false;
            }, 2000);
        }
        else {
            this.nameClassesGamePlayScoreRed['game-play__red-score--goal'] = true;
            this.nameClassesGamePlayCommentator['game-play__commentator--red'] = true;
            setTimeout(() => {
                this.nameClassesGamePlayScoreRed['game-play__red-score--goal'] = false;
                this.nameClassesGamePlayCommentator['game-play__commentator--red'] = false;
            }, 2000);
        }

        this.onScoreChange();

        if (this.halfTime) {
            this.commentatorMessage = 'Half Time!';
        } else if (against) {
            this.commentatorMessage = 'OWN GOAL!';
        } else {
            this.commentatorMessage = 'GOAL!';
        }
        this.nameClassesGamePlayCommentator['game-play__commentator--longtext'] = this.commentatorMessage.length > 6;

        this.nameClassesGamePlayCommentator['game-play__commentator--active'] = true;
        setTimeout(() => {
            this.nameClassesGamePlayCommentator['game-play__commentator--active'] = false;
        }, 2000);

    }

    private handlePointScored(p: Player, against: boolean) {
        let now = new Date();
        let scorerSide = this.getPlayerSide(p);
        let point = new Point();
        point.player = p;
        point.time = this.getElapsedSeconds(now);
        if (this.points.length > 0 && this.points[this.points.length - 1].time >= point.time) {
            point.time = this.points[this.points.length - 1].time + 1;
        }
        point.against = against;
        this.points.push(point);

        this.scoreGoal(scorerSide, against);

        if (this.hasGameEnded()) {
            this.playSound(this.gameEndSound);

            this.stopGameTimer();
            this.gameState = GameState.Finished;
            this.saveGame().then((gameId) => {
                console.log('Game created: ' + gameId);
                this.router.navigate(['games', gameId], {replaceUrl: true});
            }).catch((ex) => {
                console.warn('Could not save final game. TODO: Save data in local storage');
                this.onlineMode = false;
                this.saveGameOffline().then((game) => {
                    this.router.navigate(['games', game.id], {replaceUrl: true});
                }).catch((ex) => {
                    console.log(ex); // TODO retry?
                });
            });
        } else {
            this.playSoundAfterGoal();

            this.saveGame().then((gameId) => {
                // TODO show point feedback
            }).catch((ex) => {
                console.log('Could not update game. Offline mode On.');
                this.onlineMode = false;
            });
        }
    }

    private onScoreChange() {
        let wasFirstPeriod: boolean = this.firstPeriod;
        this.firstPeriod = this.blueScore < 5 && this.redScore < 5;
        this.halfTime = (wasFirstPeriod && !this.firstPeriod) || (!wasFirstPeriod && this.firstPeriod);
    }

    private hasGameEnded(): boolean {
        return (this.gameState === GameState.Finished) ||
               ((this.blueScore >= 10 || this.redScore >= 10) && Math.abs(this.blueScore - this.redScore) >= 2);
    }

    private compareGamePlayer(gp1: GamePlayer, gp2: GamePlayer) {
        return (gp1.position || 0) - (gp2.position || 0);
    }

    private handleGamePlayersLeagueQueryResponse(data) {
        if (!data.game) {
            return;
        }
        this.gameId = this.gameSelection.gameId;
        this.league = League.fromJson(data.game.league);
        let playerMap: { [id: string]: Player } = {};

        data.game.gamePlayers.sort(this.compareGamePlayer).forEach((gp) => {
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
        this.calculateExpectedScore();
    }

    private loadGameData(): Promise<any> {
        if (this.gameSelection.gameId) {
            // load existing game data
            return this.graphQLService.post(
                GamePlayComponent.getGamePlayersLeagueQuery,
                {gameId: this.gameSelection.gameId, leagueId: this.gameSelection.league.id},
                data => this.handleGamePlayersLeagueQueryResponse(data)
            );
        }

        // load league and players for new game
        let playerIds = [this.gameSelection.bluePlayer1, this.gameSelection.redPlayer1, this.gameSelection.bluePlayer2,
            this.gameSelection.redPlayer2].map((p) => p && p.id).filter((id) => !!id);
        return this.graphQLService.post(
            GamePlayComponent.getPlayersLeagueQuery,
            {playerIds: playerIds, leagueId: this.gameSelection.league.id},
            data => this.handlePlayersLeagueQueryResponse(data),
            error => this.handleOfflineGame()
        );
    }

    private handleOfflineGame() {
        console.log('Could not create game before starting. Offline mode On.');

        this.onlineMode = false;
        this.bluePlayer1 = this.gameSelection.bluePlayer1;
        this.bluePlayer2 = this.gameSelection.bluePlayer2;
        this.redPlayer1 = this.gameSelection.redPlayer1;
        this.redPlayer2 = this.gameSelection.redPlayer2;
        this.league = this.gameSelection.league;
    }

    private handlePlayersLeagueQueryResponse(data) {
        this.league = League.fromJson(data.league);
        let playerMap: { [id: string]: Player } = {};
        data.players.forEach((p) => playerMap[p.id] = Player.fromJson(p));
        this.bluePlayer1 = playerMap[this.gameSelection.bluePlayer1 && this.gameSelection.bluePlayer1.id];
        this.bluePlayer2 = playerMap[this.gameSelection.bluePlayer2 && this.gameSelection.bluePlayer2.id];
        this.redPlayer1 = playerMap[this.gameSelection.redPlayer1 && this.gameSelection.redPlayer1.id];
        this.redPlayer2 = playerMap[this.gameSelection.redPlayer2 && this.gameSelection.redPlayer2.id];

        this.calculateExpectedScore();
    }

    private calculateExpectedScore() {
        let bluePlayer1Rating = this.getPlayerRating(this.bluePlayer1);
        let bluePlayer2Rating = this.getPlayerRating(this.bluePlayer2);
        let redPlayer1Rating = this.getPlayerRating(this.redPlayer1);
        let redPlayer2Rating = this.getPlayerRating(this.redPlayer2);
        let expectedScore = this.rankingService.getExpectedScore([bluePlayer1Rating, bluePlayer2Rating],
            [redPlayer1Rating, redPlayer2Rating]);
        this.expectedBlueScore = expectedScore[0];
        this.expectedRedScore = expectedScore[1];
    }

    private getPlayerRating(player: Player): number {
        if (!player) {
            return undefined;
        }
        return player.leaguePlayers[0].rating || this.rankingService.defaultRating();
    }

    private saveGame(): Promise<string> {
        if (this.gameId && !Game.isClientId(this.gameId)) {
            return this.updateGame()
                .then((gameId) => {
                    if (this.gameId) {
                        this.gameId = gameId;
                    }
                    return gameId;
                });
        } else {
            return this.createGame()
                .then((gameId) => {
                    if (this.gameId) {
                        this.gameId = gameId;
                    }
                    return gameId;
                });
        }
    }

    private saveGameOffline(): Promise<Game> {
        if (!this.gameId) {
            this.gameId = Game.generateClientId();
        }
        let game = new Game(this.gameId);
        game.points = this.points.slice(0);
        game.league = this.league;
        let gamePlayers: GamePlayer[] = [
            this.gamePlayerForOffline(this.bluePlayer1, Side.BLUE),
            this.gamePlayerForOffline(this.redPlayer1, Side.RED),
        ];
        if (this.bluePlayer2) {
            gamePlayers.push(this.gamePlayerForOffline(this.bluePlayer2, Side.BLUE));
        }
        if (this.redPlayer2) {
            gamePlayers.push(this.gamePlayerForOffline(this.redPlayer2, Side.RED));
        }

        game.gamePlayers = gamePlayers;

        if (!this.gameTeams && this.redPlayer2) {
            let blueGameTeam = new GameTeam(null);
            blueGameTeam.side = Side.BLUE;
            blueGameTeam.team = new Team(null, [this.bluePlayer1.name, this.bluePlayer2.name].join(' & '));
            let redGameTeam = new GameTeam(null);
            redGameTeam.side = Side.RED;
            redGameTeam.team = new Team(null, [this.redPlayer1.name, this.redPlayer2.name].join(' & '));

            game.gameTeams = [blueGameTeam, redGameTeam];
        }
        return this.offlineService.saveGame(game);
    }

    private gamePlayerForOffline(player: Player, side: Side): GamePlayer {
        let gp = new GamePlayer(null);
        gp.player = player;
        gp.side = side;
        return gp;
    }

    private buildSaveGameParams(): { [key: string]: any } {
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
        return this.graphQLService.post(
            GamePlayComponent.createGameMutation,
            createGameParams
        ).then(
            data => {
                console.log('Game created', data);
                return data.createGame.id;
            }
        );
    }

    private updateGame(): Promise<string> {
        let updateGameParams = this.buildSaveGameParams();
        updateGameParams['gameId'] = this.gameId;
        return this.graphQLService.post(
            GamePlayComponent.updateGameMutation,
            updateGameParams
        ).then(
            data => {
                console.log('Game updated', data);
                return data.updateGame.id;
            }
        );
    }

    private deleteGame(): Promise<any> {
        return this.offlineService.deleteOfflineGame(this.gameId).then(() => {
            this.deleteServerGame(this.gameId);
        }).catch((error) => {
            this.deleteServerGame(this.gameId)
        });
    }

    private deleteServerGame(gameId: string) {
        this.graphQLService.post(
            GamePlayComponent.deleteGameMutation,
            {gameId: gameId}
        ).then(data => {
            console.log('Game deleted', data);
            return data && data.deleteGame;
        }).catch((error) => {
            console.log('Could not delete server game: ' + gameId, error);
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
            this.onScoreChange();
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

    private getWindowAspectRatio() {
        return window.innerWidth / window.innerHeight;
    }

    private handleResize() {
        let playerImgPlaceholder = this.elRef.nativeElement.querySelector('.game-play__player-img-placeholder');
        let playerImg = this.elRef.nativeElement.querySelectorAll('.game-play__player-img');
        let orientation = this.getWindowAspectRatio() > 1 ? 'landscape' : 'portrait';

        Array.prototype.forEach.call(playerImg, (img) => {
            if (orientation === 'portrait') {
                img.style.width = playerImgPlaceholder.clientHeight + 'px';
                img.style.height = playerImgPlaceholder.clientHeight + 'px';
            }
            else {
                img.style.height = playerImgPlaceholder.clientWidth + 'px';
                img.style.width = playerImgPlaceholder.clientWidth + 'px';
            }
        });
    }

    private showMessage(player: Player, message: string) {
        this.messagePlayer = player;
        this.message = message.replace(/[\r\n]+/g, " ");
        this.nameClassesGameTopBarItems['game-bottom-bar-items__hide'] = true;
        this.nameClassesGameBottomBarMsg['game-bottom-bar-message__hide'] = false;
        clearTimeout(this.messageTimerId);
        this.messageTimerId = setTimeout(() => this.hideMessage(), 60000);
    }

    private hideMessage() {
        this.messagePlayer = null;
        this.message = '';
        this.nameClassesGameTopBarItems['game-bottom-bar-items__hide'] = false;
        this.nameClassesGameBottomBarMsg['game-bottom-bar-message__hide'] = true;
    }

    ngOnDestroy() {
        this.wsMan.disconnect();
        setTimeout(() => this.stopAllSounds(), 3000);
    }

    onWsMessage(event: RemoteEvent) {
        if ((event.type === EventType.GAME_COMMENT) && event.gameId === this.gameId) {
            console.log('Game comment received', event);

            let player: Player = Player.fromJson(event.data.player);
            let message: string = event.data.message;
            this.showMessage(player, message);
        }
    }

    private getWsUrl(gameId: string): string {
        return XPCONFIG.liveGameUrl + '?gameId=' + gameId + '&scope=game-play';
    }

    private getCurrentStreak(): number {
        let point: Point, streak = 0;
        let side: Side, previousSide: Side;
        let i, l = this.points.length;

        for (i = l - 1; i >= 0; i--) {
            point = this.points[i];
            side = this.getPlayerSide(point.player);
            if (point.against || (previousSide !== undefined && side != previousSide)) {
                break;
            }
            previousSide = side;
            streak++;
        }
        return streak;
    }

    private playSoundAfterGoal() {
        if (this.halfTime) {
            this.playSound(this.halfTimeSound);
            return;
        }

        if (this.points.length === 1) {
            this.playSound(this.firstGoalSound);
            return;
        }

        if (this.points[this.points.length - 1].against) {
            this.playSound(this.ownGoalSound);
            return;
        }

        const streak = this.getCurrentStreak();
        console.log('Current streak: ' + streak);
        if (streak === 9) {
            this.playSound(this.strike9Sound);

        } else if (streak === 7) {
            this.playSound(this.strike7Sound);

        } else if (streak === 5) {
            this.playSound(this.strike5Sound);

        } else if (streak === 3) {
            this.playSound(this.strike3Sound);

        } else {
            this.playSound(this.goalSound);
        }
    }

    private playSound(sound: WebAudioSound) {
        if (!sound) {
            return;
        }
        try {
            console.log('Playing sound: ' + sound.getUrl()); // TODO remove logging
            sound.play();
        } catch (e) {
            console.warn('Unable to play sound: ', sound);
        }
    }

    private loadSounds() {
        try {
            this.goalSound = this.audioService.newSound('goal.wav');
            this.ownGoalSound = this.audioService.newSound('own-goal.wav');
            this.gameEndSound = this.audioService.newSound('game-over.wav');
            this.halfTimeSound = this.audioService.newSound('halftime.wav');
            this.firstGoalSound = this.audioService.newSound('first-blood.wav');
            this.strike3Sound = this.audioService.newSound('dominating.wav');
            this.strike5Sound = this.audioService.newSound('ownage.wav');
            this.strike7Sound = this.audioService.newSound('wicked-sick.wav');
            this.strike9Sound = this.audioService.newSound('godlike.wav');
        } catch (e) {
            console.warn('Unable to load sounds: ' + e)
        }
    }

    private stopAllSounds() {
        [this.goalSound, this.ownGoalSound, this.gameEndSound, this.halfTimeSound, this.firstGoalSound,
            this.strike3Sound, this.strike5Sound, this.strike7Sound, this.strike9Sound].forEach((sound) => sound.stop());
    }

    private static readonly getPlayersLeagueQuery = `query ($leagueId: ID!, $playerIds: [ID]!) {
        league(id: $leagueId) {
            id
            name
            imageUrl
            description
        }
        
        players(ids: $playerIds) {
            id
            name
            imageUrl
            nationality
            handedness
            description
            leaguePlayer(leagueId: $leagueId) {
                id
                rating
            }
        }
    }`;

    private static readonly getGamePlayersLeagueQuery = `query ($gameId: ID!, $leagueId: ID!) {
      game(id: $gameId) {
        id
        finished
        points {
          time
          against
          player {
            id
            imageUrl
          }
        }
        gamePlayers {
          side
          position
          player {
            id
            name
            imageUrl
            nationality
            handedness
            description
            leaguePlayer(leagueId: $leagueId) {
                id
                rating
            }
          }
        }
        gameTeams {
          side
          team {
            id
            name
            imageUrl
          }
        }
        league {
          id
          name
          imageUrl
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

    private static readonly deleteGameMutation = `mutation ($gameId: ID!) {
        deleteGame(id: $gameId)
    }`;
}
