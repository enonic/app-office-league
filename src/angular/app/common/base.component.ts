import {Component, OnChanges, SimpleChanges, OnInit, OnDestroy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable, throwError} from 'rxjs/';
import { resolve } from 'path';
import { HttpErrorResponse } from '@angular/common/http';

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

    protected extractData(res : Promise<any>) {
        return res;
    }

    protected handleError(error: HttpErrorResponse) {
        console.error(
            `Error code: ${error.status}` +
            `body was ${error.error}` 
        );

        return throwError(error.message);
        
        //return Observable.throw(errMsg);
    }
}
