import {Component} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {BaseComponent} from '../../common/base.component';
import {Game} from '../../../graphql/schemas/Game';
import {GraphQLService} from '../../services/graphql.service';
import {PageTitleService} from '../../services/page-title.service';

@Component({
    selector: 'game-list-page',
    templateUrl: 'game-list-page.component.html'
})
export class GameListPageComponent extends BaseComponent {
    private static readonly
    paging = 10;
    private static readonly
    getGamesQuery = `query($after:Int,$first:Int, $leagueName:String) {
        gamesConnection(after:$after, first:$first, leagueName:$leagueName) {
            totalCount
            edges {
                node {
                  id
                    time
                    finished
                    points {
                        player {
                            name
                            imageUrl
                        }
                        time
                        against
                    }
                    gamePlayers {
                        score
                        scoreAgainst
                        winner
                        side
                        ratingDelta
                        player {
                            name
                            imageUrl
                        }
                    }
                    gameTeams {
                        score
                        scoreAgainst
                        winner
                        side
                        ratingDelta
                        team {
                            id
                            name
                            imageUrl
                        }
                    }
                    league {
                        name
                        imageUrl
                    }
                }
            }
        }
    }`;

    public games: Game[];
    public pageCount: number = 1;
    private leagueName: string;

    constructor(private router: Router, private service: GraphQLService, private pageTitleService: PageTitleService,
                route: ActivatedRoute) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.leagueName = this.route.snapshot.params['name'];
        this.refresh();
    }

    private refresh(currentPage: number = 1) {
        let after = currentPage > 1 ? ((currentPage - 1) * GameListPageComponent.paging - 1) : undefined;
        this.service.post(
            GameListPageComponent.getGamesQuery,
            {after: after, first: GameListPageComponent.paging, leagueName: this.leagueName},
                data => {
                this.games = data.gamesConnection.edges.map(edge => Game.fromJson(edge.node));
                let totalCount = data.gamesConnection.totalCount;
                this.pageCount = Math.floor((totalCount == 0 ? 0 : totalCount - 1) / GameListPageComponent.paging) + 1;
            }
        );

        this.pageTitleService.setTitle('Players');
    }
}
