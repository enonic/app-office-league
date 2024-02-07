import {Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild} from '@angular/core';
import {GraphQLService} from '../../services/graphql.service';
import {AuthService} from '../../services/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {League} from '../../../graphql/schemas/League';
import {BaseComponent} from '../../common/base.component';
import {Game} from '../../../graphql/schemas/Game';
import {PageTitleService} from '../../services/page-title.service';
import {OnlineStatusService} from '../../services/online-status.service';
import {Player} from '../../../graphql/schemas/Player';
import {WebSocketManager} from '../../services/websocket.manager';
import {EventType, RemoteEvent} from '../../../graphql/schemas/RemoteEvent';
import { Config } from '../../app.config';
import { AddPlayersDialogComponent } from '../add-players-dialog/add-players-dialog.component';
import { RemovePlayerDialogComponent } from '../remove-player-dialog/remove-player-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import {JoinLeagueRequestDialogComponent} from '../join-league-request-dialog/join-league-request-dialog.component';
import {PendingRequestDialogComponent} from '../pending-request-dialog/pending-request-dialog.component';
import {LeagueDeleteDialogComponent} from '../league-delete-dialog/league-delete-dialog.component';
import {LeagueLeaveDialogComponent} from '../league-leave-dialog/league-leave-dialog.component';
import {RegenerateRankingDialogComponent} from '../regenerate-ranking-dialog/regenerate-ranking-dialog.component';

declare var XPCONFIG: Config;

