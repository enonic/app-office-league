import {Component, Input, SimpleChanges} from '@angular/core';
import {GraphQLService} from '../../services/graphql.service';
import {AuthService} from '../../services/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {League} from '../../../graphql/schemas/League';
import {LeaguePlayer} from '../../../graphql/schemas/LeaguePlayer';
import {BaseComponent} from '../../common/base.component';
import {Player} from '../../../graphql/schemas/Player';
import {PageTitleService} from '../../services/page-title.service';

@Component({
    selector: 'league-profile-players',
    templateUrl: 'league-profile-players.component.html'
})
export class LeagueProfilePlayersComponent extends BaseComponent {

    private static readonly paging = 10;
    private static readonly getLeagueQuery = `query ($name: String, $after:Int, $first:Int, $sort: String) {
        league(name: $name) {
            id
            name
            imageUrl
            leaguePlayersConnection(after:$after, first:$first, sort:$sort) {
                totalCount
                edges {
                    node {
                        rating
                        ranking
                        player {
                            name
                            imageUrl
                            description
                        }    
                    }
                }
                
            }
            nonMemberPlayers {
                id
                name
                imageUrl
                description
            }
        }
    }`;

    private static readonly joinPlayerLeagueQuery = `mutation ($playerId: ID!, $leagueId:ID!) {
        joinPlayerLeague(playerId: $playerId, leagueId: $leagueId) {
            id
            imageUrl
        }
    }`;

    @Input() league: League;
    @Input() leaguePlayers: LeaguePlayer[];
    private leagueName: string;
    private pageCount: number = 1;

    constructor(route: ActivatedRoute, private graphQLService: GraphQLService, private authService: AuthService, private router: Router, private pageTitleService: PageTitleService) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.leagueName = this.route.snapshot.params['name'];
        this.refresh();
    }

    refresh(currentPage: number = 1) {
        let after = currentPage > 1 ? ((currentPage - 1) * LeagueProfilePlayersComponent.paging - 1) : undefined;
        this.graphQLService.post(
            LeagueProfilePlayersComponent.getLeagueQuery,
            {name: this.leagueName, after: after, first: LeagueProfilePlayersComponent.paging, sort: 'rating DESC, name ASC'},
            data => this.handleLeagueQueryResponse(data)
        );
    }

    private handleLeagueQueryResponse(data) {
        this.league = League.fromJson(data.league);
        this.leaguePlayers = data.league.leaguePlayersConnection.edges.map((edge) => LeaguePlayer.fromJson(edge.node));
        this.pageTitleService.setTitle(this.league.name + ' - Player ranking');
        let totalCount = data.league.leaguePlayersConnection.totalCount;
        this.pageCount = Math.floor((totalCount == 0 ? 0: totalCount - 1) / LeagueProfilePlayersComponent.paging) + 1;
    }
}
