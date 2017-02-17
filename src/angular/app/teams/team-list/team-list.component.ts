import {Component, OnInit, Input, SimpleChanges, OnChanges} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {GraphQLService} from '../../graphql.service';
import {Team} from '../../../graphql/schemas/Team';
import {ListComponent} from '../../common/list.component';

@Component({
    selector: 'team-list',
    templateUrl: 'team-list.component.html'
})
export class TeamListComponent extends ListComponent implements OnInit, OnChanges {

    @Input() teams: Team[];
    @Input() leagueId: string;
    @Input() playerId: string;

    constructor(private router: Router, private service: GraphQLService, route: ActivatedRoute) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        if (this.autoLoad) {
            this.loadTeams(this.leagueId);
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);

        let leagueIdChanges = changes['leagueId'];
        if (leagueIdChanges && leagueIdChanges.currentValue) {
            this.loadTeams(leagueIdChanges.currentValue)
        }
    }

    onTeamClicked(team: Team) {
        this.service.team = team;
        this.router.navigate(['teams', team.name])
    }

    private teamSorter(first: Team, second: Team): number {
        return second.name.localeCompare(first.name);
    }


    private loadTeams(leagueId: string) {
        this.service.post(this.getQuery(leagueId)).then((data: any) => {
            this.teams = data.teams.map(team => Team.fromJson(team)).sort(this.teamSorter.bind(this));
        })
    }

    private getQuery(leagueId: string): string {
        return `query{
                  teams{
                    id,
                    name, 
                    description,
                    players{
                      name
                    },
                    leagueTeams {
                        team {
                            name
                        },
                        league {
                            name
                        }
                    }
                  }
                }`
    }
}
