import {Component, EventEmitter, Renderer, ViewChild} from '@angular/core';
import {GraphQLService} from '../../services/graphql.service';
import {ActivatedRoute, Router} from '@angular/router';
import {GameComponent} from '../game/game.component';
import {XPCONFIG} from '../../app.config';
import {Game} from '../../../graphql/schemas/Game';
import {Comment} from '../../../graphql/schemas/Comment';
import {MaterializeAction, MaterializeDirective} from 'angular2-materialize/dist/index';
import {AuthService} from '../../services/auth.service';
import {OfflinePersistenceService} from '../../services/offline-persistence.service';
import {PageTitleService} from '../../services/page-title.service';

@Component({
    selector: 'game-profile',
    templateUrl: 'game-profile.component.html',
    styleUrls: ['game-profile.component.less']
})
export class GameProfileComponent
    extends GameComponent {
    materializeActions = new EventEmitter<string | MaterializeAction>();
    materializeActionsDelete = new EventEmitter<string | MaterializeAction>();
    @ViewChild('commenttextarea') commentsTextAreaElementRef;

    private static readonly KeepAliveTimeMs = 30 * 1000;
    private static readonly ReconnectTimeMs = 5 * 1000;

    comment: string;
    playerId: string;
    deletable: boolean;
    private gameId: string;
    private webSocket: WebSocket;
    private wsConnected: boolean;
    private keepAliveIntervalId: any;

    constructor(protected graphQLService: GraphQLService, protected route: ActivatedRoute, protected router: Router,
                private authService: AuthService, private _renderer: Renderer, private pageTitleService: PageTitleService,
                protected offlineService: OfflinePersistenceService) {
        super(graphQLService, route, router, offlineService);
    }

    ngOnInit(): void {
        super.ngOnInit();

        this.gameId = this.route.snapshot.params['id'];
        const user = this.authService.getUser();
        this.playerId = user && user.playerId;
        this.deletable = false;
    }

    protected afterGameLoaded(game: Game) {
        this.deletable = this.isGameDeletable(game);
        if (game && game.finished) {
            if (this.wsConnected) {
                this.wsDisconnect();
            }

            if (game.league) {
                this.pageTitleService.setTitle(game.league.name + ' - Game');
            } else {
                this.pageTitleService.setTitle('Game');
            }
        } else {
            this.wsConnect(this.gameId);

            if (game.league) {
                this.pageTitleService.setTitle(game.league.name + ' - Live game');
            } else {
                this.pageTitleService.setTitle('Live game');
            }
        }
    }

    protected getGameQuery(): string {
        return GameProfileComponent.getGameWithCommentsQuery;
    }

    onCommentClicked() {
        this.comment = '';
        this.showModalMessage();
        setTimeout(_ =>
            this._renderer.invokeElementMethod(
                this.commentsTextAreaElementRef.nativeElement, 'focus', []), 0);
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

    wsConnect(gameId) {
        if (this.wsConnected) {
            return;
        }
        if (this.webSocket) {
            this.webSocket.onmessage = null;
            this.webSocket.onclose = null;
            this.webSocket.onopen = null;
            this.webSocket.close();
        }
        this.webSocket = new WebSocket(XPCONFIG.liveGameUrl + '?gameId=' + gameId, ['office-league']);
        this.webSocket.onmessage = (event) => {
            this.onWsMessage(event);
            return;
        };
        this.webSocket.onclose = (event) => {
            this.onWsClose(event);
            return;
        };
        this.webSocket.onopen = (event) => {
            this.onWsOpen(event);
            return;
        };
    }

    wsDisconnect() {
        this.webSocket.close();
    }

    onWsOpen(event) {
        console.log('WebSocket connected');
        clearInterval(this.keepAliveIntervalId);
        this.keepAliveIntervalId = setInterval(function () {
            if (this.wsConnected) {
                this.webSocket.send('{"action":"KeepAlive"}');
            }
        }, GameProfileComponent.KeepAliveTimeMs);
        this.wsConnected = true;
    }

    onWsClose(event) {
        console.log('WebSocket disconnected');
        clearInterval(this.keepAliveIntervalId);
        this.wsConnected = false;

        if (!(this.game && this.game.finished)) {
            setTimeout(() => this.wsConnect, GameProfileComponent.ReconnectTimeMs); // attempt to reconnect
        }
    }

    onWsMessage(event) {
        let msg = JSON.parse(event.data);
        if (msg.gameId === this.gameId) {
            console.log('Game updated -> refresh data');
            super.loadGame(msg.gameId);
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
        if (!game || game.finished) {
            return false;
        }
        const userInGame = (game.gamePlayers || []).find((gp) => gp.player.id === this.playerId);
        if (userInGame) {
            return true;
        }

        const league = game.league;
        if (!league || league.adminPlayers.length === 0) {
            return false;
        }
        const userIsLeagueAdmin = !!league.adminPlayers.find((p) => p.id === this.playerId);
        return userIsLeagueAdmin;
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
