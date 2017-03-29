import {Injectable} from '@angular/core';
import {XPCONFIG} from '../app.config';
import {UrlHelper} from '../../graphql/schemas/UrlHelper';

@Injectable()
export class ImageService {

    constructor() {
    }

    public static playerDefault(): string {
        return `${UrlHelper.trimSlash(XPCONFIG.baseHref)}/players/image/__/__`;
    }

    public static teamDefault(): string {
        return `${UrlHelper.trimSlash(XPCONFIG.baseHref)}/teams/image/__/__`;
    }

    public static leagueDefault(): string {
        return `${UrlHelper.trimSlash(XPCONFIG.baseHref)}/leagues/image/__/__`;
    }

    public static logoUrl(): string {
        return `${UrlHelper.trimSlash(XPCONFIG.baseHref)}/img/logo.svg`;
    }
}
