import {Component, Input} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {BaseComponent} from './base.component';
import {MaterializeDirective} from 'angular2-materialize/dist/index';

@Component({
    selector: 'list2',
    template: ''
})
export class List2Component extends BaseComponent { //TODO Rename

    @Input() title: string;
    @Input() pages = [1];
    @Input() hideSearchField: boolean;
    @Input() observer: any;
    @Input() detailsPath: string[];
    private searchValue: string;
    private currentPage = 1;


    constructor(route: ActivatedRoute,protected router: Router) {
        super(route);
    }

    onSearchFieldModified() {
        this.currentPage = 1;
        this.refreshData();
    }

    setCurrentPage(page) {
        if (page < 1 || page > this.pages[this.pages.length - 1]) {
            return;
        }
        this.currentPage = page;
        this.refreshData();
    }

    onDetailsClicked() {
        this.router.navigate(this.detailsPath);
    }

    private refreshData() {
        if (this.observer) {
            this.observer.refresh(this.currentPage, this.searchValue);
        }
    }
}
