import {Component} from '@angular/core';
import {GraphQLService} from '../../graphql.service';
import {ActivatedRoute, Router} from '@angular/router';
import {PlayerComponent} from '../../common/player/player.component';

@Component({
    selector: 'player-profile',
    templateUrl: 'player-profile.component.html'
})
export class PlayerProfileComponent extends PlayerComponent {

    constructor(service: GraphQLService, route: ActivatedRoute, router: Router) {
        super(service, router, route);
    }

}
