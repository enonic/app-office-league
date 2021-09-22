import {Component, EventEmitter, Input, SimpleChanges} from '@angular/core';
import {GraphQLService} from '../../services/graphql.service';
import {AuthService} from '../../services/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {League} from '../../../graphql/schemas/League';
import {LeaguePlayer} from '../../../graphql/schemas/LeaguePlayer';
import {BaseComponent} from '../../common/base.component';
import {PageTitleService} from '../../services/page-title.service';
import {Player} from '../../../graphql/schemas/Player';

@Component({
    selector: 'league-profile-players',
    templateUrl: 'league-profile-players.component.html'
})
export class LeagueProfilePlayersComponent
    extends BaseComponent {

    private static readonly paging = 10;

    @Input() league: League;
    @Input() leaguePlayers: LeaguePlayer[];
    private leagueName: string;
    private pageCount: number = 1;
    adminInLeague: boolean;
    materializeActionsRemove = new EventEmitter<any>();
    materializeActionsApprove = new EventEmitter<any>();
    removePlayer: Player;
    approvePlayer: Player;
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
        let playerId = this.authService.isAuthenticated() ? this.authService.getUser().playerId : '-1';

        let gamesSince = new Date();
        gamesSince.setDate(gamesSince.getDate() - 90);
        let after = currentPage > 1 ? ((currentPage - 1) * LeagueProfilePlayersComponent.paging - 1) : undefined;
        this.graphQLService.post(
            LeagueProfilePlayersComponent.getLeagueQuery,
            {
                name: this.leagueName,
                after: after && btoa('' + after),
                first: LeagueProfilePlayersComponent.paging,
                sort: 'pending DESC, rating DESC, name ASC',
                playerId: playerId,
                gamesSince: gamesSince.toISOString()
            },
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
        this.leaguePlayers = data.league.leaguePlayersConnection.edges.map((edge) => LeaguePlayer.fromJson(edge.node));
        this.pageTitleService.setTitle(this.league.name + ' - Player ranking');
        let totalCount = data.league.leaguePlayersConnection.totalCount;
        this.pageCount = Math.floor((totalCount == 0 ? 0 : totalCount - 1) / LeagueProfilePlayersComponent.paging) + 1;
        this.adminInLeague = data.league.isAdmin;
        this.connectionError = false;
    }

    private handleQueryError() {
        this.connectionError = true;
    }

    onRemovePlayer(player: Player) {
        this.removePlayer = player;
        this.showModalRemove();
    }

    onApprovePlayer(player: Player) {
        this.approvePlayer = player;
        this.showModalApprove();
    }

    onConfirmRemoveClicked() {
        this.graphQLService.post(LeagueProfilePlayersComponent.leavePlayerLeagueQuery,
            {playerId: this.removePlayer.id, leagueId: this.league.id}).then(
            data => {
                this.hideModalRemove();
                this.refresh();
            });
    }

    onConfirmPlayerJoin(allow: boolean) {
        if (allow) {
            this.graphQLService.post(LeagueProfilePlayersComponent.joinPlayerLeagueQuery,
                {playerId: this.approvePlayer.id, leagueId: this.league.id}).then(
                data => {
                    this.hideModalApprove();
                    this.refresh();
                });
        } else {
            this.graphQLService.post(LeagueProfilePlayersComponent.denyJoinLeagueRequestQuery,
                {playerId: this.approvePlayer.id, leagueId: this.league.id}).then(
                data => {
                    this.hideModalApprove();
                    this.refresh();
                });
        }
    }

    public showModalRemove(): void {
        this.materializeActionsRemove.emit({action: "modal", params: ['open']});
    }

    public hideModalRemove(): void {
        this.materializeActionsRemove.emit({action: "modal", params: ['close']});
    }

    public showModalApprove(): void {
        this.materializeActionsApprove.emit({action: "modal", params: ['open']});
    }

    public hideModalApprove(): void {
        this.materializeActionsApprove.emit({action: "modal", params: ['close']});
    }

    private static readonly getLeagueQuery = `query ($name: String, $after:String, $first:Int, $sort: String, $playerId: ID!, $gamesSince: String) {
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
                        pending
                        player {
                            id
                            name
                            imageUrl
                            description
                        }
                        gamePlayers(since: $gamesSince, sort: "time desc", first: -1) {
                            ratingDelta
                            time
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
            isAdmin(playerId:$playerId)
        }
    }`;

    private static readonly joinPlayerLeagueQuery = `mutation ($playerId: ID!, $leagueId:ID!) {
        joinPlayerLeague(playerId: $playerId, leagueId: $leagueId) {
            id
        }
    }`;

    private static readonly leavePlayerLeagueQuery = `mutation ($playerId: ID!, $leagueId:ID!) {
        leavePlayerLeague(playerId: $playerId, leagueId: $leagueId)
    }`;

    private static readonly denyJoinLeagueRequestQuery = `mutation ($playerId: ID!, $leagueId:ID!) {
        denyJoinLeagueRequest(playerId: $playerId, leagueId: $leagueId) {
            id
        }
    }`;
}
