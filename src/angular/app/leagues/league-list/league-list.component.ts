import {Component, OnInit, Input} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {GraphQLService} from '../../graphql.service';
import {League} from '../../../graphql/schemas/League';
import {ListComponent} from '../../common/list.component';

declare var XPCONFIG: any;

@Component({
    selector: 'league-list',
    templateUrl: 'league-list.component.html'
})
export class LeagueListComponent extends ListComponent implements OnInit {

    @Input() leagues: League[];
    @Input() playerId: string;
    @Input() teamId: string;

    constructor(private router: Router, private service: GraphQLService, route: ActivatedRoute) {
        super(route,
            `query {
  leagues {
    id
    name
    description
    sport
    leaguePlayers {
      player {
        name
      }
    }
  }
}`);
    }

    ngOnInit(): void {
        super.ngOnInit();

        if (this.autoLoad) {
            this.service.postJson(XPCONFIG.graphQlUrl, this.query).then((data: any) => {
                this.leagues = data.leagues.map(league => League.fromJson(league));
            })
        }
    }

    onLeagueClicked(league: League) {
        this.service.league = league;
        this.router.navigate(['leagues', league.name])
    }
}
