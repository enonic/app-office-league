import {Component, OnInit, Input} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {BaseComponent} from '../../common/base.component';
import {LeaguePlayer} from '../../../graphql/schemas/LeaguePlayer';

@Component({
    selector: 'league-player-list',
    templateUrl: 'league-player-list.component.html'
})
export class LeaguePlayerListComponent extends BaseComponent implements OnInit {

    @Input() title: String;
    @Input() leaguePlayers: LeaguePlayer[];
    @Input() displayPlayers: boolean;
    @Input() displayLeagues: boolean;

    constructor(route: ActivatedRoute, private router: Router) {
        super(route);
    }

    onLeagueClicked(leaguePlayer: LeaguePlayer) {
        this.router.navigate(['leagues', leaguePlayer.league.name.toLowerCase()]);
    }
}
