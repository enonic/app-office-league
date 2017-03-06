import {Component, Input} from '@angular/core';
import {GraphQLService} from '../../graphql.service';
import {ActivatedRoute, Router} from '@angular/router';
import {BaseComponent} from '../../common/base.component';
import {Team} from '../../../graphql/schemas/Team';

@Component({
    selector: 'team-profile',
    templateUrl: 'team-profile.component.html'
})
export class TeamProfileComponent extends BaseComponent {

    private static readonly getTeamQuery = `query($name:ID) {
        team(name: $name) {
            id,
            name,
            description,
            players {
                name
            },
            leagueTeams {
                league {
                    name
                },
                team {
                    name
                }
            }
        }
    }`;
    
    @Input() team: Team;
    @Input() index: number;
    
    constructor(route: ActivatedRoute, private service: GraphQLService, private router: Router) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();
        
        let name = this.route.snapshot.params['name'];
        if (!this.team && name) {
            this.service.post(TeamProfileComponent.getTeamQuery, {name:name}).
                then(data => this.team = Team.fromJson(data.team));            
        }
    }

}
