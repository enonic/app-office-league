import {Component, Input, SimpleChanges, OnChanges} from '@angular/core';
import {GraphQLService} from '../../services/graphql.service';
import {AuthService} from '../../services/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {League} from '../../../graphql/schemas/League';
import {BaseComponent} from '../../common/base.component';
import {Game} from '../../../graphql/schemas/Game';
import {PageTitleService} from '../../services/page-title.service';

@Component({
    selector: 'league-profile',
    templateUrl: 'league-profile.component.html',
    styleUrls: ['league-profile.component.less']
})
export class LeagueProfileComponent extends BaseComponent implements OnChanges {

    private static readonly getLeagueQuery = `query ($name: String, $first:Int, $sort: String, $playerId: ID!) {
        league(name: $name) {
            id
            name
            description
            isAdmin(playerId:$playerId)
            myLeaguePlayer: leaguePlayer(playerId:$playerId) {
                id
            }
            leaguePlayers(first:$first, sort:$sort) {
                rating
                ranking
                player {
                    name
                }
                league {
                    name
                }
            }
            leagueTeams(first:$first, sort:$sort) {
                rating
                ranking
                team {
                    name
                    players {
                        name
                    }
                }
                league {
                    name
                }
            }
            games(finished: true){
                id
                time
                finished
                points {
                    player {
                        name
                    }
                    time
                    against
                }
                comments {
                    author {
                        name
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
                    }
                }
                league {
                    name
                }
            }
            activeGames {
                id
                time
                finished
                points {
                    player {
                        name
                    }
                    time
                    against
                }
                comments {
                    author {
                        name
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
                    }
                }
                league {
                    name
                }
            }
        }
    }`;

    private static readonly joinPlayerLeagueQuery = `mutation ($playerId: ID!, $leagueId:ID!) {
        joinPlayerLeague(playerId: $playerId, leagueId: $leagueId) {
            id
        }
    }`;

    @Input() league: League;
    playerInLeague: boolean;
    adminInLeague: boolean;
    activeGames: Game[] = [];

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

        const getLeagueParams = {name: leagueName, first: 3, sort: 'rating DESC, name ASC', playerId: playerId};
        this.graphQLService.post(LeagueProfileComponent.getLeagueQuery, getLeagueParams).then(data => {
            this.league = League.fromJson(data.league);
            this.playerInLeague = !!data.league.myLeaguePlayer;
            this.adminInLeague = data.league.isAdmin;
            this.activeGames = data.league.activeGames.map((gameJson) => {
                let game = Game.fromJson(gameJson);
                game.live = true;
                return game;
            });

            this.pageTitleService.setTitle(this.league.name);
        });
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
            this.graphQLService.post(LeagueProfileComponent.joinPlayerLeagueQuery, {playerId: playerId, leagueId: this.league.id}).then(
                data => {
                    this.refreshData(this.league.name);
                });
        }
    }
}
