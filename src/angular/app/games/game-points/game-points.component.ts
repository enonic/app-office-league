import {Component, Input, OnChanges, OnInit, SimpleChange, SimpleChanges} from '@angular/core';
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
export class GamePointsComponent
    implements OnInit, OnChanges {

    @Input() game: Game;

    private timeline: TimelineEntry[];

    constructor() {
    }

    ngOnInit(): void {
        if (this.game) {
            this.processTimeline(this.game);
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        let gameChange: SimpleChange = changes['game'];
        if (gameChange && gameChange.currentValue) {
            this.processTimeline(gameChange.currentValue);
        }
    }

    private processTimeline(game: Game) {
        const teamMap: { [playerName: string]: GameTeam } = {};
        const playerMap: { [playerName: string]: GamePlayer } = {};

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

        // process points
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
            this.timeline.push(new TimelineEntry(name, gameTeam && gameTeam.team.name, point.time, comment, score, gamePlayer.side));
        });

        // process comments
        const baseTimeOffset = game.time ? game.time.getTime() / 1000 : 0;
        const commentAuthorSides: { [playerName: string]: Side } = {};
        let nextCommenterSide = Side.BLUE;
        for (let c = game.comments.length - 1; c >= 0; c--) {
            const comment = game.comments[c];
            if (!comment.time) {
                continue;
            }
            let timeOffset = Math.floor(( comment.time.getTime() / 1000) - baseTimeOffset);
            timeOffset = timeOffset < 0 ? 0 : timeOffset;

            const gamePlayer = playerMap[comment.author.name];
            let side: Side;
            if (gamePlayer) {
                // comment author is one of the players in the game
                side = gamePlayer.side;
            } else {
                // pick one side for the author, and keep it for all its comments
                side = commentAuthorSides[comment.author.name];
                if (side == null) {
                    side = nextCommenterSide;
                    nextCommenterSide = nextCommenterSide == Side.BLUE ? Side.RED : Side.BLUE;
                    commentAuthorSides[comment.author.name] = side;
                }
            }
            const timelineEntry = new TimelineEntry(comment.author.name, comment.text, timeOffset, '', '', side);
            timelineEntry.isComment = true;
            timelineEntry.time = '';
            this.timeline.push(timelineEntry);
        }

        this.timeline.sort((t1, t2) => t2.timeOffset - t1.timeOffset);
    }
}
