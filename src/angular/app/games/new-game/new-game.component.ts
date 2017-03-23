import {Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange} from '@angular/core';
import {GraphQLService} from '../../services/graphql.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Player} from '../../../graphql/schemas/Player';
import {XPCONFIG} from '../../app.config';
import {League} from '../../../graphql/schemas/League';
import {GameParameters} from '../GameParameters';
import {GamePlayComponent} from '../game-play/game-play.component';
import {PageTitleService} from '../../services/page-title.service';

@Component({
    selector: 'new-game',
    templateUrl: 'new-game.component.html',
    styleUrls: ['new-game.component.less']
})
export class NewGameComponent implements OnInit {

    leagueId: string;

    bluePlayer1: Player;
    bluePlayer2: Player;
    redPlayer1: Player;
    redPlayer2: Player;
    excludePlayerIds: {[id: string]: boolean} = {};

    league: League;
    title: string;
    playerSelectionReady: boolean;

    constructor(private graphQLService: GraphQLService, private route: ActivatedRoute,
                private pageTitleService: PageTitleService, private router: Router) {
    }

    ngOnInit(): void {
        this.leagueId = this.route.snapshot.params['leagueId'];

        if (!this.leagueId) {
            return;
        }

        let playerId = XPCONFIG.user && XPCONFIG.user.playerId;
        if (playerId) {
            this.graphQLService.post(NewGameComponent.getPlayerLeagueQuery, {playerId: playerId, leagueId: this.leagueId}).then(data => {
                this.bluePlayer1 = Player.fromJson(data.player);
                this.league = League.fromJson(data.league);
                this.title = this.league.name;

                this.pageTitleService.setTitle(this.league.name);

                this.updatePlayerSelectionState();
            });
        }
    }

    onPlayClicked() {
        let gameParams: GameParameters = {
            bluePlayer1: this.bluePlayer1 && this.bluePlayer1.id,
            bluePlayer2: this.bluePlayer2 && this.bluePlayer2.id,
            redPlayer1: this.redPlayer1 && this.redPlayer1.id,
            redPlayer2: this.redPlayer2 && this.redPlayer2.id
        };

        this.createGame().then((gameId) => {
            console.log('Initial game created: ' + gameId);
            gameParams.gameId = gameId;
            this.router.navigate(['games', this.leagueId, 'game-play'], {queryParams: gameParams});
        }).catch((ex) => {
            console.log('Could not create game');
            this.router.navigate(['games', this.leagueId, 'game-play'], {queryParams: gameParams});
        });
    }

    onShuffleClicked() {
        let players: Player[] = [this.bluePlayer1, this.bluePlayer2, this.redPlayer1, this.redPlayer2];
        this.bluePlayer1 = this.randomPlayer(players);
        this.bluePlayer2 = this.randomPlayer(players);
        this.redPlayer1 = this.randomPlayer(players);
        this.redPlayer2 = this.randomPlayer(players);
        this.updatePlayerSelectionState();
    }
    
    private randomPlayer(players: Player[]) {
        return players.splice(Math.floor(Math.random() * players.length), 1)[0];
    }

    onBluePlayer1Selected(p: Player) {
        if (p) {
            this.bluePlayer1 = p;
            this.updatePlayerSelectionState();
        }
    }

    onBluePlayer2Selected(p: Player) {
        if (p) {
            this.bluePlayer2 = p;
            this.updatePlayerSelectionState();
        }
    }

    onRedPlayer1Selected(p: Player) {
        if (p) {
            this.redPlayer1 = p;
            this.updatePlayerSelectionState();
        }
    }

    onRedPlayer2Selected(p: Player) {
        if (p) {
            this.redPlayer2 = p;
            this.updatePlayerSelectionState();
        }
    }

    private createGame(): Promise<string> {
        let players = [this.bluePlayer1, this.redPlayer1, this.bluePlayer2, this.redPlayer2].filter((p) => !!p).map((p) => {
            return {"playerId": p.id, "side": ( p === this.bluePlayer1 || p === this.bluePlayer2 ? 'blue' : 'red')};
        });
        let createGameParams = {
            points: [],
            players: players,
            leagueId: this.leagueId
        };
        createGameParams['leagueId'] = this.league.id;
        return this.graphQLService.post(GamePlayComponent.createGameMutation, createGameParams).then(
            data => {
                console.log('Game created', data);
                return data.createGame.id;
            });
    }

    private updatePlayerSelectionState() {
        let singlesGameReady = !!(this.bluePlayer1 && this.redPlayer1 && !this.bluePlayer2 && !this.redPlayer2);
        let doublesGameReady = !!(this.bluePlayer1 && this.redPlayer1 && this.bluePlayer2 && this.redPlayer2);
        this.playerSelectionReady = singlesGameReady || doublesGameReady;

        this.excludePlayerIds = {};
        [this.bluePlayer1, this.bluePlayer2, this.redPlayer1, this.redPlayer2].filter((p) => !!p).forEach(
            (p) => this.excludePlayerIds[p.id] = true);
    }

    private static readonly getPlayerLeagueQuery = `query ($playerId: ID!, $leagueId: ID!) {
        player(id: $playerId) {
            id
            name
            nickname
            nationality
            handedness
            description
        }
        
        league(id: $leagueId) {
            id
            name
            description
        }
    }`;

}
