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
            this.team = this.service.team || new Team(id);
        }
    }

}
