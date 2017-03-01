import {Component, Input, SimpleChanges} from '@angular/core';
import {GraphQLService} from '../../graphql.service';
import {AuthService} from '../../auth.service';
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

    private static readonly getLeagueQuery = `query ($name: String, $count:Int, $sort: String) {
        league(name: $name) {
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
    players: Player[];

    constructor(route: ActivatedRoute, private graphQLService: GraphQLService, private authService: AuthService, private router: Router) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        let name = this.route.snapshot.params['name'];

        if (!this.league && this.autoLoad && name) {
            this.graphQLService.post(LeagueProfilePlayersComponent.getLeagueQuery, {name: name, count:-1, sort:'rating DESC, name ASC'}).then(data => {
                this.league = League.fromJson(data.league);
                this.players = data.league.leaguePlayers.map(leaguePlayer => Player.fromJson(leaguePlayer.player));
            });
        }
    }
    
    addPlayer(): void {
        console.log('addPlayer');
    }
}
