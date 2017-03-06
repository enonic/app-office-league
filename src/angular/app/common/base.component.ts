import {Input, Component, OnChanges, SimpleChanges, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

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

}
