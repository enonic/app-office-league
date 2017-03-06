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
    @Input() detailsPath: string[];

    constructor(route: ActivatedRoute, private router: Router) {
        super(route);
    }

    onLeaguePlayerClicked(leaguePlayer: LeaguePlayer) {
        if (this.displayLeagues) {
            this.router.navigate(['leagues', leaguePlayer.league.name.toLowerCase()]);
        } else if (this.displayPlayers) {
            this.router.navigate(['players', leaguePlayer.player.name.toLowerCase()]);
        }
    }

    onDetailsClicked() {
        this.router.navigate(this.detailsPath);
    }
}
