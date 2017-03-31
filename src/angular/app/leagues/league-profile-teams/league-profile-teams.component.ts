import {Component, Input, SimpleChanges} from '@angular/core';
import {GraphQLService} from '../../services/graphql.service';
import {AuthService} from '../../services/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {League} from '../../../graphql/schemas/League';
import {LeagueTeam} from '../../../graphql/schemas/LeagueTeam';
import {BaseComponent} from '../../common/base.component';
import {Team} from '../../../graphql/schemas/Team';

@Component({
    selector: 'league-profile-teams',
    templateUrl: 'league-profile-teams.component.html'
})
export class LeagueProfileTeamsComponent extends BaseComponent {

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

    constructor(route: ActivatedRoute, private graphQLService: GraphQLService, private authService: AuthService, private router: Router) {
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
            data => this.handleLeagueQueryResponse(data)
        );
    }

    private handleLeagueQueryResponse(data) {
        this.league = League.fromJson(data.league);
        this.leagueTeams = data.league.leagueTeamsConnection.edges.map((edge) => LeagueTeam.fromJson(edge.node));

        let totalCount = data.league.leagueTeamsConnection.totalCount;
        this.pageCount = Math.floor((totalCount == 0 ? 0: totalCount - 1) / LeagueProfileTeamsComponent.paging) + 1;
    }
}
