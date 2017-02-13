import {Component, OnInit, Input} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {GraphQLService} from '../../graphql.service';
import {Team} from '../../../graphql/schemas/Team';
import {ListComponent} from '../../common/list.component';

@Component({
    selector: 'team-list',
    templateUrl: 'team-list.component.html'
})
export class TeamListComponent extends ListComponent implements OnInit {

    @Input() teams: Team[];
    @Input() leagueId: string;
    @Input() playerId: string;

    constructor(private router: Router, private service: GraphQLService, route: ActivatedRoute) {
        super(route, `query{
      teams{
        id,
        displayName, 
        rating,
        previousRating,
        players{
          displayName
        }
      }
    }`);
    }

    ngOnInit(): void {
        super.ngOnInit();

        if (this.autoLoad) {
            this.service.get(this.query).then((data: any) => {
                this.teams = data.teams.map(team => Team.fromJson(team)).sort(this.teamSorter.bind(this));
            })
        }
    }

    onTeamClicked(team: Team) {
        this.service.team = team;
        this.router.navigate(['teams', team.displayName])
    }

    private teamSorter(first: Team, second: Team): number {
        return second.rating - first.rating;
    }
}
