import {Component} from '@angular/core';
import {GraphQLService} from '../../graphql.service';
import {ActivatedRoute, Router} from '@angular/router';
import {GameComponent} from '../game/game.component';

@Component({
    selector: 'game-points',
    templateUrl: 'game-points.component.html',
    styleUrls: ['game-points.component.less']
})
export class GamePointsComponent extends GameComponent {

    constructor(service: GraphQLService, route: ActivatedRoute, router: Router) {
        super(service, route, router);
    }

}
