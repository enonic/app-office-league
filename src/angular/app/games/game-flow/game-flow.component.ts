import {Component, Input, OnChanges, OnInit, SimpleChange, SimpleChanges} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Game} from '../../../graphql/schemas/Game';
import {GamePlayer} from '../../../graphql/schemas/GamePlayer';
import {Side} from '../../../graphql/schemas/Side';
import {GameTeam} from '../../../graphql/schemas/GameTeam';

@Component({
    selector: 'game-flow',
    templateUrl: 'game-flow.component.html',
    styleUrls: ['game-flow.component.less']
})
export class GameFlowComponent
    implements OnInit, OnChanges {

    @Input() game: Game;

    chartDatasets: Array<any> = [
        {
            lineTension: 0,
            fill: false,
            data: [],
            label: 'Red'
        },
        {
            lineTension: 0,
            fill: false,
            data: [],
            label: 'Blue'
        }
    ];
    lineChartOptions: any = {
        responsive: true,
        scales: {
            xAxes: [{
                scaleID: 'x-axis-0',
                type: 'linear',
                position: 'bottom',
                gridLines: {
                    color: 'rgba(255,255,255,0.1)'
                },
                ticks: {
                    min: 0,
                    suggestedMax: 60,
                    fontColor: 'rgba(255,255,255,0.8)',
                    callback: function (label, index, labels) {
                        return label == -1 ? '' : GameFlowComponent.formatSeconds(parseInt(label, 10));
                    }
                }
            }],
            yAxes: [{
                id: 'y-axis-0',
                gridLines: {
                    color: 'rgba(255,255,255,0.1)'
                },
                ticks: {
                    min: 0,
                    suggestedMax: 10,
                    stepSize: 1,
                    fontColor: 'rgba(255,255,255,0.8)'
                }
            }]
        },
        tooltips: {
            callbacks: {
                title: function (tooltipItems, data) {
                    return tooltipItems.length && GameFlowComponent.formatSeconds(tooltipItems[0].xLabel);
                }
            }
        },
        annotation: {
            annotations: [{
                type: 'line',
                mode: 'vertical',
                scaleID: 'x-axis-0',
                value: 0,
                borderColor: 'rgba(84, 110, 122, 0)',
                borderDash: [4, 2],
                borderWidth: 2
            }],
            drawTime: 'afterDatasetsDraw'
        }
    };
    lineChartColors: Array<any> = [
        { // red
            backgroundColor: 'rgba(148,159,177,0.2)',
            borderColor: "rgba(160,37,33,1)",
            pointBorderColor: "rgba(160,37,33,1)",
            pointBackgroundColor: "#fff",
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "rgba(160,37,33,1)",
            pointHoverBorderColor: "rgba(160,37,33,1)",
            pointHoverBorderWidth: 2,
            pointRadius: 2,
        },
        { //blue
            backgroundColor: 'rgba(77,83,96,0.2)',
            borderColor: "rgba(0,61,131,1)",
            pointBorderColor: "rgba(0,61,131,1)",
            pointBackgroundColor: "#fff",
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "rgba(0,61,131,1)",
            pointHoverBorderColor: "rgba(0,61,131,1)",
            pointHoverBorderWidth: 2,
            pointRadius: 2,
        }
    ];
    lineChartLegend: boolean = false;
    lineChartType: string = 'line';

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
        let blueLabel = '', redLabel = '';
        game.gameTeams.forEach((gt: GameTeam) => {
            if (gt.side === Side.BLUE) {
                blueLabel = gt.team.name;
            } else if (gt.side === Side.RED) {
                redLabel = gt.team.name;
            }
        });
        const playerMap: { [playerName: string]: GamePlayer } = {};
        game.gamePlayers.forEach((gp: GamePlayer) => {
            playerMap[gp.player.name] = gp;
            if (!blueLabel && (gp.side === Side.BLUE)) {
                blueLabel = gp.player.name;
            } else if (!redLabel && (gp.side === Side.RED)) {
                redLabel = gp.player.name;
            }
        });

        let dataBlue = [], dataRed = [], redScore = 0, blueScore = 0, midTime = 0;
        dataRed.push({x: 0, y: 0});
        dataBlue.push({x: 0, y: 0});

        game.points.forEach((point => {
            const name = point.player.name;
            const gamePlayer = playerMap[name];
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
            dataRed.push({
                x: point.time,
                y: redScore
            });
            dataBlue.push({
                x: point.time,
                y: blueScore
            });

            if (midTime === 0 && ( redScore === 5 || blueScore === 5)) {
                midTime = point.time;
            }
        }));

        this.chartDatasets[0].data = dataRed;
        this.chartDatasets[0].label = redLabel;
        this.chartDatasets[1].data = dataBlue;
        this.chartDatasets[1].label = blueLabel;

        this.lineChartOptions.annotation.annotations[0].value = midTime;

        this.chartDatasets = this.chartDatasets.slice(); // force refresh of chart
    }

    public static formatSeconds = function (s) {
        if (s <= 0) {
            return '';
        }
        let date = new Date(null);
        date.setSeconds(s);
        if (s < 3600) {
            return date.toISOString().substr(14, 5)
        } else {
            return date.toISOString().substr(11, 8);
        }
    };
}
