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
    private static readonly paging = 10;
    private static readonly getGamesQuery = `query($after:Int,$first:Int, $leagueName:String, $playerName:String, $teamName:String) {
        gamesConnection(after:$after, first:$first, leagueName:$leagueName, playerName:$playerName, teamName:$teamName, finished: true) {
            totalCount
            edges {
                node {
                    id
                    time
                    finished
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
                }
            }
        }
    }`;

    public games: Game[];
    public pageCount: number = 1;
    private leagueName: string;
    private playerName: string;
    private teamName: string;

    constructor(private router: Router, private service: GraphQLService, private pageTitleService: PageTitleService,
                route: ActivatedRoute) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.leagueName = this.route.snapshot.params['leagueName'];
        this.playerName = this.route.snapshot.params['playerName'];
        this.teamName = this.route.snapshot.params['teamName'];
        this.refresh();
    }

    private refresh(currentPage: number = 1) {
        let after = currentPage > 1 ? ((currentPage - 1) * GameListPageComponent.paging - 1) : undefined;
        this.service.post(
            GameListPageComponent.getGamesQuery,
            {after: after, first: GameListPageComponent.paging, leagueName: this.leagueName, playerName: this.playerName, teamName: this.teamName},
                data => {
                this.games = data.gamesConnection.edges.map(edge => Game.fromJson(edge.node));
                let totalCount = data.gamesConnection.totalCount;
                this.pageCount = Math.floor((totalCount == 0 ? 0 : totalCount - 1) / GameListPageComponent.paging) + 1;
            }
        );

        let name = this.leagueName || this.playerName || this.teamName;
        name = name.charAt(0).toUpperCase() + name.substr(1);
        this.pageTitleService.setTitle(name + ' games');
    }
}
