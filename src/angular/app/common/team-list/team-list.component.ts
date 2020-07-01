import {Component, Input} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {List2Component} from '../../common/list2.component';
import {Team} from '../../../graphql/schemas/Team';

@Component({
    selector: 'team-list',
    templateUrl: 'team-list.component.html',
    styleUrls: ['team-list.component.less']
})
export class TeamListComponent extends List2Component {
    @Input() teams: Team[];
    
    constructor(route: ActivatedRoute, router: Router) {
        super(route, router);
    }

    onTeamClicked(team: Team, event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();

        this.router.navigate(['teams', team.name.toLowerCase()]);
    }
}
