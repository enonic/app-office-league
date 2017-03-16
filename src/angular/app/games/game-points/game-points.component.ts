import {Component, OnInit, OnChanges, Input, SimpleChange, SimpleChanges} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Game} from '../../../graphql/schemas/Game';
import {TimelineEntry} from '../TimelineEntry';
import {Point} from '../../../graphql/schemas/Point';
import {GameTeam} from '../../../graphql/schemas/GameTeam';
import {Player} from '../../../graphql/schemas/Player';
import {Side} from '../../../graphql/schemas/Side';
import {GamePlayer} from '../../../graphql/schemas/GamePlayer';

@Component({
    selector: 'game-points',
    templateUrl: 'game-points.component.html',
    styleUrls: ['game-points.component.less']
})
export class GamePointsComponent implements OnInit, OnChanges {

    @Input() game: Game;

    private timeline: TimelineEntry[];

    constructor() {
    }

    ngOnInit(): void {
        if (this.game) {
            this.processPoints(this.game);
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        let gameChange: SimpleChange = changes['game'];
        if (gameChange && gameChange.currentValue) {
            this.processPoints(gameChange.currentValue);
        }
    }

    private processPoints(game: Game) {
        const teamMap: {[playerName: string]: GameTeam} = {};
        const playerMap: {[playerName: string]: GamePlayer} = {};

        game.gameTeams.forEach((gt: GameTeam) => {
            gt.team.players.forEach((player: Player) => {
                teamMap[player.name] = gt;
            });
        });
        game.gamePlayers.forEach((gp: GamePlayer) => {
            playerMap[gp.player.name] = gp;
        });

        let blueScore = 0;
        let redScore = 0;

        this.timeline = [];

        game.points.forEach((point: Point) => {
            const name = point.player.name;
            const gameTeam = teamMap[name];
            const gamePlayer = playerMap[name];
            const comment = point.against ? 'Scored against' : null;

            const side = gamePlayer.side;
            if (side === Side.BLUE) {
                if (point.against) {
                    redScore++;
                } else {
                    blueScore++;
                }
            } else if (side === Side.RED) {
                if (point.against) {
                    blueScore++;
                } else {
                    redScore++;
                }
            }
            const score = `${blueScore}-${redScore}`;

            const color = gamePlayer.side === Side.BLUE ? 'blue' : 'red';
            this.timeline.push(new TimelineEntry(name, gameTeam, point.time, comment, score, color));
        });
    }
}
