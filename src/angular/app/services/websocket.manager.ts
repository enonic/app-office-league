import {EventType, RemoteEvent} from '../../graphql/schemas/RemoteEvent';

export class WebSocketManager {

    private static readonly KeepAliveTimeMs = 30 * 1000;
    private static readonly ReconnectTimeMs = 5 * 1000;
    private static readonly WS_PROTOCOL = 'office-league';

    private webSocket: WebSocket;
    private wsConnected: boolean;
    private keepAliveIntervalId: any;
    private intentionalDisconnect: boolean;
    private onMessageHandler: (event: RemoteEvent) => void;

    constructor(private url: string, private debug: boolean = false) {
    }

    setUrl(url: string): void {
        this.url = url;
    }

    connect() {
        this.intentionalDisconnect = false;
        if (this.wsConnected) {
            return;
        }

        if (this.webSocket) {
            this.webSocket.onmessage = null;
            this.webSocket.onclose = null;
            this.webSocket.onopen = null;
            this.webSocket.close();
        }

        this.webSocket = new WebSocket(this.url, [WebSocketManager.WS_PROTOCOL]);
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

    disconnect() {
        this.intentionalDisconnect = true;
        if (this.webSocket) {
            this.webSocket.close();
        }
    }

    isConnected(): boolean {
        return this.wsConnected;
    }

    onMessage(onMessageHandler: (event: RemoteEvent) => void): void {
        this.onMessageHandler = onMessageHandler;
    }

    private onWsOpen(event) {
        if (this.debug) {
            console.log('WebSocket connected (' + this.url + ')');
        }
        clearInterval(this.keepAliveIntervalId);
        this.keepAliveIntervalId = setInterval(function () {
            if (this.wsConnected) {
                this.webSocket.send('{"action":"KeepAlive"}');
            }
        }, WebSocketManager.KeepAliveTimeMs);
        this.wsConnected = true;
    }

    private onWsClose(event) {
        if (this.debug) {
            console.log('WebSocket disconnected');
        }
        clearInterval(this.keepAliveIntervalId);
        this.wsConnected = false;

        if (!this.intentionalDisconnect) {
            if (this.debug) {
                console.log('WebSocket reconnecting...');
            }
            setTimeout(() => this.connect(), WebSocketManager.ReconnectTimeMs); // attempt to reconnect
        }
    }

    private onWsMessage(wsEvent: MessageEvent) {
        let event = RemoteEvent.fromJson(wsEvent.data);
        if (event.type === EventType.UNKNOWN) {
            if (this.debug) {
                console.log('Unsupported WS event: ' + wsEvent.data);
            }
            return;
        }

        if (this.debug) {
            console.log('WS event received', event);
        }
        if (this.onMessageHandler) {
            this.onMessageHandler(event);
        }
    }
}
