import {Input, Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {BaseComponent} from './base.component';

@Component({
    selector: 'list',
    template: ''
})
export class ListComponent extends BaseComponent {

    @Input() protected limit: number;
    @Input() protected title: string;

    constructor(route: ActivatedRoute, query?: string, limit: number = 10) {
        super(route, query);
        this.limit = limit;
    }
}
