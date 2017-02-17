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
            id = this.route.snapshot.params['id'];

        if (!this.team && autoLoad && id) {
            // check if the team was passed from list to spare request
            this.team = this.service.team;
            if (!this.team) {
                // no team was passed because this was probably a page reload
                let query = `query {
                    team(name: "${id}") {
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
