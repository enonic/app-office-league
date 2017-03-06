import {Component, Input} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Handedness} from '../../../graphql/schemas/Handedness';
import {Player} from '../../../graphql/schemas/Player';
import {BaseComponent} from '../../common/base.component';
import {GraphQLService} from '../../graphql.service';
import {Countries} from '../../common/countries';
import {Game} from '../../../graphql/schemas/Game';
import {League} from '../../../graphql/schemas/League';
import {Team} from '../../../graphql/schemas/Team';
import {XPCONFIG} from '../../app.config';
import {LeaguePlayer} from '../../../graphql/schemas/LeaguePlayer';

@Component({
    selector: 'player-profile',
    templateUrl: 'player-profile.component.html',
    styleUrls: ['player-profile.component.less']
})
export class PlayerProfileComponent extends BaseComponent {
    private static readonly getPlayerQuery = `query($name: ID){
        player(name: $name) {
            id
            name
            nickname
            nationality
            handedness
            description

            gamePlayers(count: 5) {
              game {
                id
                time
                finished
                points {
                  time
                  against
                  player {
                    id
                    name
                  }
                }
                gamePlayers {
                  id
                  time
                  score
                  side
                  winner
                  ratingDelta
                  player {
                    id
                    name
                  }
                }
                gameTeams {
                  id
                  time
                  score
                  side
                  winner
                  ratingDelta
                  team {
                    id
                    name
                  }
                }
                league {
                  id
                  name
                }
              }
            }
            
            leaguePlayers {
              rating
              ranking
              league {
                id
                name
                sport
                description      
              }
            }
            
            teams(count: 5) {
                id
                name
                description
                players {
                    id
                    name
                }
            }
        }
    }`;
    
    @Input() player: Player;
    games: Game[] = [];
    leaguePlayers: League[] = [];
    teams: Team[] = [];
    editable: boolean;

    constructor(route: ActivatedRoute, private graphQLService: GraphQLService) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();
        
        let name = this.route.snapshot.params['name'];

        this.graphQLService.post(PlayerProfileComponent.getPlayerQuery, {name: name}).then(
            data => this.handleResponse(data));
    }

    private handleResponse(data) {
        this.player = Player.fromJson(data.player);
        this.games = data.player.gamePlayers.map((gm) => Game.fromJson(gm.game));
        if (data.player.leaguePlayers) {
            this.leaguePlayers = data.player.leaguePlayers.map((lp) => {
                let leaguePlayer = new LeaguePlayer(lp.id);
                leaguePlayer.league = League.fromJson(lp.league);
                leaguePlayer.ranking = lp.ranking;
                leaguePlayer.rating = lp.rating;
                return leaguePlayer;
            });
        }
        if (data.player.teams) {
            this.teams = data.player.teams.map((t) => Team.fromJson(t));
        }
        let currentPlayerId = XPCONFIG.user && XPCONFIG.user.playerId;
        this.editable = this.player.id === currentPlayerId;
    }

    getNationality(): string {
        return Countries.getCountryName(this.player.nationality);
    }

    getHandedness(): string {
        const h = this.player && this.player.handedness;
        switch (h) {
        case Handedness.RIGHT:
            return 'Right';
        case Handedness.LEFT:
            return 'Left';
        case  Handedness.AMBIDEXTERTERITY:
            return 'Ambidextrous';
        default:
            return 'N/A';
        }
    }

    onEditClicked() {
        console.log('TODO: Edit player');
    }    
}
