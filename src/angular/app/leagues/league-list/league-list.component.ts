import {Component, OnInit, Input} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {GraphQLService} from '../../graphql.service';
import {League} from '../../../graphql/schemas/League';
import {ListComponent} from '../../common/list.component';

@Component({
    selector: 'league-list',
    templateUrl: 'league-list.component.html'
})
export class LeagueListComponent extends ListComponent implements OnInit {

    @Input() myLeagues: League[] = [];
    @Input() allLeagues: League[];
    @Input() playerId: string;
    @Input() teamId: string;

    constructor(private router: Router, private service: GraphQLService, route: ActivatedRoute) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        if (this.autoLoad) {
            this.service.post(this.getAllLeaguesQuery()).then((data: any) => {
                this.allLeagues = data.leagues.map(league => League.fromJson(league));
            })
        }
    }

    onLeagueClicked(league: League) {
        this.service.league = league;
        this.router.navigate(['leagues', league.id]);
    }

    onCreateClicked() {
        this.router.navigate(['league-create']);
    }

    private getAllLeaguesQuery(): string {
        return `query {
                  leagues {
                    id
                    name
                    description
                    sport
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
                  }
                }`
    }
}
