import {Component, Input} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {BaseComponent} from '../../common/base.component';
import {LeagueTeam} from '../../../graphql/schemas/LeagueTeam';

@Component({
    selector: 'league-team-list',
    templateUrl: 'league-team-list.component.html'
})
export class LeagueTeamListComponent extends BaseComponent {

    @Input() leagueTeams: LeagueTeam[];

    constructor(route: ActivatedRoute, private router: Router) {
        super(route);
    }

    onLeagueClicked(leagueTeam: LeagueTeam) {
        this.router.navigate(['leagues', leagueTeam.league.name.toLowerCase()]);
    }
}
