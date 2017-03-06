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

    @Input() team: Team;
    @Input() index: number;
    
    constructor(route: ActivatedRoute, private service: GraphQLService, private router: Router) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();
        
        let name = this.route.snapshot.params['name'];

        if (!this.team && name) {
            // check if the team was passed from list to spare request
            this.team = this.service.team;
            if (!this.team) {
                // no team was passed because this was probably a page reload
                let query = `query {
                    team(name: "${name}") {
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
                this.service.post(query).then(data => this.team = Team.fromJson(data.team));
            }
        }
    }

}
