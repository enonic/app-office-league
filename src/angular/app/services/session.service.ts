import {Injectable, OnInit} from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs';
import {XPCONFIG} from '../app.config';
import {SessionInfo} from '../app.session';

@Injectable()
export class SessionService implements OnInit {

    private sessionServiceUrl = XPCONFIG.sessionUrl;
    private sessionInfo: SessionInfo;
    constructor(private http: Http) {
    }

    ngOnInit(): void {
        this.retrieveSessionInfo().then((json) => {
            this.sessionInfo = json;
        })
    }
    
    public getSessionInfo(): SessionInfo {
        return this.sessionInfo;
    }

    private retrieveSessionInfo(): Promise<any> {
        return this.http.get(this.sessionServiceUrl)
            .map(this.extractData)
            .catch(this.handleError)
            .toPromise();
    }


    private extractData(res: Response) {
        return res.json() || {};
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
