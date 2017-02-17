import {Component} from '@angular/core';
import {GraphQLService} from '../../graphql.service';
import {ActivatedRoute, Router} from '@angular/router';
import {GameComponent} from '../game/game.component';

@Component({
    selector: 'game-profile',
    templateUrl: 'game-profile.component.html',
    styleUrls: ['game-profile.component.less']
})
export class GameProfileComponent extends GameComponent {

    constructor(service: GraphQLService, route: ActivatedRoute, router: Router) {
        super(service, route, router);
    }

}
