import {Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange} from '@angular/core';
import {GraphQLService} from '../../graphql.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Game} from '../../../graphql/schemas/Game';
import {GamePlayer} from '../../../graphql/schemas/GamePlayer';
import {Player} from '../../../graphql/schemas/Player';
import {Team} from '../../../graphql/schemas/Team';
import {GameTeam} from '../../../graphql/schemas/GameTeam';
import {Side} from '../../../graphql/schemas/Side';

@Component({
    selector: 'game',
    templateUrl: 'game.component.html',
    styleUrls: ['game.component.less']
})
export class GameComponent implements OnInit, OnChanges {

    @Input() game: Game;

    private winnerGoals: number = 0;
    private loserGoals: number = 0;
    private winnerSide: string;
    private loserSide: string;
    private winnerTeam: Team;
    private loserTeam: Team;
    private winners: Player[] = [];
    private losers: Player[] = [];

    constructor(private service: GraphQLService, private route: ActivatedRoute, private router: Router) {
    }

    ngOnInit(): void {
        
        let id = this.route.snapshot.params['id'];

        if (!this.game && id) {
            // check if the game was passed from list to spare request
            this.game = this.service.game;
            if (!this.game) {
                // no game was passed because this was probably a page reload
                let query = `query{
                  game(id: "${id}") {
                    id
                    time
                    finished
                    points {
                        player {
                            name
                        }
                        time
                        against
                    }
                    comments {
                        author {
                            name
                        }
                        text
                    }
                    gamePlayers {
                        score
                        winner
                        side
                        ratingDelta
                        player {
                            name
                        }
                    }
                    gameTeams {
                        score
                        winner
                        side    
                        ratingDelta
                        team {
                            name
                            players {
                                name
                            }
                        }
                    }
                    league {
                        name
                    }
                  }
                }`;
                // Uncomment when there's game by id qraphQL query
                //this.service.post(query).then(data => this.game = Game.fromJson(data.game));
            } else {
                this.calcStats(this.game);
            }
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        let gameChange: SimpleChange = changes['game'];
        if (gameChange && gameChange.currentValue) {
            this.calcStats(gameChange.currentValue);
        }
    }

    private calcStats(game: Game) {
        game.gamePlayers.forEach((gp: GamePlayer) => {
            if (gp.winner) {
                this.winnerGoals += gp.score || 0;
                this.winners.push(gp.player);
                this.winnerSide = `side-${Side[gp.side]}`;
            } else {
                this.loserGoals += gp.score || 0;
                this.losers.push(gp.player);
                this.loserSide = `side-${Side[gp.side]}`;
            }
        });
        game.gameTeams.forEach((gt: GameTeam) => {
            if (gt.winner) {
                this.winnerTeam = gt.team;
            } else {
                this.loserTeam = gt.team
            }
        });
    }

}
