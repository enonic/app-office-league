import {Injectable} from '@angular/core';
import {catchError, EMPTY, lastValueFrom, map, throwError} from 'rxjs';
import {Team} from '../../graphql/schemas/Team';
import {Game} from '../../graphql/schemas/Game';
import {League} from '../../graphql/schemas/League';
import {Player} from '../../graphql/schemas/Player';
import {CryptoService} from './crypto.service';
import {AuthService} from './auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Config } from '../app.config';

declare var XPCONFIG: Config;

@Injectable()
export class GraphQLService {

    private url = XPCONFIG.graphQlUrl;
    game: Game;
    team: Team;
    league: League;
    player: Player;

    constructor(private http: HttpClient, private cryptoService: CryptoService, private authService: AuthService) {
    }
    post(query: string, variables?: {[key: string]: any}, successCallback?: (data) => void, failureCallback?: (error) => void): Promise<any> {
        let body = JSON.stringify({query: query, variables: variables});
        let hash = this.cryptoService.sha1(body);
        let url = this.url + '?etag=' + hash;

        const httpOptions = {
            headers: new HttpHeaders({
                'Accept': 'application/json'
            })
        };

        let networkPromise = lastValueFrom(this.http.post(url, body, httpOptions).pipe(
            map((dto: any) => dto.data),
            catchError(this.handleError)
        ));

        if (typeof CacheStorage !== "undefined" && !!successCallback) {
            return this.getCachePromise(url, networkPromise, successCallback, failureCallback);
        }

        if (!!successCallback) {
            return networkPromise.then(successCallback);
        }

        return networkPromise;
    }

    private getCachePromise(url: string, fallbackPromise: Promise<any>, responseCallback: (data) => void, failureCallback?: (error) => void): Promise<any> {
        let responseReceived = false;
        let cacheFound = false;

        fallbackPromise
            .then(data => { responseReceived = true; return data; })
            .then(responseCallback)
            .catch(error => {
                if (!cacheFound) {
                    if (!!failureCallback) {
                        failureCallback(error);
                    }
                }
            });

        return caches.match(url)
            .then(res => this.extractCachedData(res))
            .then(json => {
                // don't overwrite newer network data
                    if (json && !responseReceived) {
                        cacheFound = true;
                        responseCallback(json.data);
                    }
                })
            // fall back to network if we didn't get cached data
            .catch(() => fallbackPromise);
    }

    private extractCachedData(res: Response) {
        return res.json();
    }

    private handleError(error: any) {
        if (!navigator.onLine) {
            return EMPTY;
        }

        if (error.status === 401) {
            if (this.authService.isAuthenticated()) {
                this.authService.login();
            }
            return throwError('Not authenticated');
        }

        let errMsg: string;
        if (Array.isArray(error)) {
            errMsg = error[0].message ? error[0].message : JSON.stringify(error);
            return throwError(error);
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return throwError('Failed to retrieve data');
    }

}
