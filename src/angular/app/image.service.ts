import {Injectable} from '@angular/core';
import {XPCONFIG} from './app.config';

@Injectable()
export class ImageService {

    constructor() {
    }

    public static forLeague(name: string): string {
        return `${XPCONFIG.baseHref}/leagues/image/${name}`;
    }

    public static forPlayer(name: string): string {
        return `${XPCONFIG.baseHref}/players/image/${name}`;
    }

    public static playerDefault(): string {
        return `${XPCONFIG.baseHref}/players/image/____`;
    }

    public static forTeam(name: string): string {
        return `${XPCONFIG.baseHref}/teams/image/${name}`;
    }

    public static logoUrl(): string {
        return `${XPCONFIG.assetsUrl}/img/logo.svg`;
    }

}
