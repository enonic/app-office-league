import {Component, Input} from '@angular/core';
import {GraphQLService} from '../../graphql.service';
import {AuthService} from '../../auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {League} from '../../../graphql/schemas/League';
import {BaseComponent} from '../../common/base.component';

@Component({
    selector: 'league-profile',
    templateUrl: 'league-profile.component.html'
})
export class LeagueProfileComponent extends BaseComponent {

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
                ranking
                player {
                    name
                }
                league {
                    name
                }
            }
            leagueTeams(first:$first, sort:$sort) {
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
            games{
                id
                time
                finished
                points {
                  time
                  against
                  player {
                    id
                    name
                  }
                }
                comments {
                    author {
                        name
                    }
                    text
                }
                gamePlayers {
                    score
                    winner
                    side
                    ratingDelta
                    player {
                        name
                    }
                }
                gameTeams {
                  id
                  time
                  score
                  side
                  winner
                  ratingDelta
                  team {
                    id
                    name
                    players {
                        name
                    }
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

    constructor(route: ActivatedRoute, private authService: AuthService, private graphQLService: GraphQLService, private router: Router) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        let name = this.route.snapshot.params['name'];

        if (!this.league && name) {
            this.refreshData(name);
        }
    }

    refreshData(leagueName: String): void {
        let playerId = this.authService.isAuthenticated() ? this.authService.getUser().playerId : '-1';
        this.graphQLService.post(LeagueProfileComponent.getLeagueQuery, {name: leagueName, first:3, sort:'rating DESC, name ASC', playerId: playerId}).
            then(data => {
                this.league = League.fromJson(data.league);
                this.playerInLeague = !!data.league.myLeaguePlayer;
                this.adminInLeague = data.league.isAdmin;
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
            this.graphQLService.post(LeagueProfileComponent.joinPlayerLeagueQuery, {playerId: playerId, leagueId: this.league.id}).
                then(data => {
                    this.refreshData(this.league.name);
                });
        }
    }
}
