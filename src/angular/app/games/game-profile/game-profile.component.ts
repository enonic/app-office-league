import {Component} from '@angular/core';
import {GraphQLService} from '../../graphql.service';
import {ActivatedRoute} from '@angular/router';
import {GameComponent} from '../game/game.component';
import {XPCONFIG} from '../../app.config';
import {Game} from '../../../graphql/schemas/Game';

@Component({
    selector: 'game-profile',
    templateUrl: 'game-profile.component.html',
    styleUrls: ['game-profile.component.less']
})
export class GameProfileComponent extends GameComponent {

    private static readonly KeepAliveTimeMs = 30 * 1000;
    private static readonly ReconnectTimeMs = 5 * 1000;

    private gameId: string;
    private webSocket: WebSocket;
    private wsConnected: boolean;
    private keepAliveIntervalId: any;

    constructor(service: GraphQLService, protected route: ActivatedRoute) {
        super(service, route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        this.gameId = this.route.snapshot.params['id'];
    }

    protected afterGameLoaded(game: Game) {
        if (game && game.finished) {
            if (this.wsConnected) {
                this.wsDisconnect();
            }
        } else {
            this.wsConnect(this.gameId);
        }
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
}
