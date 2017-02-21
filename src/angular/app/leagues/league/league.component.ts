import {Component, OnInit, Input, OnChanges, SimpleChanges} from '@angular/core';
import {GraphQLService} from '../../graphql.service';
import {ActivatedRoute, Router} from '@angular/router';
import {League} from '../../../graphql/schemas/League';
import {BaseComponent} from '../../common/base.component';
import {Player} from '../../../graphql/schemas/Player';
import {Team} from '../../../graphql/schemas/Team';

@Component({
    selector: 'league',
    templateUrl: 'league.component.html',
    styleUrls: ['league.component.less']
})
export class LeagueComponent extends BaseComponent implements OnInit, OnChanges {

    @Input() league: League;

    private leaguePlayers: Player[];
    private leagueTeams: Team[];

    constructor(protected service: GraphQLService, protected route: ActivatedRoute, protected router: Router) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        let id = this.route.snapshot.params['id'];

        if (!this.league && this.autoLoad && id) {
            this.service.post(this.getQuery(id)).then(data => {
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

    private calcStats(league: League) {
        this.leaguePlayers = league.leaguePlayers.map(lp => lp.player);
        this.leagueTeams = league.leagueTeams.map(lt => lt.team);
    }

    private getQuery(id: string) {
        return `query{
                  league(id: "${id}") {
                    name
                    leaguePlayers {
                        player {
                            name
                        }
                        league {
                            name
                        }
                    }
                    leagueTeams {
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
    }

}
