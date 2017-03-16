import {Component, Input, SimpleChanges, EventEmitter} from '@angular/core';
import {GraphQLService} from '../../graphql.service';
import {AuthService} from '../../auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {League} from '../../../graphql/schemas/League';
import {BaseComponent} from '../../common/base.component';
import {Player} from '../../../graphql/schemas/Player';
import {Team} from '../../../graphql/schemas/Team';
import {MaterializeDirective,MaterializeAction} from "angular2-materialize/dist/index";

@Component({
    selector: 'league-profile-players',
    templateUrl: 'league-profile-players.component.html'
})
export class LeagueProfilePlayersComponent extends BaseComponent {
    materializeActions = new EventEmitter<string|MaterializeAction>();
    
    private static readonly getLeagueQuery = `query ($name: String, $first:Int, $sort: String) {
        league(name: $name) {
            id
            name
            leaguePlayers(first:$first, sort:$sort) {
                ranking
                player {
                    name
                }
                league {
                    name
                }
            }
            nonMemberPlayers {
                id
                name
            }
        }
    }`;

    private static readonly joinPlayerLeagueQuery = `mutation ($playerId: ID!, $leagueId:ID!) {
        joinPlayerLeague(playerId: $playerId, leagueId: $leagueId) {
            id
        }
    }`;
    
    @Input() league: League;

    constructor(route: ActivatedRoute, private graphQLService: GraphQLService, private authService: AuthService, private router: Router) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        let name = this.route.snapshot.params['name'];

        if (!this.league && name) {
            this.refreshData(name);   
        }
    }
    
    refreshData(leagueName: String): void {
        this.graphQLService.post(LeagueProfilePlayersComponent.getLeagueQuery, {name: leagueName, first:-1, sort:'rating DESC, name ASC'}).then(data => {
            this.league = League.fromJson(data.league);
        });
    }

    openAddPlayerModal(): void {
        this.materializeActions.emit({action:"modal",params:['open']});
    }

    closeAddPlayerModal(): void {
        this.materializeActions.emit({action:"modal",params:['close']});
    }
    
    addPlayer(player: Player): void {
        console.log('add ' + player.name);
        this.graphQLService.post(LeagueProfilePlayersComponent.joinPlayerLeagueQuery, {playerId: player.id, leagueId: this.league.id}).then(data => {
            this.refreshData(this.league.name);
        });
        this.closeAddPlayerModal();
    }
}
