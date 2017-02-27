import {Input, Component, OnChanges, SimpleChanges, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
    selector: 'base',
    template: ''
})
export class BaseComponent implements OnInit, OnChanges {

    @Input() protected autoLoad: boolean;
    protected query: string;

    constructor(protected route: ActivatedRoute, query?: string) {
        this.query = query;
    }

    ngOnInit(): void {
        if (this.autoLoad == undefined) {
            this.autoLoad = this.route.snapshot.data['autoLoad'] == true;
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        console.log('BaseComponent.ngOnChanges()', changes);
    }

}
