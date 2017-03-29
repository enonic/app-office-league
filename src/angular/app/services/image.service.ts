import {Injectable} from '@angular/core';
import {XPCONFIG} from '../app.config';

@Injectable()
export class ImageService {

    constructor() {
    }

    public static playerDefault(): string {
        return `${XPCONFIG.baseHref}/players/image/__/__`;
    }

    public static teamDefault(): string {
        return `${XPCONFIG.baseHref}/teams/image/__/__`;
    }

    public static leagueDefault(): string {
        return `${XPCONFIG.baseHref}/leagues/image/__/__`;
    }

    public static logoUrl(): string {
        return `${XPCONFIG.assetsUrl}/img/logo.svg`;
    }
}
