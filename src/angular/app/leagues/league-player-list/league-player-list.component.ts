import {Component, OnInit, Input} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {List2Component} from '../../common/list2.component';
import {LeaguePlayer} from '../../../graphql/schemas/LeaguePlayer';

@Component({
    selector: 'league-player-list',
    templateUrl: 'league-player-list.component.html'
})
export class LeaguePlayerListComponent extends List2Component {
    @Input() leaguePlayers: LeaguePlayer[];
    @Input() displayPlayers: boolean;
    @Input() displayLeagues: boolean;
    
    constructor(route: ActivatedRoute, router: Router) {
        super(route, router);
    }

    onLeaguePlayerClicked(leaguePlayer: LeaguePlayer) {
        if (this.displayLeagues) {
            this.router.navigate(['leagues', leaguePlayer.league.name.toLowerCase()]);
        } else if (this.displayPlayers) {
            this.router.navigate(['players', leaguePlayer.player.name.toLowerCase()]);
        }
    }
}
