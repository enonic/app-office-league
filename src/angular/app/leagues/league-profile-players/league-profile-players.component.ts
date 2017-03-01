import {Component, Input, SimpleChanges} from '@angular/core';
import {GraphQLService} from '../../graphql.service';
import {ActivatedRoute, Router} from '@angular/router';
import {League} from '../../../graphql/schemas/League';
import {BaseComponent} from '../../common/base.component';
import {Player} from '../../../graphql/schemas/Player';
import {Team} from '../../../graphql/schemas/Team';

@Component({
    selector: 'league-profile-players',
    templateUrl: 'league-profile-players.component.html'
})
export class LeagueProfilePlayersComponent extends BaseComponent {

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
        }
    }`;
    
    @Input() league: League;

    constructor(route: ActivatedRoute, private graphQLService: GraphQLService, private router: Router) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        let id = this.route.snapshot.params['id'];

        if (!this.league && this.autoLoad && id) {
            this.graphQLService.post(LeagueProfilePlayersComponent.getLeagueQuery, {id: id, count:-1, sort:'rating DESC, name ASC'}).then(data => {
                this.league = League.fromJson(data.league);
            });
        }
    }
}
