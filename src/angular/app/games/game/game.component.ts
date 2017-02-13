import {Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange} from '@angular/core';
import {GraphQLService} from '../../graphql.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Game} from '../../../graphql/schemas/Game';
import {PlayerResult} from '../../../graphql/schemas/PlayerResult';

@Component({
    selector: 'game',
    templateUrl: 'game.component.html',
    styleUrls: ['game.component.less']
})
export class GameComponent implements OnInit, OnChanges {

    @Input() game: Game;

    private winnerGoals: number = 0;
    private loserGoals: number = 0;

    constructor(private service: GraphQLService, private route: ActivatedRoute, private router: Router) {
    }

    ngOnInit(): void {
        let autoLoad = this.route.snapshot.data['autoLoad'],
            id = this.route.snapshot.params['id'];

        if (!this.game && autoLoad && id) {
            this.game = this.service.game || new Game(id);
            this.calcGoals(this.game);
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        let gameChange: SimpleChange = changes['game'];
        if (gameChange.currentValue) {
            this.calcGoals(gameChange.currentValue);
        }
    }

    private calcGoals(game: Game) {
        game.winners.forEach((result: PlayerResult) => {
            this.winnerGoals += result.goals || 0;
            this.loserGoals += result.goalsAgainst || 0;
        });
        game.losers.forEach((result: PlayerResult) => {
            this.loserGoals += result.goals || 0;
            this.winnerGoals += result.goalsAgainst || 0;
        });
    }

}
