import {Injectable} from '@angular/core';
import {XPCONFIG} from './app.config';

@Injectable()
export class ImageService {

    constructor() {
    }

    public static forLeague(name: string): string {
        return `${XPCONFIG.baseHref}/leagues/image/${name}`;
    }

}
