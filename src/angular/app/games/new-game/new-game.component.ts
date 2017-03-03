import {Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange} from '@angular/core';
import {GraphQLService} from '../../graphql.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Player} from '../../../graphql/schemas/Player';
import {XPCONFIG} from '../../app.config';
import {League} from '../../../graphql/schemas/League';

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

    constructor(private graphQLService: GraphQLService, private route: ActivatedRoute, private router: Router) {
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

                this.updatePlayerSelectionState();
            });
        }
    }

    onPlayClicked() {

    }

    onShuffleClicked() {

    }

    onBluePlayer1Selected(p: Player) {
        console.log('Blue player 1 selected', p);
        if (p) {
            this.bluePlayer1 = p;
            this.updatePlayerSelectionState();
        }
    }

    onBluePlayer2Selected(p: Player) {
        console.log('Blue player 2 selected', p);
        if (p) {
            this.bluePlayer2 = p;
            this.updatePlayerSelectionState();
        }
    }

    onRedPlayer1Selected(p: Player) {
        console.log('Red player 1 selected', p);
        if (p) {
            this.redPlayer1 = p;
            this.updatePlayerSelectionState();
        }
    }

    onRedPlayer2Selected(p: Player) {
        console.log('Red player 2 selected', p);
        if (p) {
            this.redPlayer2 = p;
            this.updatePlayerSelectionState();
        }
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
