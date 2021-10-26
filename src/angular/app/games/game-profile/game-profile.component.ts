import {Component, EventEmitter, OnDestroy, ViewChild} from '@angular/core';
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

declare var XPCONFIG: Config;

@Component({
    selector: 'game-profile',
    templateUrl: 'game-profile.component.html',
    styleUrls: ['game-profile.component.less']
})
export class GameProfileComponent
    extends GameComponent
    implements OnDestroy {
    materializeActions = new EventEmitter<any>();
    materializeActionsDelete = new EventEmitter<any>();
    materializeActionsContinue = new EventEmitter<any>();
    @ViewChild('commenttextarea') commentsTextAreaElementRef;

    comment: string;
    playerId: string;
    deletable: boolean;
    connectionError: boolean;
    private online: boolean;
    private onlineStateCallback = () => this.online = navigator.onLine;
    private gameId: string;
    private wsMan: WebSocketManager;

    constructor(protected graphQLService: GraphQLService, protected route: ActivatedRoute, protected router: Router,
                private authService: AuthService, private pageTitleService: PageTitleService,
                protected offlineService: OfflinePersistenceService, private onlineStatusService: OnlineStatusService) {
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
    }

    ngAfterViewInit(): void {
        setTimeout(() => this.initFloatingButtons(), 500);
    }

    initFloatingButtons(): void {
        const buttons = document.querySelectorAll('.fixed-action-btn');
        M.FloatingActionButton.init(buttons);
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
            this.showModalContinuePlaying();
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

    onCommentClicked() {
        this.comment = '';
        this.showModalMessage();
        // TODO: fix this.
        // setTimeout(_ =>
        //     this._renderer.invokeElementMethod(
        //         this.commentsTextAreaElementRef.nativeElement, 'focus', []), 0);
    }

    onCommentDoneClicked() {
        this.comment = this.comment.trim();
        this.comment = this.comment.replace(/^\s+|\s+$/g, '');// trim line breaks
        if (this.comment) {
            this.createComment(this.comment).then((comment) => {
                this.hideModalMessage();
                super.loadGame(this.gameId);
            });
        }
    }

    onDeleteClicked() {
        this.showModalDelete();
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
    onConfirmContinueClicked() {
        this.router.navigate(['games', this.game.league.id, 'game-play'], {replaceUrl: true, queryParams: {gameId: this.gameId}});
    }

    public showModalMessage(): void {
        this.materializeActions.emit({action: "modal", params: ['open']});
    }

    public hideModalMessage(): void {
        this.materializeActions.emit({action: "modal", params: ['close']});
    }

    public showModalDelete(): void {
        this.materializeActionsDelete.emit({action: "modal", params: ['open']});
    }

    public hideModalDelete(): void {
        this.materializeActionsDelete.emit({action: "modal", params: ['close']});
    }

    public showModalContinuePlaying(): void {
        this.materializeActionsContinue.emit({action: "modal", params: ['open']});
    }

    public hideModalContinuePlaying(): void {
        this.materializeActionsContinue.emit({action: "modal", params: ['close']});
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
