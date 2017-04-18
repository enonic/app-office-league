export enum EventType {
    UNKNOWN, GAME_UPDATE, GAME_COMMENT
}

export class EventTypeUtil {
    static parse(value: any): EventType {
        if (typeof value === 'string') {
            return EventType[value.toUpperCase()];
        }
        return EventType.UNKNOWN;
    }

    static toString(eventType: EventType): string {
        return eventType != null ? EventType[eventType] : '';
    }
}

export interface EventJson {
    event: string;
    gameId?: string;
    data?: { [key: string]: any };
}

export class RemoteEvent {
    type: EventType;
    gameId: string;
    data: { [key: string]: any } = {};

    constructor(type?: EventType) {
        this.type = type;
    }

    static fromJson(json: EventJson | string): RemoteEvent {
        if (typeof json === 'string') {
            try {
                json = <EventJson> JSON.parse(json);
            } catch (e) {
                return new RemoteEvent(EventType.UNKNOWN);
            }
        }
        let remoteEvent = new RemoteEvent();
        remoteEvent.type = EventTypeUtil.parse(json.event);
        remoteEvent.gameId = json.gameId;
        remoteEvent.data = json.data;
        return remoteEvent;
    }
}
