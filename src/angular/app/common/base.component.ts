import {Component, OnChanges, SimpleChanges, OnInit, OnDestroy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable, throwError} from 'rxjs';

@Component({
    selector: 'base',
    template: ''
})
export class BaseComponent implements OnInit, OnChanges, OnDestroy {

    protected query: any;

    constructor(protected route: ActivatedRoute) {
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        //console.log('BaseComponent.ngOnChanges()', changes);
    }
    
    ngOnDestroy(): void {        
    }

    protected setQuery(query: string): BaseComponent {
        this.query = query;
        return this;
    }

    protected extractData(res: Response) {
        let json = res.json() as any;
        return json.data || {};
    }

    protected handleError(error: Response | any) {
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || '' as any;
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return throwError(errMsg);
    }
}
