import {Component, Input, SimpleChanges, EventEmitter} from '@angular/core';
import {GraphQLService} from '../../graphql.service';
import {AuthService} from '../../auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {League} from '../../../graphql/schemas/League';
import {LeaguePlayer} from '../../../graphql/schemas/LeaguePlayer';
import {BaseComponent} from '../../common/base.component';
import {Player} from '../../../graphql/schemas/Player';
import {Team} from '../../../graphql/schemas/Team';
import {MaterializeDirective,MaterializeAction} from "angular2-materialize/dist/index";

@Component({
    selector: 'league-profile-players',
    templateUrl: 'league-profile-players.component.html'
})
export class LeagueProfilePlayersComponent extends BaseComponent {
    materializeActions = new EventEmitter<string|MaterializeAction>();

    private static readonly paging = 10;
    private static readonly getLeagueQuery = `query ($name: String, $after:Int, $first:Int, $sort: String) {
        league(name: $name) {
            id
            name
            leaguePlayersConnection(after:$after, first:$first, sort:$sort) {
                totalCount
                edges {
                    node {
                        rating
                        ranking
                        player {
                            name
                        }    
                    }
                }
                
            }
            nonMemberPlayers {
                id
                name
            }
        }
    }`;

    private static readonly joinPlayerLeagueQuery = `mutation ($playerId: ID!, $leagueId:ID!) {
        joinPlayerLeague(playerId: $playerId, leagueId: $leagueId) {
            id
        }
    }`;

    @Input() league: League;
    @Input() leaguePlayers: LeaguePlayer[];
    private leagueName: string;
    private pages = [1];

    constructor(route: ActivatedRoute, private graphQLService: GraphQLService, private authService: AuthService, private router: Router) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.leagueName = this.route.snapshot.params['name'];
        this.refresh();
    }

    refresh(currentPage: number = 1) {
        let after = currentPage > 1 ? ((currentPage - 1) * LeagueProfilePlayersComponent.paging - 1) : undefined;
        this.graphQLService.post(LeagueProfilePlayersComponent.getLeagueQuery,  {name: this.leagueName, after: after, first: LeagueProfilePlayersComponent.paging, sort: 'rating DESC, name ASC'}).
            then(data => {
                this.league = League.fromJson(data.league);
                this.leaguePlayers = data.league.leaguePlayersConnection.edges.map((edge) => LeaguePlayer.fromJson(edge.node));

                this.pages = [];
                let totalCount = data.league.leaguePlayersConnection.totalCount;
                let pagesCount = (totalCount == 0 ? 0 : totalCount - 1) / LeagueProfilePlayersComponent.paging + 1;
                for (var i = 1; i <= pagesCount; i++) {
                    this.pages.push(i);
                }
            });
    }

    openAddPlayerModal(): void {
        this.materializeActions.emit({action: "modal", params: ['open']});
    }

    closeAddPlayerModal(): void {
        this.materializeActions.emit({action: "modal", params: ['close']});
    }

    addPlayer(player: Player): void {
        console.log('add ' + player.name);
        this.graphQLService.post(LeagueProfilePlayersComponent.joinPlayerLeagueQuery, {playerId: player.id, leagueId: this.league.id}).then(
                data => {
                this.refresh();
            });
        this.closeAddPlayerModal();
    }
}
