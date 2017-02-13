import {Component, OnInit} from '@angular/core';
import {GraphQLService} from '../../graphql.service';
import {ActivatedRoute, Router} from '@angular/router';
import {GameComponent} from '../game/game.component';
import {Player} from '../../../graphql/schemas/Player';
import {Game} from '../../../graphql/schemas/Game';

@Component({
    selector: 'game-profile',
    templateUrl: 'game-profile.component.html',
    styleUrls: ['game-profile.component.less']
})
export class GameProfileComponent extends GameComponent implements OnInit {

    private loserPlayers: Player[];
    private winnerPlayers: Player[];

    constructor(service: GraphQLService, route: ActivatedRoute, router: Router) {
        super(service, route, router);
    }

    ngOnInit(): void {
        super.ngOnInit();

        this.fetchPlayers(this.game);
    }

    private fetchPlayers(game: Game) {
        this.loserPlayers = game.losers.map(l => l.player);
        this.winnerPlayers = game.winners.map(w => w.player);
    }
}
