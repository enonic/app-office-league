import {Component, OnInit, Input, SimpleChanges, OnChanges} from '@angular/core';
import {BaseComponent} from '../../common/base.component';
import {Router, ActivatedRoute} from '@angular/router';
import {GraphQLService} from '../../graphql.service';
import {Team} from '../../../graphql/schemas/Team';
import {ListComponent} from '../../common/list.component';

@Component({
    selector: 'team-list',
    templateUrl: 'team-list.component.html'
})
export class TeamListComponent extends BaseComponent {

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
    
    @Input() title: string;
    @Input() teams: Team[];
    @Input() detailsPath: string[];
    private searchValue: string;
    private currentPage = 1;
    private pages = [1];

    constructor(route: ActivatedRoute, private router: Router, private service: GraphQLService) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        if (this.teams == undefined) {
            this.refreshData();
        }
    }

    onTeamClicked(team: Team) {
        this.service.team = team;
        this.router.navigate(['teams', team.name.toLowerCase()])
    }

    onDetailsClicked() {
        this.router.navigate(this.detailsPath);
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
        let after = this.currentPage > 1 ? ((this.currentPage - 1) * TeamListComponent.paging - 1) : undefined;
        this.service.post(TeamListComponent.getTeamsQuery,{after: after,first: TeamListComponent.paging, search: this.searchValue}).
            then((data: any) => {
                this.teams = data.teamsConnection.edges.map(edge => Team.fromJson(edge.node));
                this.pages = [];
                let pagesCount = data.teamsConnection.totalCount / TeamListComponent.paging + 1;
                for (var i = 1; i <= pagesCount; i++) {
                    this.pages.push(i);
                }
            });
    }
}
