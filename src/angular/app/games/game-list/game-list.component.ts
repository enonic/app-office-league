import {Component, OnInit, Input} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {GraphQLService} from '../../graphql.service';
import {Game} from '../../../graphql/schemas/Game';
import {ListComponent} from '../../common/list.component';

@Component({
    selector: 'game-list',
    templateUrl: 'game-list.component.html'
})
export class GameListComponent extends ListComponent implements OnInit {

    @Input() games: Game[];
    @Input() leagueId: string;
    @Input() teamId: string;
    @Input() playerId: string;

    constructor(private router: Router, private service: GraphQLService, route: ActivatedRoute) {
        super(route, `query{
      games{
        id,
        displayName, 
        date,
        winners{
          player{
            displayName
          },
          goals,
          goalsAgainst
        },
        losers{
          player{
            displayName
          },
          goals,
          goalsAgainst
        }
      }
    }`);
    }

    ngOnInit(): void {
        super.ngOnInit();

        if (this.autoLoad) {
            this.service.get(this.query).then((data: any) => {
                this.games = data.games.map(game => Game.fromJson(game)).sort(this.gameSorter.bind(this));
            })
        }
    }

    onGameClicked(game: Game) {
        this.service.game = game;
        this.router.navigate(['games', game.displayName])
    }


    private gameSorter(first: Game, second: Game): number {
        return second.date.getTime() - first.date.getTime();
    }
}
