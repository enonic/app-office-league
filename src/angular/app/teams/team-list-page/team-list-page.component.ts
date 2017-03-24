import {Component, Input, SimpleChanges} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {BaseComponent} from '../../common/base.component';
import {Team} from '../../../graphql/schemas/Team';
import {GraphQLService} from '../../services/graphql.service';
import {MaterializeDirective} from '../../../../../node_modules/angular2-materialize/dist/index.d';
import {PageTitleService} from '../../services/page-title.service';

@Component({
    selector: 'team-list-page',
    templateUrl: 'team-list-page.component.html'
})
export class TeamListPageComponent extends BaseComponent {
    private static readonly paging = 10;
    private static readonly getTeamsQuery = `query($after:Int,$first:Int, $search:String) {
        teamsConnection(after:$after, first:$first, search:$search) {
            totalCount
            edges {
                node {
                  name
                }
            }
        }
    }`;

    private teams: Team[];
    private pageCount: number = 1;

    constructor(private router: Router, private service: GraphQLService,
                private pageTitleService: PageTitleService, route: ActivatedRoute) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.refresh();
    }

    private refresh(currentPage: number = 1, search: string = '') {
        let after = currentPage > 1 ? ((currentPage - 1) * TeamListPageComponent.paging - 1) : undefined;
        this.service.post(TeamListPageComponent.getTeamsQuery,{after: after,first: TeamListPageComponent.paging, search: search}).
            then((data: any) => {
                this.teams = data.teamsConnection.edges.map(edge => Team.fromJson(edge.node));
                let totalCount = data.teamsConnection.totalCount;
                this.pageCount = Math.floor((totalCount == 0 ? 0: totalCount - 1) / TeamListPageComponent.paging) + 1;
            });
        this.pageTitleService.setTitle('Teams');
    }
}
