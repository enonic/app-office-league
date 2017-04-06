import {Component, OnInit, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {GraphQLService} from '../../services/graphql.service';
import {Game} from '../../../graphql/schemas/Game';
import {List2Component} from '../../common/list2.component';

@Component({
    selector: 'game-list',
    templateUrl: 'game-list.component.html'
})
export class GameListComponent extends List2Component {

    @Input() games: Game[];

    constructor(route: ActivatedRoute, router: Router) {
        super(route, router);
    }

    onGameClicked(game: Game, event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.router.navigate(['games', game.id]);
    }
}
