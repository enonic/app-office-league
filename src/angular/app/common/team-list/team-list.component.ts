import {Component, OnInit, Input, SimpleChanges, OnChanges} from '@angular/core';
import {BaseComponent} from '../../common/base.component';
import {Router, ActivatedRoute} from '@angular/router';
import {GraphQLService} from '../../graphql.service';
import {Team} from '../../../graphql/schemas/Team';
import {ListComponent} from '../../common/list.component';

@Component({
    selector: 'team-list',
    templateUrl: 'team-list.component.html'
})
export class TeamListComponent extends BaseComponent {

    private static readonly getTeamsQuery = `query {
        teams(count:-1) {
            name
            players {
                name
            }
        }
    }`;
    
    @Input() title: string;
    @Input() teams: Team[];
    @Input() detailsPath: string[];

    constructor(route: ActivatedRoute, private router: Router, private service: GraphQLService) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        if (this.teams == undefined) {
            this.loadTeams();
        }
    }

    onTeamClicked(team: Team) {
        this.service.team = team;
        this.router.navigate(['teams', team.name.toLowerCase()])
    }

    onDetailsClicked() {
        this.router.navigate(this.detailsPath);
    }


    private loadTeams() {
        this.service.post(TeamListComponent.getTeamsQuery).then((data: any) => {
            this.teams = data.teams.map(team => Team.fromJson(team));
        })
    }
}
