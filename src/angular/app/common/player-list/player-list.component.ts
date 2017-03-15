import {Component, Input, SimpleChanges} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {BaseComponent} from '../../common/base.component';
import {Player} from '../../../graphql/schemas/Player';
import {GraphQLService} from '../../graphql.service';
import {MaterializeDirective} from 'angular2-materialize/dist/index';

@Component({
    selector: 'player-list',
    templateUrl: 'player-list.component.html'
})
export class PlayerListComponent extends BaseComponent {

    @Input() title: string;
    @Input() players: Player[];
    @Input() pages = [1];
    @Input() hideSearchField: boolean;
    @Input() refreshDataCallback: Function;
    private searchValue: string;
    private currentPage = 1;

    constructor(private router: Router, private service: GraphQLService, route: ActivatedRoute) {
        super(route);
    }

    onPlayerClicked(player: Player) {
        this.router.navigate(['players', player.name.toLowerCase()]);
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
        if (this.refreshDataCallback) {
            this.refreshDataCallback(this.currentPage, this.searchValue);
        }
    }
}
