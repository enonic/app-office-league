import {Component, Input, SimpleChanges} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {BaseComponent} from '../../common/base.component';
import {Team} from '../../../graphql/schemas/Team';
import {GraphQLService} from '../../graphql.service';
import {MaterializeDirective} from 'angular2-materialize/dist/index';

@Component({
    selector: 'team-list',
    templateUrl: 'team-list.component.html'
})
export class TeamListComponent extends BaseComponent {

    @Input() title: string;
    @Input() teams: Team[];
    @Input() pages = [1];
    @Input() hideSearchField: boolean;
    @Input() observer: any;
    private searchValue: string;
    private currentPage = 1;

    constructor(private router: Router, private service: GraphQLService, route: ActivatedRoute) {
        super(route);
    }

    onTeamClicked(team: Team) {
        this.router.navigate(['teams', team.name.toLowerCase()]);
    }

    onSearchFieldModified() {
        this.currentPage = 1;
        this.refreshData();
    }

    setCurrentPage(page) {
        if (page < 1 || page > this.pages.length) {
            return;
        }
        this.currentPage = page;
        this.refreshData();
    }

    private refreshData() {
        if (this.observer) {
            this.observer.refresh(this.currentPage, this.searchValue);
        }
    }
}
