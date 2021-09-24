import {Injectable} from '@angular/core';
import {Config, ConfigUser} from '../app.config';
import {UrlHelper} from '../../graphql/schemas/UrlHelper';

declare var XPCONFIG: Config;

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

    public static userImageProfileUrl(user: ConfigUser): string {
        return `${UrlHelper.trimSlash(XPCONFIG.baseHref)}/players/image-profile/${user.key}`;
    }
}
