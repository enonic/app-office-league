import {Input, Component, OnChanges, SimpleChanges, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';

@Component({
    selector: 'base',
    template: ''
})
export class BaseComponent implements OnInit, OnChanges {

    protected query: string;

    constructor(protected route: ActivatedRoute, query?: string) {
        this.query = query;
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        //console.log('BaseComponent.ngOnChanges()', changes);
    }

    protected extractData(res: Response) {
        let json = res.json();
        return json.data || {};
    }

    protected handleError(error: Response | any) {
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
