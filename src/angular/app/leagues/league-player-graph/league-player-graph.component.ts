import {Component, HostListener, Input, OnChanges, OnInit, SimpleChange, SimpleChanges, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {LeaguePlayer} from '../../../graphql/schemas/LeaguePlayer';
import {BaseChartDirective} from 'ng2-charts';


@Component({
    selector: 'league-player-graph',
    templateUrl: 'league-player-graph.component.html'
})
export class LeaguePlayerGraphComponent
    implements OnInit, OnChanges {

    private static readonly SERIES_COLORS = ['rgb(228,228,0)', 'rgb(0,255,0)', 'rgb(0,255,255)', 'rgb(176,176,255)', 'rgb(255,0,255)',
        'rgb(228,228,228)', 'rgb(176,0,0)', 'rgb(186,186,0)', 'rgb(0,176,0)', 'rgb(0,176,176)', 'rgb(132,132,255)', 'rgb(176,0,176)',
        'rgb(186,186,186)', 'rgb(135,0,0)', 'rgb(135,135,0)', 'rgb(0,135,0)', 'rgb(0,135,135)', 'rgb(73,73,255)', 'rgb(135,0,135)',
        'rgb(135,135,135)', 'rgb(85,0,0)', 'rgb(84,84,0)', 'rgb(0,85,0)', 'rgb(0,85,85)', 'rgb(0,0,255)', 'rgb(85,0,85)',
        'rgb(84,84,84)'];
    @Input() leaguePlayers: LeaguePlayer[];

    width: number = 1200;
    height: number = 800;

    chartDatasets: Array<any> = [];
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
                    fontColor: 'rgba(255,255,255,0.8)',
                    callback: function (label, index, labels) {
                        return label == -1 ? '' : LeaguePlayerGraphComponent.formatTime(parseInt(label, 10));
                    }
                },
                scaleLabel: {
                    display: true,
                    labelString: 'Time'
                }
            }],
            yAxes: [{
                id: 'y-axis-0',
                gridLines: {
                    color: 'rgba(255,255,255,0.1)'
                },
                ticks: {
                    // min: 1000,
                    // suggestedMax: 1800,
                    fontColor: 'rgba(255,255,255,0.8)'
                },
                scaleLabel: {
                    display: true,
                    labelString: 'Ranking Points'
                }
            }]
        }
    };
    lineChartColors: Array<any> = [];
    lineChartLegend: boolean = true;
    lineChartType: string = 'line';

    constructor() {
        this.handleResize();
    }

    ngOnInit(): void {
        if (this.leaguePlayers) {
            this.processData(this.leaguePlayers);
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        console.log(changes);

        let leaguePlayers: SimpleChange = changes['leaguePlayers'];
        if (leaguePlayers.currentValue && leaguePlayers.previousValue) {
            this.processData(this.leaguePlayers);
            this.leaguePlayers = leaguePlayers.currentValue;
        }
    }

    @ViewChild(BaseChartDirective)
    public chart: BaseChartDirective;

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.handleResize();
        this.chart.ngOnChanges({} as SimpleChanges); // force redraw
    }

    private handleResize() {
        if (window.innerWidth < 600) {
            this.lineChartOptions.scales.xAxes[0].scaleLabel.display = false;
            this.lineChartOptions.scales.xAxes[0].ticks.display = false;
            this.lineChartOptions.scales.xAxes[0].ticks.fontSize = 8;
            this.lineChartOptions.scales.yAxes[0].scaleLabel.labelString = '';
        } else {
            this.lineChartOptions.scales.xAxes[0].scaleLabel.display = true;
            this.lineChartOptions.scales.xAxes[0].ticks.display = true;
            this.lineChartOptions.scales.xAxes[0].ticks.fontSize = 12;
            this.lineChartOptions.scales.yAxes[0].scaleLabel.labelString = 'Ranking Points';
        }
    }

    private processData(leaguePlayers: LeaguePlayer[]) {
        console.log('processData', leaguePlayers);
        let chartDatasets = [];
        let lineChartColors = [];
        let lastDatePoint = 0, firstDatePoint = Number.MAX_SAFE_INTEGER;

        // group points by date
        leaguePlayers.forEach((leaguePlayer) => {
            let gamePlayers = leaguePlayer.gamePlayers;
            let nl = 0;
            for (let gp = 0, l = gamePlayers.length; gp < l; gp++) {
                let gamePlayer = gamePlayers[gp];
                let t = gamePlayer.time.getTime();
                if (t > lastDatePoint) {
                    lastDatePoint = t;
                } else if (t < firstDatePoint) {
                    firstDatePoint = t;
                }

                if (gp > 0) {
                    if (gamePlayers[nl].time.toDateString() === gamePlayers[gp].time.toDateString()) {
                        gamePlayers[nl].ratingDelta += gamePlayers[gp].ratingDelta;
                    } else {
                        nl++;
                    }
                }
            }
            leaguePlayer.gamePlayers = gamePlayers.slice(0, nl);
        });

        // generate datasets
        leaguePlayers.forEach((leaguePlayer, idx) => {
            let data = [];

            let ratingCurrent = leaguePlayer.rating;
            data.push({x: lastDatePoint, y: ratingCurrent});

            leaguePlayer.gamePlayers.forEach((gamePlayer => {
                ratingCurrent = ratingCurrent - gamePlayer.ratingDelta;
                data.push({x: gamePlayer.time.getTime(), y: ratingCurrent});
            }));

            if (data.length === 0) {
                data.push({x: firstDatePoint, y: leaguePlayer.rating});
            } else if (data[0].x !== firstDatePoint) {
                data.push({x: firstDatePoint, y: data[data.length - 1].y});
            }

            let chartDataset = {
                // lineTension: 0,
                cubicInterpolationMode: 'monotone',
                fill: false,
                data: data,
                label: leaguePlayer.player.name,
                borderWidth: 1,
                pointRadius: 0,
                borderColor: 'rgb(20, 55, 87)'
            };
            chartDatasets.push(chartDataset);
            lineChartColors.push({
                    borderColor: this.getColor(idx)
                }
            )
        });

        for (let cd = chartDatasets.length; cd < 10; cd++) {
            let chartDataset = {
                data: [],
                label: '\t',
                showLine: false,
                hidden: true
            };
            chartDatasets.push(chartDataset);
            lineChartColors.push({
                    borderColor: this.getColor(cd)
                }
            )
        }

        this.lineChartColors = lineChartColors;
        this.chartDatasets = chartDatasets;
        this.lineChartColors = this.lineChartColors.slice();
        this.chartDatasets = this.chartDatasets.slice();

        this.lineChartOptions.scales.xAxes[0].ticks.min = firstDatePoint;
        this.lineChartOptions.scales.xAxes[0].ticks.max = lastDatePoint;
    }

    public static formatTime = function (s) {
        if (s <= 0) {
            return '';
        }
        let date = new Date(s);
        return date.toLocaleDateString();
    };

    private getColor(idx: number): string {
        const colors = LeaguePlayerGraphComponent.SERIES_COLORS;
        return colors[idx % colors.length];
    }

}
