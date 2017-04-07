import {Component, Input, SimpleChanges} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {List2Component} from '../list2.component';
import {Player} from '../../../graphql/schemas/Player';

@Component({
    selector: 'player-list',
    templateUrl: 'player-list.component.html',
    styleUrls: ['player-list.component.less']
})
export class PlayerListComponent extends List2Component {
    @Input() players: Player[];

    constructor(route: ActivatedRoute, router: Router) {
        super(route, router);
    }

    onPlayerClicked(player: Player, event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();

        this.router.navigate(['players', player.name.toLowerCase()]);
    }
}
