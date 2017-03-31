import {Component, Input, OnChanges, OnInit, SimpleChange, SimpleChanges} from '@angular/core';
import {GraphQLService} from '../../services/graphql.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Game} from '../../../graphql/schemas/Game';
import {GamePlayer} from '../../../graphql/schemas/GamePlayer';
import {GameTeam} from '../../../graphql/schemas/GameTeam';
import {Side} from '../../../graphql/schemas/Side';
import {OfflinePersistenceService} from '../../services/offline-persistence.service';

@Component({
    selector: 'game',
    templateUrl: 'game.component.html',
    styleUrls: ['game.component.less']
})
export class GameComponent
    implements OnInit, OnChanges {

    @Input() game: Game;

    private redScore: number = 0;
    private blueScore: number = 0;
    private redTeam: GameTeam;
    private blueTeam: GameTeam;
    private redPlayers: GamePlayer[] = [];
    private bluePlayers: GamePlayer[] = [];

    constructor(protected graphQLService: GraphQLService, protected route: ActivatedRoute, protected router: Router,
                protected offlineService: OfflinePersistenceService) {
    }

    ngOnInit(): void {
        let gameId = this.route.snapshot.params['id'];

        if (gameId) {
            this.loadGame(gameId);
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        let gameChange: SimpleChange = changes['game'];
        if (gameChange && gameChange.currentValue) {
            this.processGame(gameChange.currentValue);
        }
    }

    protected loadGame(gameId: string) {
        const query = this.getGameQuery();
        this.graphQLService.post(query, {gameId: gameId}).then(
            data => {
                this.game = Game.fromJson(data.game);
                this.processGame(this.game);
                this.afterGameLoaded(this.game);
            }).catch(error => {
            this.offlineService.loadGame(gameId).then(game => {
                this.game = game;
                this.processGame(this.game);
                this.afterGameLoaded(this.game);
            }).catch(error => {
                console.log('Could not load game: ' + gameId);
                this.router.navigate([''], {replaceUrl: true});
            })
        });
    }

    protected getGameQuery(): string {
        return GameComponent.getGameQuery;
    }

    protected afterGameLoaded(game: Game) {
    }

    private processGame(game: Game) {
        this.redScore = 0;
        this.blueScore = 0;
        this.redPlayers = [];
        this.bluePlayers = [];

        game.gamePlayers.forEach((gp: GamePlayer) => {
            gp.ratingDelta = game.finished ? gp.ratingDelta : null;
            if (gp.side === Side.RED) {
                this.redScore += gp.score;
                this.blueScore += gp.scoreAgainst;
                this.redPlayers.push(gp);
            } else if (gp.side === Side.BLUE) {
                this.blueScore += gp.score;
                this.redScore += gp.scoreAgainst;
                this.bluePlayers.push(gp);
            }
        });
        game.gameTeams.forEach((gt: GameTeam) => {
            gt.ratingDelta = game.finished ? gt.ratingDelta : null;
            if (gt.side === Side.RED) {
                this.redTeam = gt;
            } else if (gt.side === Side.BLUE) {
                this.blueTeam = gt;
            }
        });
    }

    private static readonly getGameQuery = `query ($gameId: ID!) {
      game(id: $gameId) {
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
                name
                imageUrl
                players {
                    name
                    imageUrl
                }
            }
        }
        league {
            name
            imageUrl
        }
      }
    }`;
}
