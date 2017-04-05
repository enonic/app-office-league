import {Component, OnInit, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {GraphQLService} from '../../services/graphql.service';
import {Game} from '../../../graphql/schemas/Game';
import {ListComponent} from '../../common/list.component';

@Component({
    selector: 'game-list',
    templateUrl: 'game-list.component.html'
})
export class GameListComponent extends ListComponent implements OnInit, OnChanges {

    @Input() games: Game[];
    @Input() leagueId: string;
    @Input() teamId: string;
    @Input() playerId: string;

    constructor(private router: Router, private service: GraphQLService, route: ActivatedRoute) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        if (this.games == undefined) {
            this.loadGames();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);

        let simpleChange = changes['leagueId'] || changes['teamId'] || changes['playerId'];
        if (simpleChange && !!simpleChange.currentValue) {
            this.loadGames();
        } else if (changes['games']) {
            this.games = changes['games'].currentValue;
        }
    }

    onGameClicked(game: Game, event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();

        this.service.game = game;
        this.router.navigate(['games', game.id]);
    }

    private loadGames() {
        this.service.post(
            this.getQuery(),
            undefined,
            data => this.games = data.games.map(game => Game.fromJson(game)).sort(this.gameSorter.bind(this))
        );
    }

    private gameSorter(first: Game, second: Game): number {
        return second.time.getTime() - first.time.getTime();
    }

    getQuery(): string {
        return `query{
                  games(leagueId: "${this.leagueId}", finished: true){
                    id
                    time
                    finished
                    points {
                        player {
                            name
                            imageUrl
                        }
                    }
                    comments {
                        text
                        author {
                            name
                        }
                    }
                    gamePlayers {
                        winner
                        score
                        scoreAgainst
                        side
                        ratingDelta
                        player {
                            name
                            imageUrl
                        }
                    }
                    gameTeams {
                        winner
                        score
                        scoreAgainst
                        side
                    }
                    league {
                        name
                        imageUrl
                    }
                  }
                }`;
    }
}
