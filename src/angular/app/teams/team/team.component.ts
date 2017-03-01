import {Component, OnInit, Input} from '@angular/core';
import {GraphQLService} from '../../graphql.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Team} from '../../../graphql/schemas/Team';

@Component({
    selector: 'team',
    templateUrl: 'team.component.html'
})
export class TeamComponent implements OnInit {

    @Input() team: Team;
    @Input() index: number;

    constructor(protected service: GraphQLService, protected route: ActivatedRoute, protected router: Router) {
    }

    ngOnInit(): void {
        let autoLoad = this.route.snapshot.data['autoLoad'],
            name = this.route.snapshot.params['name'];

        if (!this.team && autoLoad && name) {
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
