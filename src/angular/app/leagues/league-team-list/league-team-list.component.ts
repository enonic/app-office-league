import {Component, OnInit, Input} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {List2Component} from '../../common/list2.component';
import {LeagueTeam} from '../../../graphql/schemas/LeagueTeam';

@Component({
    selector: 'league-team-list',
    templateUrl: 'league-team-list.component.html'
})
export class LeagueTeamListComponent extends List2Component implements OnInit {

    @Input() leagueTeams: LeagueTeam[];
    @Input() displayTeams: boolean;
    @Input() displayLeagues: boolean;
    
    constructor(route: ActivatedRoute, router: Router) {
        super(route, router);
    }

    onLeagueTeamClicked(leagueTeam: LeagueTeam) {
        if (this.displayLeagues) {
            this.router.navigate(['leagues', leagueTeam.league.name.toLowerCase()]);
        } else if (this.displayTeams) {
            this.router.navigate(['teams', leagueTeam.team.name.toLowerCase()]);
        }
    }
}
