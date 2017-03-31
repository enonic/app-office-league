import {Input, Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {BaseComponent} from './base.component';

@Component({
    selector: 'list',
    template: ''
})
export class ListComponent extends BaseComponent {

    @Input() public limit: any;
    @Input() public title: any;

    constructor(route: ActivatedRoute) {
        super(route);
    }

    setLimit(limit: number = 10): ListComponent {
        this.limit = limit;
        return this;
    }
}