@Component({
    selector: 'league-profile',
    templateUrl: 'league-profile.component.html',
    styleUrls: ['league-profile.component.less']
})
export class LeagueProfileComponent
    extends BaseComponent
    implements OnChanges, OnDestroy {

    @Input() league: League;
    connectionError: boolean;
    playerInLeague: boolean;
    userAuthenticated: boolean;
    adminInLeague: boolean;
    joinLeagueRequested: boolean;
    playerSystemAdmin: boolean;
    activeGames: Game[] = [];
    nonMembersPlayerNames: string[] = [];
    playerNamesToAdd: string[] = [];
    approvePollingTimerId: any;
    online: boolean;
    onlineStateCallback = () => this.online = navigator.onLine;
    private wsMan: WebSocketManager;

    constructor(
        route: ActivatedRoute,
        private authService: AuthService,
        private graphQLService: GraphQLService,
        private pageTitleService: PageTitleService,
        private onlineStatusService: OnlineStatusService,
        private router: Router,
        private dialog: MatDialog
    ) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        this.userAuthenticated = this.authService.isAuthenticated();
        this.playerSystemAdmin = this.authService.isSystemAdmin();
        let name = this.route.snapshot.params['name'];

        if (!this.league && name) {
            this.refreshData(name).then(() => {
                if (this.league) {
                    this.wsMan = new WebSocketManager(this.getWsUrl(this.league.id));
                    this.wsMan.onMessage(this.onWsMessage.bind(this));
                    this.wsMan.connect();
                }
            }).catch(error => {
                this.handleQueryError();
            });
        }

        this.onlineStatusService.addOnlineStateEventListener(this.onlineStateCallback);
        this.online = navigator.onLine;
    }

    ngOnDestroy() {
        clearTimeout(this.approvePollingTimerId);
        this.approvePollingTimerId = undefined;
        this.onlineStatusService.removeOnlineStateEventListener(this.onlineStateCallback);
        this.wsMan && this.wsMan.disconnect();
    }

    ngOnChanges(changes: SimpleChanges): void {
        super.ngOnChanges(changes);

        let leagueChange = changes['league'];
        if (leagueChange && leagueChange.currentValue) {
            this.pageTitleService.setTitle((<League>leagueChange.currentValue).name);
        }
    }

    refreshData(leagueName: String): Promise<any> {
        let playerId = this.authService.isAuthenticated() ? this.authService.getUser().playerId : '-1';

        const getLeagueParams = {
            name: leagueName, first: 3, sort: 'pending DESC, rating DESC, name ASC', playerId: playerId,
            activeGameCount: 3, gameCount: 3
        };

        return new Promise<void>((resolve, reject) => {
            this.graphQLService.post(
                LeagueProfileComponent.getLeagueQuery,
                getLeagueParams,
                data => {
                    this.handleLeagueQueryResponse(data);
                    resolve();
                },
                () => reject()
            );
        });
    }

    private handleLeagueQueryResponse(data) {
        if (!data || !data.league) {
            this.handleQueryError();
            return;
        }

        this.league = League.fromJson(data.league);
        this.joinLeagueRequested = !!(data.league.myLeaguePlayer && data.league.myLeaguePlayer.pending);
        this.playerInLeague = !!data.league.myLeaguePlayer && !this.joinLeagueRequested;
        this.adminInLeague = data.league.isAdmin;
        this.activeGames = data.league.activeGames.map((gameJson) => Game.fromJson(gameJson));
        this.nonMembersPlayerNames = data.league.nonMemberPlayers.map((player) => player.name);

        this.pageTitleService.setTitle(this.league.name);
        if (this.joinLeagueRequested && !this.playerInLeague) {
            this.pollJoinApproved();
        }
        this.connectionError = false;
    }

    private handleQueryError() {
        this.connectionError = true;
    }

    private pollJoinApproved() {
        clearTimeout(this.approvePollingTimerId);
        this.approvePollingTimerId = setTimeout(() => {
            let playerId = this.authService.isAuthenticated() ? this.authService.getUser().playerId : '-1';
            let leagueName = (this.league && this.league.name) || '';

            this.graphQLService.post(
                LeagueProfileComponent.joinLeagueApprovedQuery,
                {name: leagueName, playerId: playerId},
                data => {
                    let pending = !!(data.league && data.league.myLeaguePlayer && data.league.myLeaguePlayer.pending);
                    if (!pending) {
                        this.refreshData(leagueName);
                    } else {
                        this.pollJoinApproved();
                    }
                },
                () => {
                    this.pollJoinApproved();
                }
            );

        }, 3000);
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

    onJoinClicked() {
        if (this.authService.isAuthenticated() && !this.playerInLeague) {
            let playerId = this.authService.getUser().playerId;
            this.graphQLService.post(LeagueProfileComponent.requestJoinLeagueQuery, {leagueId: this.league.id}).then(
                data => {
                    this.refreshData(this.league.name);
                });
        }
    }

    addPlayers(playerNamesToAdd: string[]) {
        this.graphQLService.post(LeagueProfileComponent.addPlayersLeagueQuery, {
            leagueId: this.league.id,
            playerNames: playerNamesToAdd
        }).then(data => {
            this.refreshData(this.league.name);
        }).catch(error => {
            // Handle error
            console.error("Error adding players: ", error);
        });
    }

    openRemovePlayerDialog(player: Player): void {
        //this.removePlayer = player;
        const dialogRef = this.dialog.open(RemovePlayerDialogComponent, {
            width: '250px',
            data: {
                playerName: player.name,
                leagueName: this.league.name
            } // pass data as needed
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result === true) {
                this.removePlayer(player);
                // Handle the removal confirmation
            }
        });
    }

    removePlayer(player: Player) {
        this.graphQLService.post(LeagueProfileComponent.leavePlayerLeagueQuery,
            {playerId: player.id, leagueId: this.league.id}).then(
            data => {
                this.refreshData(this.league.name);
            });
    }

    approveOrRejectPlayer(player: Player, allow: boolean) {
        this.graphQLService.post(
            allow ? LeagueProfileComponent.joinPlayerLeagueQuery : LeagueProfileComponent.denyJoinLeagueRequestQuery,
            { playerId: player.id, leagueId: this.league.id }
        ).then(() => {
                //this.hideModalApprove();
                this.refreshData(this.league.name);
            });
    }

    deleteLeague() {
        this.graphQLService.post(
            LeagueProfileComponent.deleteLeagueQuery,
            {name: this.league.name}
        ).then( () => this.router.navigate(['leagues']));
    }

    leaveLeague() {
        this.graphQLService.post(
            LeagueProfileComponent.leavePlayerLeagueQuery,
            { playerId: this.authService.getUser().playerId, leagueId: this.league.id }
        ).then(() => this.refreshData(this.league.name) );
    }

    regenerateRanking() {
        this.graphQLService.post(LeagueProfileComponent.regenerateLeagueRanking, {leagueId: this.league.id});
    }

    openAddPlayerDialog(): void {
        const dialogRef = this.dialog.open(AddPlayersDialogComponent, {
            width: '250px',
            data: {
                nonMembersPlayerNames: this.nonMembersPlayerNames,
                playerNamesToAdd: this.playerNamesToAdd
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.addPlayers(result);
            }
        });
    }

    public openApproveOrRejectPlayerDialog(player: Player): void {
        const dialogRef = this.dialog.open(JoinLeagueRequestDialogComponent, {
            width: '250px',
            data: {
                playerName: player.name,
                leagueName: this.league.name
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.approveOrRejectPlayer(player, result);
            }
        });
    }

    public checkPendingRequest(): void {
        // check if pending, show info modal if still pending
        this.refreshData(this.league.name).then(() => {
            if (!this.playerInLeague && this.joinLeagueRequested) {
                this.openPendingRequestDialog();
            }
        });
    }

    public openPendingRequestDialog(): void {
        this.dialog.open(PendingRequestDialogComponent, {
            width: '250px'
        });
    }

    public openLeagueDeleteDialog(): void {
        const dialogRef = this.dialog.open(LeagueDeleteDialogComponent, {
            width: '250px',
            data: {
                leagueName: this.league.name
            } // pass data as needed
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result === true) {
                this.deleteLeague();
            }
        });
    }

    public openLeagueLeaveDialog(): void {
        const dialogRef = this.dialog.open(LeagueLeaveDialogComponent, {
            width: '250px',
            data: {
                leagueName: this.league.name
            } // pass data as needed
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result === true) {
                this.leaveLeague();
            }
        });
    }

    public openRegenerateRankingDialog(): void {
        const dialogRef = this.dialog.open(RegenerateRankingDialogComponent, {
            width: '250px',
            data: {
                leagueName: this.league.name
            } // pass data as needed
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result === true) {
                this.regenerateRanking();
            }
        });
    }

    onWsMessage(event: RemoteEvent) {
        if ((event.type === EventType.GAME_UPDATE) && event.leagueId === this.league.id) {
            this.refreshData(this.league.name);
        }
    }

    private getWsUrl(leagueId: string): string {
        return XPCONFIG.liveGameUrl + '?leagueId=' + leagueId + '&scope=league-profile';
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
                    position
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
                    position
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
                name
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

    private static readonly addPlayersLeagueQuery = `mutation ($leagueId:ID!, $playerNames: [String]!) {
        addPlayersLeague(leagueId: $leagueId, playerNames: $playerNames) {
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

    private static readonly joinLeagueApprovedQuery = `query ($name: String, $playerId: ID!) {
        league(name: $name) {
            myLeaguePlayer: leaguePlayer(playerId:$playerId) {
                pending
            }
        }
    }`;

    private static readonly regenerateLeagueRanking = `mutation ($leagueId: ID) {
        regenerateLeagueRanking(leagueId: $leagueId) {
            id
        }
    }`;
}
