import { MatDialog } from '@angular/material/dialog';
import { GameCommentDialogComponent } from '../game-comment-dialog/game-comment-dialog.component'; // adjust the path as necessary
import { GameDeleteModalComponent } from '../game-delete-modal/game-delete-modal.component'; // adjust the path as necessary
import { GameContinueModalComponent } from '../game-continue-modal/game-continue-modal.component'; // adjust the path as necessary
import {Component, OnDestroy, ViewChild} from '@angular/core';
import {GraphQLService} from '../../services/graphql.service';
import {ActivatedRoute, Router} from '@angular/router';
import {GameComponent} from '../game/game.component';
import {Game} from '../../../graphql/schemas/Game';
import {Comment} from '../../../graphql/schemas/Comment';
import {AuthService} from '../../services/auth.service';
import {OfflinePersistenceService} from '../../services/offline-persistence.service';
import {PageTitleService} from '../../services/page-title.service';
import {OnlineStatusService} from '../../services/online-status.service';
import {EventType, RemoteEvent} from '../../../graphql/schemas/RemoteEvent';
import {WebSocketManager} from '../../services/websocket.manager';
import { Config } from '../../app.config';
import { DatePipe } from '@angular/common';

declare var XPCONFIG: Config;

@Component({
    selector: 'game-profile',
    templateUrl: 'game-profile.component.html',
    styleUrls: ['game-profile.component.less'],
    providers: [DatePipe]
})
export class GameProfileComponent
    extends GameComponent
    implements OnDestroy {
    @ViewChild('commenttextarea') commentsTextAreaElementRef;

    comment: string;
    playerId: string;
    deletable: boolean;
    connectionError: boolean;
    formattedDate: string;
    online: boolean;
    private onlineStateCallback = () => this.online = navigator.onLine;
    private gameId: string;
    private wsMan: WebSocketManager;

    constructor(
        protected graphQLService: GraphQLService,
        protected route: ActivatedRoute,
        protected router: Router,
        private authService: AuthService,
        private pageTitleService: PageTitleService,
        protected offlineService: OfflinePersistenceService,
        private onlineStatusService: OnlineStatusService,
        private dialog: MatDialog, // Inject MatDialog
        private datePipe: DatePipe
    ) {
        super(graphQLService, route, router, offlineService);
    }

    ngOnInit(): void {
        super.ngOnInit();

        this.gameId = this.route.snapshot.params['id'];
        const user = this.authService.getUser();
        this.playerId = user && user.playerId;
        this.deletable = false;

        this.onlineStatusService.addOnlineStateEventListener(this.onlineStateCallback);
        this.online = navigator.onLine;

        this.wsMan = new WebSocketManager(this.getWsUrl(this.gameId));
        this.wsMan.onMessage(this.onWsMessage.bind(this));
        this.formatGameTime();
    }

    formatGameTime() {
        const now = new Date();
        const gameDate = new Date(this.game.time); // assuming this.game.time is a date compatible string or a timestamp

        const diffInDays = (now.getTime() - gameDate.getTime()) / (1000 * 3600 * 24);

        if (diffInDays < 1 && now.getDate() === gameDate.getDate()) {
            this.formattedDate = `Today at ${this.datePipe.transform(gameDate, 'HH:mm')}`;
        } else if (diffInDays < 2 && now.getDate() - gameDate.getDate() === 1) {
            this.formattedDate = `Yesterday at ${this.datePipe.transform(gameDate, 'HH:mm')}`;
        } else if (diffInDays > -1 && now.getDate() - gameDate.getDate() === -1) {
            this.formattedDate = `Tomorrow at ${this.datePipe.transform(gameDate, 'HH:mm')}`;
        } else {
            this.formattedDate = this.datePipe.transform(gameDate, 'EEEE [at] HH:mm'); // EEEE will give you the full name of the day
        }
        // Add more conditions for lastWeek, nextWeek, sameElse as per your requirement
    }

    ngOnDestroy(): void {
        this.wsMan && this.wsMan.disconnect();
        this.onlineStatusService.removeOnlineStateEventListener(this.onlineStateCallback);
    }

    protected afterGameLoaded(game: Game) {
        this.deletable = this.isGameDeletable(game);
        if (game && game.finished) {
            if (!this.wsMan.isConnected()) {
                this.wsMan.setUrl(this.getWsUrl(this.game.id));
                this.wsMan.connect();
            }

            if (game.league) {
                this.pageTitleService.setTitle(game.league.name + ' - Game');
            } else {
                this.pageTitleService.setTitle('Game');
            }
        } else {
            this.wsMan.setUrl(this.getWsUrl(this.gameId));
            this.wsMan.connect();

            if (game.league) {
                this.pageTitleService.setTitle(game.league.name + ' - Live game');
            } else {
                this.pageTitleService.setTitle('Live game');
            }
        }
        this.connectionError = false;

        const userInGame = (game.gamePlayers || []).find((gp) => gp.player.id === this.playerId);
        if (userInGame && !game.finished) {
            this.onConfirmContinueClicked();
        }
    }

    protected getGameQuery(): string {
        return GameProfileComponent.getGameWithCommentsQuery;
    }

    protected onRequestError() {
        this.handleQueryError();
    }

    private handleQueryError() {
        this.connectionError = true;
    }

    onCommentDoneClicked(comment: string) {
        this.comment = comment.trim();
        this.comment = this.comment.replace(/^\s+|\s+$/g, '');// trim line breaks
        if (this.comment) {
            this.createComment(this.comment).then((comment) => {
                // TODO: Hide Comment Modal Component
                super.loadGame(this.gameId);
            });
        }
    }

    onConfirmDeleteClicked() {
        this.deleteGame().then((deleted) => {
            if (deleted) {
                if (this.game.league) {
                    this.router.navigate(['leagues', this.game.league.name], {replaceUrl: true});
                } else {
                    this.router.navigate(['leagues'], {replaceUrl: true});
                }
            }
        });
    }

    onCommentClicked() {
        this.comment = '';
        const dialogRef = this.dialog.open(GameCommentDialogComponent, {
            width: '250px',
            data: { comment: this.comment }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The comment dialog was closed');
            this.comment = result;
            this.onCommentDoneClicked(this.comment);
        });
    }

    onDeleteClicked() {
        const dialogRef = this.dialog.open(GameDeleteModalComponent, {
            width: '250px'
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The delete dialog was closed');
            if (result === true) {
                this.onConfirmDeleteClicked();
            }
        });
    }

    onConfirmContinueClicked() {
        const dialogRef = this.dialog.open(GameContinueModalComponent, {
            width: '250px'
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The continue dialog was closed');
            if (result === true) {
                this.router.navigate(['games', this.game.league.id, 'game-play'], {replaceUrl: true, queryParams: {gameId: this.gameId}});
            }
        });
    }

    onWsMessage(event: RemoteEvent) {
        if ((event.type === EventType.GAME_UPDATE || event.type === EventType.GAME_COMMENT) && event.gameId === this.gameId) {
            super.loadGame(event.gameId);
        }
    }

    private createComment(comment: string): Promise<Comment> {
        if (!this.playerId) {
            return;
        }

        const createCommentParams = {
            gameId: this.gameId,
            author: this.playerId,
            text: comment,
        };
        return this.graphQLService.post(GameProfileComponent.createCommentMutation, createCommentParams).then(data => {
            return data && data.createComment;
        }).then(createdComment => {
            return createdComment && Comment.fromJson(createdComment);
        });
    }

    private deleteGame(): Promise<boolean> {
        if (!this.gameId) {
            return;
        }

        return this.graphQLService.post(GameProfileComponent.deleteCommentMutation, {gameId: this.gameId}).then(data => {
            return data && (data.deleteGame === this.gameId);
        });
    }

    private isGameDeletable(game: Game): boolean {
        if (!game) {
            return false;
        }

        const userInGame = (game.gamePlayers || []).find((gp) => gp.player.id === this.playerId);
        if (userInGame && !game.finished) {
            return true;
        }

        const league = game.league;
        if (!league || league.adminPlayers.length === 0) {
            return false;
        }
        const userIsLeagueAdmin = !!league.adminPlayers.find((p) => p.id === this.playerId);
        return userIsLeagueAdmin;
    }

    private getWsUrl(gameId: string): string {
        return XPCONFIG.liveGameUrl + '?gameId=' + gameId + '&scope=live-game';
    }

    private static readonly createCommentMutation = `mutation ($gameId: ID!, $author: ID!, $text: String) {
        createComment(gameId: $gameId, author: $author, text: $text) {
            id
            text
            time
            author {
                id
                name
            }
        }
    }`;

    private static readonly deleteCommentMutation = `mutation ($gameId: ID!) {
        deleteGame(id: $gameId)
    }`;

    private static readonly getGameWithCommentsQuery = `query ($gameId: ID!) {
      game(id: $gameId) {
        id
        time
        finished
        points {
            player {
                name
                imageUrl
            }
            time
            against
        }
        comments {
            author {
                name
                imageUrl
            }
            text
        }
        gamePlayers {
            score
            scoreAgainst
            winner
            side
            position
            ratingDelta
            player {
                id
                name
                imageUrl
                description
            }
        }
        gameTeams {
            score
            scoreAgainst
            winner
            side    
            ratingDelta
            team {
                name
                imageUrl
                players {
                    name
                    imageUrl
                    description
                }
            }
        }
        league {
            id
            name
            imageUrl
            adminPlayers(first: -1) {
                id
            }
        }
        comments {
            id
            text
            time
            author {
                id
                name
            }
        }
      }
    }`;

}
