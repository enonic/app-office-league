import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {List2Component} from '../../common/list2.component';
import {LeaguePlayer} from '../../../graphql/schemas/LeaguePlayer';
import {Player} from '../../../graphql/schemas/Player';

@Component({
    selector: 'league-player-list',
    templateUrl: 'league-player-list.component.html',
    styleUrls: ['league-player-list.component.less']
})
export class LeaguePlayerListComponent
    extends List2Component {
    @Input() leaguePlayers: LeaguePlayer[];
    @Input() displayPlayers: boolean;
    @Input() displayLeagues: boolean;
    @Input() profile: boolean;
    @Input() seeMoreText: string = 'See more';
    @Input() allowRemove: boolean;
    @Output() removePlayer: EventEmitter<Player> = new EventEmitter<Player>();
    @Output() approvePlayer: EventEmitter<Player> = new EventEmitter<Player>();

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

    onRemovePlayer(player: Player) {
        this.removePlayer.emit(player);
    }

    onApprovePlayer(player: Player) {
        this.approvePlayer.emit(player);
    }
}
