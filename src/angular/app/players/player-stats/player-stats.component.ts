import {Component, Input} from '@angular/core';
import {BaseComponent} from '../../common/base.component';
import {Player} from '../../../graphql/schemas/Player';
import {GraphQLService} from '../../graphql.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
    selector: 'player-stats',
    templateUrl: 'player-stats.component.html',
    styleUrls: ['player-stats.component.less']
})
export class PlayerStatsComponent extends BaseComponent {

    @Input() player: Player;

    constructor(route: ActivatedRoute) {
        super(route);
    }
}
