import {Component, Input, SimpleChanges} from '@angular/core';
import {GraphQLService} from '../../graphql.service';
import {AuthService} from '../../auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {League} from '../../../graphql/schemas/League';
import {BaseComponent} from '../../common/base.component';
import {Team} from '../../../graphql/schemas/Team';

@Component({
    selector: 'league-profile-teams',
    templateUrl: 'league-profile-teams.component.html'
})
export class LeagueProfileTeamsComponent extends BaseComponent {
    
    private static readonly getLeagueQuery = `query ($name: String, $count:Int, $sort: String) {
        league(name: $name) {
            id
            name
            leagueTeams(count:$count, sort:$sort) {
                team {
                    name
                }
                league {
                    name
                }
            }
        }
    }`;
    
    @Input() league: League;
    members: Team[];

    constructor(route: ActivatedRoute, private graphQLService: GraphQLService, private authService: AuthService, private router: Router) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        let name = this.route.snapshot.params['name'];

        if (!this.league && this.autoLoad && name) {
            this.refreshData(name);   
        }
    }
    
    refreshData(leagueName: String): void {
        this.graphQLService.post(LeagueProfileTeamsComponent.getLeagueQuery, {name: leagueName, count:-1, sort:'rating DESC, name ASC'}).then(data => {
            this.league = League.fromJson(data.league);
            this.members = data.league.leagueTeams.map(leagueTeam => Team.fromJson(leagueTeam.team));
        });
    }
}
