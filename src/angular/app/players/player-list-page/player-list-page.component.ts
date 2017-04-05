import {Component} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {BaseComponent} from '../../common/base.component';
import {Player} from '../../../graphql/schemas/Player';
import {GraphQLService} from '../../services/graphql.service';
import {PageTitleService} from '../../services/page-title.service';

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
                  imageUrl
                  description
                }
            }
        }
    }`;

    public players: Player[];
    public pageCount: number = 1;

    constructor(private router: Router, private service: GraphQLService, private pageTitleService: PageTitleService, route: ActivatedRoute) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.refresh();
    }

    private refresh(currentPage: number = 1, search: string = '') {
        let after = currentPage > 1 ? ((currentPage - 1) * PlayerListPageComponent.paging - 1) : undefined;
        this.service.post(
            PlayerListPageComponent.getPlayersQuery,
            {after: after,first: PlayerListPageComponent.paging, search: search},
            data => {
                this.players = data.playersConnection.edges.map(edge => Player.fromJson(edge.node));
                let totalCount = data.playersConnection.totalCount;
                this.pageCount = Math.floor((totalCount == 0 ? 0: totalCount - 1) / PlayerListPageComponent.paging) + 1;
            }
        );

        this.pageTitleService.setTitle('Players');
    }
}
