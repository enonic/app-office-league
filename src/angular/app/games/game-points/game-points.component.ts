import {Component, OnInit, OnChanges, Input, SimpleChange, SimpleChanges} from '@angular/core';
import {GraphQLService} from '../../graphql.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Game} from '../../../graphql/schemas/Game';
import {TimelineEntry} from '../TimelineEntry';
import {Point} from '../../../graphql/schemas/Point';
import {GameTeam} from '../../../graphql/schemas/GameTeam';
import {Player} from '../../../graphql/schemas/Player';
import {SideUtil} from '../../../graphql/schemas/Side';

interface GameTeamMap {
    [playerName: string]: GameTeam
}

@Component({
    selector: 'game-points',
    templateUrl: 'game-points.component.html',
    styleUrls: ['game-points.component.less']
})
export class GamePointsComponent implements OnInit, OnChanges {

    @Input() game: Game;

    private timeline: TimelineEntry[];

    constructor(private graphQLService: GraphQLService, private route: ActivatedRoute, private router: Router) {
    }

    ngOnInit(): void {
        let gameId = this.route.snapshot.params['id'];

        if (!this.game && gameId) {
            // check if the game was passed from list to spare request
            this.game = this.graphQLService.game;
            if (!this.game) {
                this.graphQLService.post(GamePointsComponent.getGameQuery,
                    {gameId: gameId}).then(
                    data => {
                        this.game = Game.fromJson(data.game);
                        this.calcPoints(this.game);
                    });
            } else {
                this.calcPoints(this.game);
            }
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        let gameChange: SimpleChange = changes['game'];
        if (gameChange && gameChange.currentValue) {
            this.calcPoints(gameChange.currentValue);
        }
    }

    private calcPoints(game: Game) {
        const parseTime = (value: number) => `${Math.floor(value/60)}'${value%60}"`;

        const teamMap: GameTeamMap = {};
        game.gameTeams.forEach((gt: GameTeam) => {
            gt.team.players.forEach((player: Player) => { teamMap[player.name] = gt; });
        });

        let loserScore = 0;
        let winnerScore = 0;

        this.timeline = [];

        game.points.forEach((point: Point) => {
            const name = point.player.name;
            const team = teamMap[name];
            const comment = point.against ? 'Scored against' : null;
            const time = parseTime(point.time);

            const loserScored = !(Number(team.winner) ^ Number(point.against));
            const side = loserScored ? 'loser' : 'winner';
            if (loserScored) {
                loserScore++;
            } else {
                winnerScore++;
            }
            const score = `${loserScore}:${winnerScore}`;

            const color = SideUtil.getColor(team.side);
            this.timeline.push(new TimelineEntry(name, team, time, comment, score, side, color));
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
    }`
}
