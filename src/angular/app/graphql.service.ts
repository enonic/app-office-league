import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs';
import {Team} from '../graphql/schemas/Team';
import {Game} from '../graphql/schemas/Game';
import {League} from '../graphql/schemas/League';
import {Player} from '../graphql/schemas/Player';
import {XPCONFIG} from './app.config';

@Injectable()
export class GraphQLService {

    private url = XPCONFIG.graphQlUrl;
    game: Game;
    team: Team;
    league: League;
    player: Player;

    constructor(private http: Http) {
    }

    get(query: string): Promise<any> {
        return this.http.get(this.url + '?query=' + query)
            .map(this.extractData)
            .catch(this.handleError)
            .toPromise();
    }

    post(query: string): Promise<any> {
        return this.http.post(this.url, {query: query})
            .map(this.extractData)
            .catch(this.handleError)
            .toPromise();
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
