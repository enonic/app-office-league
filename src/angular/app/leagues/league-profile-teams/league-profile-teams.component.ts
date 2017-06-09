import {Component, Input, SimpleChanges} from '@angular/core';
import {GraphQLService} from '../../services/graphql.service';
import {AuthService} from '../../services/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {League} from '../../../graphql/schemas/League';
import {LeagueTeam} from '../../../graphql/schemas/LeagueTeam';
import {BaseComponent} from '../../common/base.component';
import {Team} from '../../../graphql/schemas/Team';
import {PageTitleService} from '../../services/page-title.service';

@Component({
    selector: 'league-profile-teams',
    templateUrl: 'league-profile-teams.component.html'
})
export class LeagueProfileTeamsComponent
    extends BaseComponent {

    private static readonly paging = 10;
    private static readonly getLeagueQuery = `query ($name: String, $after:Int, $first:Int, $sort: String) {
        league(name: $name) {
            id
            name
            imageUrl
            leagueTeamsConnection(after:$after, first:$first, sort:$sort) {
                totalCount
                edges {
                    node {
                        rating
                        ranking
                        team {
                            name
                            imageUrl
                            players {
                                id
                                name
                                imageUrl
                            }
                        }    
                    }
                }
                
            }
        }
    }`;

    @Input() league: League;
    @Input() leagueTeams: LeagueTeam[];
    private leagueName: string;
    private members: Team[];
    private pageCount: number = 1;
    connectionError: boolean;

    constructor(route: ActivatedRoute, private graphQLService: GraphQLService, private authService: AuthService, private router: Router,
                private pageTitleService: PageTitleService) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.leagueName = this.route.snapshot.params['name'];
        this.refresh();
    }

    refresh(currentPage: number = 1) {
        let after = currentPage > 1 ? ((currentPage - 1) * LeagueProfileTeamsComponent.paging - 1) : undefined;
        this.graphQLService.post(
            LeagueProfileTeamsComponent.getLeagueQuery,
            {name: this.leagueName, after: after, first: LeagueProfileTeamsComponent.paging, sort: 'rating DESC, name ASC'},
            data => this.handleLeagueQueryResponse(data),
            () => this.handleQueryError()
        ).catch(error => {
            this.handleQueryError();
        });
    }

    private handleLeagueQueryResponse(data) {
        if (!data || !data.league) {
            this.handleQueryError();
            return;
        }

        this.league = League.fromJson(data.league);
        this.leagueTeams = data.league.leagueTeamsConnection.edges.map((edge) => LeagueTeam.fromJson(edge.node));
        this.pageTitleService.setTitle(this.league.name + ' - Team ranking');
        let totalCount = data.league.leagueTeamsConnection.totalCount;
        this.pageCount = Math.floor((totalCount == 0 ? 0 : totalCount - 1) / LeagueProfileTeamsComponent.paging) + 1;
        this.connectionError = false;
    }

    private handleQueryError() {
        this.connectionError = true;
    }

}
