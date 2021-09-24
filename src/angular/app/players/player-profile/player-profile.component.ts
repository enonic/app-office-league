import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Handedness} from '../../../graphql/schemas/Handedness';
import {Player} from '../../../graphql/schemas/Player';
import {BaseComponent} from '../../common/base.component';
import {AuthService} from '../../services/auth.service';
import {GraphQLService} from '../../services/graphql.service';
import {Countries} from '../../common/countries';
import {Game} from '../../../graphql/schemas/Game';
import {Team} from '../../../graphql/schemas/Team';
import {PageTitleService} from '../../services/page-title.service';
import {OnlineStatusService} from '../../services/online-status.service';
import {NewGameComponent} from '../../games/new-game/new-game.component';
import {PlayerSelectComponent} from '../../common/player-select/player-select.component';
import { Config } from '../../app.config';

declare var XPCONFIG: Config;

@Component({
    selector: 'player-profile',
    templateUrl: 'player-profile.component.html',
    styleUrls: ['player-profile.component.less']
})
export class PlayerProfileComponent
    extends BaseComponent
    implements OnChanges {

    private static readonly HOME_TITLE = 'Office League';
    @Input() player: Player;
    private profile: boolean;
    private games: Game[] = [];
    private teams: Team[] = [];
    private teamDetailsPath: string[];
    private editable: boolean;
    private online: boolean;
    private onlineStateCallback = () => this.online = navigator.onLine;
    connectionError: boolean;

    constructor(route: ActivatedRoute, private router: Router, private graphQLService: GraphQLService, private authService: AuthService,
                private pageTitleService: PageTitleService, private onlineStatusService: OnlineStatusService) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        this.profile = !this.route.snapshot.params['name'];
        let name = this.profile ? this.authService.getUser().playerName : this.route.snapshot.params['name'];

        if (this.profile) {
            this.pageTitleService.setTitle(PlayerProfileComponent.HOME_TITLE);
        }

        this.graphQLService.post(
            PlayerProfileComponent.getPlayerQuery,
            {name: name},
            data => this.handlePlayerQueryResponse(data),
            () => this.handleQueryError()
        ).catch(error => {
            this.handleQueryError();
        });

        this.onlineStatusService.addOnlineStateEventListener(this.onlineStateCallback);
        this.online = navigator.onLine;
    }

    ngOnChanges(changes: SimpleChanges): void {
        super.ngOnChanges(changes);

        let playerChange = changes['player'];
        if (playerChange && playerChange.currentValue) {
            if (this.editable) {
                this.pageTitleService.setTitle(PlayerProfileComponent.HOME_TITLE);
            } else {
                this.pageTitleService.setTitle((<Player>playerChange.currentValue).name);
            }
        }
    }

    ngOnDestroy(): void {
        this.onlineStatusService.removeOnlineStateEventListener(this.onlineStateCallback);
    }

    private handlePlayerQueryResponse(data) {
        if (!data || !data.player) {
            this.handleQueryError();
            return;
        }

        this.player = Player.fromJson(data.player);
        this.games = data.player.gamePlayers.map((gm) => Game.fromJson(gm.game));
        this.teams = data.player.teamsConnection.edges.map((edge) => Team.fromJson(edge.node));
        this.teamDetailsPath = data.player.teamsConnection.pageInfo.hasNext ? ['players', data.player.name, 'teams'] : undefined;
        let currentPlayerId = XPCONFIG.user && XPCONFIG.user.playerId;
        this.editable = this.player.id === currentPlayerId;

        if (this.profile && this.editable) {
            this.pageTitleService.setTitle(PlayerProfileComponent.HOME_TITLE);
        } else {
            this.pageTitleService.setTitle(this.player.name);
        }
        this.precacheNewGameRequests();
        this.connectionError = false;
    }

    private handleQueryError() {
        this.connectionError = true;
    }

    private precacheNewGameRequests() {
        this.player.leaguePlayers.forEach((leaguePlayer) => {
            this.graphQLService.post(
                NewGameComponent.getPlayerLeagueQuery,
                {playerId: this.player.id, leagueId: leaguePlayer.league.id},
                data => this.handlePlayerLeagueQueryResponse(data)
            );
        });
    }

    private handlePlayerLeagueQueryResponse(data) {
        let playerIds = data.league.leaguePlayers.map((leaguePlayer) => leaguePlayer.player && leaguePlayer.player.id).filter((id) => !!id);
        this.graphQLService.post(PlayerSelectComponent.GetPlayersQuery, {playerIds: playerIds, first: -1});
    }

    getNationality(): string {
        return Countries.getCountryName(this.player.nationality);
    }

    getHandedness(): string {
        const h = this.player && this.player.handedness;
        switch (h) {
        case Handedness.RIGHT:
            return 'Right';
        case Handedness.LEFT:
            return 'Left';
        case  Handedness.AMBIDEXTERITY:
            return 'Ambidextrous';
        default:
            return 'N/A';
        }
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

    formatPercent(value: number, decimals: number = 0): string {
        return parseFloat('' + (Math.round(value * 100) / 100)).toFixed(decimals);
    }

    onEditClicked() {
        this.router.navigate(['players', this.player.name.toLowerCase(), 'edit']);
    }

    onCreateTeamClicked() {
        this.router.navigate(['team-create']);
    }

    private static readonly getPlayerQuery = `query($name: String){
        player(name: $name) {
            id
            name
            imageUrl
            nationality
            handedness
            description
            fullname
            email

            gamePlayers(first: 5) {
              game {
                id
                time
                finished
                points {
                  time
                  against
                  player {
                    id
                    name
                    imageUrl
                  }
                }
                gamePlayers {
                  id
                  time
                  score
                  scoreAgainst
                  side
                  position
                  winner
                  ratingDelta
                  player {
                    id
                    name
                    imageUrl
                  }
                }
                gameTeams {
                  id
                  time
                  score
                  scoreAgainst
                  side
                  winner
                  ratingDelta
                  team {
                    id
                    name
                    imageUrl
                  }
                }
                league {
                  id
                  name
                  imageUrl
                }
              }
            }
            
            leaguePlayers {
              rating
              ranking
              league {
                id
                name
                imageUrl
                sport
                description      
              }
            }
            
            teamsConnection(first: 5) {
                edges {
                    node {                    
                        id
                        name
                        imageUrl
                        description
                        players {
                            id
                            name
                            imageUrl
                        }
                    }
                }
                pageInfo {
                    hasNext
                }
            }
            
            stats {
                gameCount
                winningGameCount
                goalCount
            }
        }
    }`;
}
