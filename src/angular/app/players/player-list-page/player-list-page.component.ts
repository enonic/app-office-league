import {Component, Input, SimpleChanges} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {BaseComponent} from '../../common/base.component';
import {Player} from '../../../graphql/schemas/Player';
import {GraphQLService} from '../../graphql.service';
import {MaterializeDirective} from 'angular2-materialize/dist/index';

@Component({
    selector: 'player-list-page',
    templateUrl: 'player-list-page.component.html'
})
export class PlayerListPageComponent extends BaseComponent {
    private static readonly paging = 10;
    private static readonly getPlayersQuery = `query($after:Int,$first:Int, $search:String) {
        playersConnection(after:$after, first:$first, search:$search) {
            totalCount
            edges {
                node {
                  name
                }
            }
        }
    }`;

    private players: Player[];
    private pages = [1];

    constructor(private router: Router, private service: GraphQLService, route: ActivatedRoute) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.refreshData();
    }

    private refreshData(currentPage: number = 1, search: string = '') {
        let after = currentPage > 1 ? ((currentPage - 1) * PlayerListPageComponent.paging - 1) : undefined;
        this.service.post(PlayerListPageComponent.getPlayersQuery,{after: after,first: PlayerListPageComponent.paging, search: search}).
            then((data: any) => {
                this.players = data.playersConnection.edges.map(edge => Player.fromJson(edge.node));
                this.pages = [];
                let pagesCount = data.playersConnection.totalCount / PlayerListPageComponent.paging + 1;
                for (var i = 1; i <= pagesCount; i++) {
                    this.pages.push(i);
                }
            });
    }
}
