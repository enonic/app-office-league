import {Component, Input, SimpleChanges} from '@angular/core';
import {GraphQLService} from '../../graphql.service';
import {ActivatedRoute, Router} from '@angular/router';
import {League} from '../../../graphql/schemas/League';
import {BaseComponent} from '../../common/base.component';
import {Player} from '../../../graphql/schemas/Player';
import {Team} from '../../../graphql/schemas/Team';

@Component({
    selector: 'league-profile',
    templateUrl: 'league-profile.component.html'
})
export class LeagueProfileComponent extends BaseComponent {

    private static readonly getLeagueQuery = `query ($id: ID!, $count:Int, $sort: String) {
        league(id: $id) {
            name
            leaguePlayers(count:$count, sort:$sort) {
                player {
                    name
                }
                league {
                    name
                }
            }
            leagueTeams(count:$count, sort:$sort) {
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
                    winner
                    side
                    ratingDelta
                    player {
                        name
                    }
                }
                gameTeams {
                    score
                    winner
                    side
                }
                league {
                    name
                }
            }
        }
    }`;
    
    @Input() league: League;
    private leaguePlayers: Player[];
    private leagueTeams: Team[];

    constructor(route: ActivatedRoute, private graphQLService: GraphQLService, private router: Router) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        let id = this.route.snapshot.params['id'];

        if (!this.league && this.autoLoad && id) {
            this.graphQLService.post(LeagueProfileComponent.getLeagueQuery, {id: id, count:3, sort:'rating DESC, name ASC'}).then(data => {
                this.league = League.fromJson(data.league);
                this.calcStats(this.league);
            });
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);

        let leagueChange = changes['league'];
        if (leagueChange && leagueChange.currentValue) {
            this.calcStats(leagueChange.currentValue);
        }
    }

    private calcStats(league: League) { //TODO Fix
        this.leaguePlayers = league.leaguePlayers.map(lp => lp.player);
        this.leagueTeams = league.leagueTeams.map(lt => lt.team);
    }
}
