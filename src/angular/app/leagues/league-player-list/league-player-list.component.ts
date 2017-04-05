import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {List2Component} from '../../common/list2.component';
import {LeaguePlayer} from '../../../graphql/schemas/LeaguePlayer';

@Component({
    selector: 'league-player-list',
    templateUrl: 'league-player-list.component.html'
})
export class LeaguePlayerListComponent
    extends List2Component {
    @Input() leaguePlayers: LeaguePlayer[];
    @Input() displayPlayers: boolean;
    @Input() displayLeagues: boolean;
    @Input() displayPlayBtn: boolean;
    @Input() seeMoreText: string = 'See more';

    constructor(route: ActivatedRoute, router: Router) {
        super(route, router);
    }

    onLeaguePlayerClicked(leaguePlayer: LeaguePlayer, event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();

        if (this.displayLeagues) {
            this.router.navigate(['leagues', leaguePlayer.league.name.toLowerCase()]);
        } else if (this.displayPlayers) {
            this.router.navigate(['players', leaguePlayer.player.name.toLowerCase()]);
        }
    }
}
