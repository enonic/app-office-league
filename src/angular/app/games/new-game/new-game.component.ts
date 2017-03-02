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

    league: League;
    title: string;

    constructor(private graphQLService: GraphQLService, private route: ActivatedRoute, private router: Router) {
    }

    ngOnInit(): void {
        this.leagueId = this.route.snapshot.params['leagueId'];

        if (!this.leagueId) {
            return;
        }

        let playerId = XPCONFIG.user.playerId;
        if (playerId) {
            this.graphQLService.post(NewGameComponent.getPlayerLeagueQuery, {playerId: playerId, leagueId: this.leagueId}).then(data => {
                this.bluePlayer1 = Player.fromJson(data.player);
                this.league = League.fromJson(data.league);
                this.title = this.league.name;
            });
        }
    }

    onBluePlayer1Selected(p: Player) {
        console.log('Blue player 1 selected', p);
        this.bluePlayer1 = p;
    }

    onBluePlayer2Selected(p: Player) {
        console.log('Blue player 2 selected', p);
        this.bluePlayer2 = p;
    }

    onRedPlayer1Selected(p: Player) {
        console.log('Red player 1 selected', p);
        this.redPlayer1 = p;
    }

    onRedPlayer2Selected(p: Player) {
        console.log('Red player 2 selected', p);
        this.redPlayer2 = p;
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
