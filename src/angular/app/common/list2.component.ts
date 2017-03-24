import {Component, Input, SimpleChanges} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {BaseComponent} from './base.component';
import {MaterializeDirective} from 'angular2-materialize/dist/index';

@Component({
    selector: 'list2',
    template: ''
})
export class List2Component extends BaseComponent { //TODO Rename

    @Input() title: string;
    @Input() hideSearchField: boolean;
    @Input() observer: any;
    @Input() detailsPath: string[];
    @Input() pageCount: number = 1;
    private searchValue: string;
    private currentPage = 1;
    private pages: string[];
    private static readonly pagesCountBeforeAfter: number = 3;

    constructor(route: ActivatedRoute, protected router: Router) {
        super(route);
    }

    ngOnInit(): void {
        this.refreshPages();
    }

    ngOnChanges(changes: SimpleChanges): void {
        super.ngOnChanges(changes);

        let pageCountChange = changes['pageCount'];
        if (pageCountChange && pageCountChange.currentValue && pageCountChange.currentValue != pageCountChange.previousValue) {
            this.refreshPages();
        }
    }

    refreshPages() {
        let pages = ['1'];
        if (this.currentPage > List2Component.pagesCountBeforeAfter + 2) {
            pages.push('...');
        }
        for (let i = Math.max(2, this.currentPage - List2Component.pagesCountBeforeAfter);
             i <= Math.min(this.pageCount - 1, this.currentPage + List2Component.pagesCountBeforeAfter); i++) {
            pages.push(i.toString());
        }
        if (this.pageCount > this.currentPage + List2Component.pagesCountBeforeAfter + 1) {
            pages.push('...');
        }
        if (this.pageCount > 1) {
            pages.push(this.pageCount.toString());
        }
        this.pages = pages;
        console.log('pages', pages);
    }


    onSearchFieldModified() {
        this.currentPage = 1;
        this.refreshData();
    }

    setCurrentPage(page) {
        console.log('setCurrentPage', page);
        if (page != '...') {
            let pageNumber: number = parseInt(page);

            if (this.currentPage !== pageNumber && (pageNumber > 0 && pageNumber <= this.pageCount)) {
                this.currentPage = pageNumber;
                this.refreshPages();
                this.refreshData();
            }
        }

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
