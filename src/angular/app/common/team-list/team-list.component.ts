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

    private static readonly getTeamsQuery = `query($search:String) {
        teams(first:-1, search:$search) {
            name
            players {
                name
            }
        }
    }`;
    
    @Input() title: string;
    @Input() teams: Team[];
    @Input() detailsPath: string[];
    searchValue: string;

    constructor(route: ActivatedRoute, private router: Router, private service: GraphQLService) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        if (this.teams == undefined) {
            this.refreshData();
        }
    }

    onTeamClicked(team: Team) {
        this.service.team = team;
        this.router.navigate(['teams', team.name.toLowerCase()])
    }

    onDetailsClicked() {
        this.router.navigate(this.detailsPath);
    }

    onSearchFieldModified() {
        this.refreshData();
    }


    private refreshData() {
        this.service.post(TeamListComponent.getTeamsQuery, {search:this.searchValue}).then((data: any) => {
            this.teams = data.teams.map(team => Team.fromJson(team));
        })
    }
}
