import {NamedEntity} from './NamedEntity';
import {ImageService} from '../../app/services/image.service';
import {Handedness, HandednessUtil} from './Handedness';
import {Team} from './Team';
import {LeaguePlayer} from './LeaguePlayer';
import {XPCONFIG} from '../../app/app.config';
import {UrlHelper} from './UrlHelper';
import {PlayerStats} from './PlayerStats';

export class InfoPage {
    name: string;
    title: string;
    body: string;

    constructor() {
    }

    static fromJson(json: any): InfoPage {
        let infoPage = new InfoPage();
        infoPage.name = json.name || '';
        infoPage.title = json.title || '';
        infoPage.body = json.body || '';
        return infoPage;
    }
}
