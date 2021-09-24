import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {BaseComponent} from '../../common/base.component';
import {GraphQLService} from '../../services/graphql.service';
import {OnlineStatusService} from '../../services/online-status.service';
import {Game} from '../../../graphql/schemas/Game';
import {Team} from '../../../graphql/schemas/Team';
import {PageTitleService} from '../../services/page-title.service';
import { Config } from '../../app.config';

declare var XPCONFIG: Config;

@Component({
    selector: 'team-profile',
    templateUrl: 'team-profile.component.html',
    styleUrls: ['team-profile.component.less']
})
export class TeamProfileComponent extends BaseComponent implements OnInit, OnChanges {

    @Input() team: Team;
    games: Game[] = [];
    editable: boolean;
    private online: boolean;
    private onlineStateCallback = () => this.online = navigator.onLine;
    connectionError: boolean;

    constructor(route: ActivatedRoute, private router: Router, private graphQLService: GraphQLService,
                private pageTitleService: PageTitleService, private onlineStatusService: OnlineStatusService) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        let name = this.route.snapshot.params['name'];

        if (!this.team) {
            this.graphQLService.post(
                TeamProfileComponent.getTeamQuery,
                {name: name},
                data => this.handleTeamQueryResponse(data),
                () => this.handleQueryError()
            ).catch(error => {
                this.handleQueryError();
            });
        }

        this.onlineStatusService.addOnlineStateEventListener(this.onlineStateCallback);
        this.online = navigator.onLine;
    }

    ngOnChanges(changes: SimpleChanges): void {
        super.ngOnChanges(changes);

        let teamChane = changes['team'];
        if (teamChane && teamChane.currentValue) {
            this.pageTitleService.setTitle((<Team>teamChane.currentValue).name);
        }
    }

    ngOnDestroy(): void {
        this.onlineStatusService.removeOnlineStateEventListener(this.onlineStateCallback);
    }

    private handleTeamQueryResponse(data) {
        if (!data || !data.team) {
            this.handleQueryError();
            return;
        }

        this.team = Team.fromJson(data.team);
        this.games = data.team.gameTeams.map((gm) => Game.fromJson(gm.game));
        let currentPlayerId = XPCONFIG.user && XPCONFIG.user.playerId;
        this.editable =
            this.team.players.length === 2 && ( this.team.players[0].id === currentPlayerId || this.team.players[1].id === currentPlayerId);

        this.pageTitleService.setTitle(this.team.name);
        this.connectionError = false;
    }

    private handleQueryError() {
        this.connectionError = true;
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
        this.router.navigate(['teams', this.team.name.toLowerCase(), 'edit']);
    }

    private static readonly getTeamQuery = `query($name: String){
        team(name: $name) {
            id
            name
            imageUrl
            description

            gameTeams(first: 5) {
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
                    description
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
            
            leagueTeams {
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
            
            players {
                id
                name
                imageUrl
                description
            }
            
            stats {
                gameCount
                winningGameCount
                goalCount
            }
        }
    }`;

}
