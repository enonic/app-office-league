import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {GraphQLService} from '../../services/graphql.service';
import {AuthService} from '../../services/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {League} from '../../../graphql/schemas/League';
import {BaseComponent} from '../../common/base.component';
import {Game} from '../../../graphql/schemas/Game';
import {PageTitleService} from '../../services/page-title.service';
import {Player} from '../../../graphql/schemas/Player';
import {MaterializeAction, MaterializeDirective} from 'angular2-materialize/dist/index';

@Component({
    selector: 'league-profile',
    templateUrl: 'league-profile.component.html',
    styleUrls: ['league-profile.component.less']
})
export class LeagueProfileComponent
    extends BaseComponent
    implements OnChanges {

    @Input() league: League;
    playerInLeague: boolean;
    adminInLeague: boolean;
    joinLeagueRequested: boolean;
    activeGames: Game[] = [];
    nonMembersPlayerIds: string[] = [];
    removePlayer: Player;
    approvePlayer: Player;
    materializeActions = new EventEmitter<string | MaterializeAction>();
    materializeActionsRemove = new EventEmitter<string | MaterializeAction>();
    materializeActionsApprove = new EventEmitter<string | MaterializeAction>();
    materializeActionsPending = new EventEmitter<string | MaterializeAction>();
    materializeActionsDelete = new EventEmitter<string | MaterializeAction>();
    materializeActionsLeave = new EventEmitter<string | MaterializeAction>();

    constructor(route: ActivatedRoute, private authService: AuthService, private graphQLService: GraphQLService,
                private pageTitleService: PageTitleService, private router: Router) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        let name = this.route.snapshot.params['name'];

        if (!this.league && name) {
            this.refreshData(name);
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        super.ngOnChanges(changes);

        let leagueChange = changes['league'];
        if (leagueChange && leagueChange.currentValue) {
            this.pageTitleService.setTitle((<League>leagueChange.currentValue).name);
        }
    }

    refreshData(leagueName: String): void {
        let playerId = this.authService.isAuthenticated() ? this.authService.getUser().playerId : '-1';

        const getLeagueParams = {
            name: leagueName, first: 3, sort: 'pending ASC, rating DESC, name ASC', playerId: playerId,
            activeGameCount: 3, gameCount: 3
        };
        this.graphQLService.post(
            LeagueProfileComponent.getLeagueQuery,
            getLeagueParams,
            data => this.handleLeagueQueryResponse(data)
        );
    }

    private handleLeagueQueryResponse(data) {
        if (!data.league) {
            this.router.navigate(['leagues']);
            return null;
        }
        this.league = League.fromJson(data.league);
        this.joinLeagueRequested = !!(data.league.myLeaguePlayer && data.league.myLeaguePlayer.pending);
        this.playerInLeague = !!data.league.myLeaguePlayer && !this.joinLeagueRequested;
        this.adminInLeague = data.league.isAdmin;
        this.activeGames = data.league.activeGames.map((gameJson) => {
            let game = Game.fromJson(gameJson);
            game.live = true;
            return game;
        });
        this.nonMembersPlayerIds = data.league.nonMemberPlayers.map((player) => player.id);

        this.pageTitleService.setTitle(this.league.name);
    }

    format(value: number, none: string, one: string, multiple: string): string {
        if (value === 0) {
            return none;
        } else if (value === 1) {
            return value + " " + one;
        } else {
            return value + " " + multiple;
        }
    }

    onPlayClicked() {
        this.router.navigate(['games', this.league.id, 'new-game']);
    }

    onEditClicked() {
        this.router.navigate(['leagues', this.league.name.toLowerCase(), 'edit']);
    }

    onAddPlayerClicked() {
        this.showModal();
    }

    onDeleteClicked() {
        this.showModalDelete();
    }

    onLeaveClicked() {
        this.showModalLeave();
    }

    onJoinClicked() {
        if (this.authService.isAuthenticated() && !this.playerInLeague) {
            let playerId = this.authService.getUser().playerId;
            this.graphQLService.post(LeagueProfileComponent.requestJoinLeagueQuery, {leagueId: this.league.id}).then(
                data => {
                    this.refreshData(this.league.name);
                });
        }
    }

    onSelected(player: Player) {
        if (player) {
            this.graphQLService.post(LeagueProfileComponent.joinPlayerLeagueQuery, {playerId: player.id, leagueId: this.league.id}).then(
                data => {
                    this.hideModal();
                    this.refreshData(this.league.name);
                });
        }
    }

    onRemovePlayer(player: Player) {
        this.removePlayer = player;
        this.showModalRemove();
    }

    onApprovePlayerJoin(player: Player) {
        this.approvePlayer = player;
        this.showModalApprove();
    }

    onConfirmRemoveClicked() {
        this.graphQLService.post(LeagueProfileComponent.leavePlayerLeagueQuery,
            {playerId: this.removePlayer.id, leagueId: this.league.id}).then(
            data => {
                this.hideModalRemove();
                this.refreshData(this.league.name);
            });
    }

    onConfirmPlayerJoin(allow: boolean) {
        if (allow) {
            this.graphQLService.post(LeagueProfileComponent.joinPlayerLeagueQuery,
                {playerId: this.approvePlayer.id, leagueId: this.league.id}).then(
                data => {
                    this.hideModalApprove();
                    this.refreshData(this.league.name);
                });
        } else {
            this.graphQLService.post(LeagueProfileComponent.denyJoinLeagueRequestQuery,
                {playerId: this.approvePlayer.id, leagueId: this.league.id}).then(
                data => {
                    this.hideModalApprove();
                    this.refreshData(this.league.name);
                });
        }
    }

    onConfirmDeleteClicked() {
        this.graphQLService.post(LeagueProfileComponent.deleteLeagueQuery,
            {name: this.league.name}).then(
                data => {
                this.hideModalDelete();
                this.router.navigate(['leagues']);
            });
    }

    onConfirmLeaveClicked() {
        this.graphQLService.post(LeagueProfileComponent.leavePlayerLeagueQuery,
            {playerId: this.authService.getUser().playerId, leagueId: this.league.id}).then(
                data => {
                this.hideModalLeave();
                this.refreshData(this.league.name);
            });
    }

    showModal(): void {
        this.materializeActions.emit({action: "modal", params: ['open']});
    }

    hideModal(): void {
        this.materializeActions.emit({action: "modal", params: ['close']});
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

    public showModalPending(): void {
        this.materializeActionsPending.emit({action: "modal", params: ['open']});
    }

    public hideModalPending(): void {
        this.materializeActionsPending.emit({action: "modal", params: ['close']});
    }

    public showModalDelete(): void {
        this.materializeActionsDelete.emit({action: "modal", params: ['open']});
    }

    public hideModalDelete(): void {
        this.materializeActionsDelete.emit({action: "modal", params: ['close']});
    }

    public showModalLeave(): void {
        this.materializeActionsLeave.emit({action: "modal", params: ['open']});
    }

    public hideModalLeave(): void {
        this.materializeActionsLeave.emit({action: "modal", params: ['close']});
    }

    private static readonly getLeagueQuery = `query ($name: String, $first:Int, $sort: String, $playerId: ID!, $activeGameCount:Int, $gameCount:Int) {
        league(name: $name) {
            id
            name
            imageUrl
            description
            isAdmin(playerId:$playerId)
            myLeaguePlayer: leaguePlayer(playerId:$playerId) {
                id
                pending
            }
            leaguePlayers(first:$first, sort:$sort) {
                rating
                ranking
                pending
                player {
                    id
                    name
                    imageUrl
                    description
                }
                league {
                    name
                    imageUrl
                }
            }
            leagueTeams(first:$first, sort:$sort) {
                rating
                ranking
                team {
                    name
                    imageUrl
                    players {
                        name
                        imageUrl
                        description
                    }
                }
                league {
                    name
                    imageUrl
                }
            }
            games(first: $gameCount, finished: true){
                id
                time
                finished
                points {
                    player {
                        name
                        imageUrl
                    }
                    time
                    against
                }
                comments {
                    author {
                        name
                        imageUrl
                    }
                    text
                }
                gamePlayers {
                    score
                    scoreAgainst
                    winner
                    side
                    ratingDelta
                    player {
                        name
                        imageUrl
                    }
                }
                gameTeams {
                    score
                    scoreAgainst
                    winner
                    side
                    ratingDelta
                    team {
                        id
                        name
                        imageUrl
                    }
                }
                league {
                    name
                    imageUrl
                }
            }
            activeGames(first: $activeGameCount) {
                id
                time
                finished
                points {
                    player {
                        name
                        imageUrl
                    }
                    time
                    against
                }
                comments {
                    author {
                        name
                        imageUrl
                    }
                    text
                }
                gamePlayers {
                    score
                    scoreAgainst
                    winner
                    side
                    ratingDelta
                    player {
                        name
                        imageUrl
                    }
                }
                gameTeams {
                    score
                    scoreAgainst
                    winner
                    side
                    ratingDelta
                    team {
                        id
                        name
                        imageUrl
                    }
                }
                league {
                    name
                    imageUrl
                }
            }
            nonMemberPlayers(first:-1, sort:"name ASC") {
                id
                imageUrl
            }
            stats {
                gameCount
                playerCount
                teamCount
            }
        }
    }`;

    private static readonly requestJoinLeagueQuery = `mutation ($leagueId:ID!) {
        requestJoinLeague(leagueId: $leagueId) {
            id
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

    private static readonly deleteLeagueQuery = `mutation ($name:String!) {
        deleteLeague(name: $name)
    }`;

}
