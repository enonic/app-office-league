import {Component, OnInit} from '@angular/core';
import {PlayerComponent} from '../../common/player/player.component';
import {GraphQLService} from '../../graphql.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
    selector: 'player-stats',
    templateUrl: 'player-stats.component.html'
})
export class PlayerStatsComponent extends PlayerComponent implements OnInit {

    constructor(service: GraphQLService, route: ActivatedRoute, router: Router) {
        super(service, router, route);
    }

    ngOnInit() {
    }

}
