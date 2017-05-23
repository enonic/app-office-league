import {Injectable} from '@angular/core';
import {XPCONFIG} from '../app.config';
import {UrlHelper} from '../../graphql/schemas/UrlHelper';

@Injectable()
export class ImageService {

    constructor() {
    }

    public static playerDefault(): string {
        return `${UrlHelper.trimSlash(XPCONFIG.baseHref)}/players/image/-/default`;
    }

    public static teamDefault(): string {
        return `${UrlHelper.trimSlash(XPCONFIG.baseHref)}/teams/image/-/default`;
    }

    public static leagueDefault(): string {
        return `${UrlHelper.trimSlash(XPCONFIG.baseHref)}/leagues/image/-/default`;
    }

    public static logoUrl(): string {
        return `${UrlHelper.trimSlash(XPCONFIG.assetsUrl)}/img/logo.svg`;
    }
}
