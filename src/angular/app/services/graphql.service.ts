import {Injectable} from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs';
import {Team} from '../../graphql/schemas/Team';
import {Game} from '../../graphql/schemas/Game';
import {League} from '../../graphql/schemas/League';
import {Player} from '../../graphql/schemas/Player';
import {CryptoService} from './crypto.service';
import {XPCONFIG} from '../app.config';

@Injectable()
export class GraphQLService {

    private url = XPCONFIG.graphQlUrl;
    game: Game;
    team: Team;
    league: League;
    player: Player;

    constructor(private http: Http, private cryptoService: CryptoService) {
    }
    post(query: string, variables?: {[key: string]: any}, responseCallback?: (data) => void): Promise<any> {
        var body = JSON.stringify({query: query, variables: variables});
        var hash = this.cryptoService.sha1(body);
        var url = this.url + '?etag=' + hash;

        let headers = new Headers();
        headers.append('Content-Type', 'application/json; charset=utf-8');
        let options = new RequestOptions({headers: headers});

        let networkPromise = this.http.post(url, body, options)
            .map(this.extractData)
            .catch(this.handleError)
            .toPromise();

        return (!!responseCallback) ? this.getCachePromise(url, networkPromise, responseCallback) : networkPromise;
    }

    private getCachePromise(url: string, fallbackPromise: Promise<any>, responseCallback: (data) => void): Promise<any> {
        var responseReceived = false;

        fallbackPromise
            .then(data => { responseReceived = true; return data; })
            .then(responseCallback);

        return caches.match(url)
            .then(
                res => this.extractCachedData(res),
                error => this.handleError
            )
            // don't overwrite newer network data
            .then(
                json => responseReceived ? null : (json.data || {}) 
            )
            // fall back to network if we didn't get cached data
            .catch(() => fallbackPromise)
            .then(responseCallback);
    }

    private extractCachedData(res: Response) {
        return res.json();
    }

    private extractData(res: Response) {
        let json = res.json();
        return json.data || {};
    }

    private handleError(error: Response | any) {
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || '';
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return Observable.throw(errMsg);
    }

}
