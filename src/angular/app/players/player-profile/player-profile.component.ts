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

@Component({
    selector: 'player-profile',
    templateUrl: 'player-profile.component.html',
    styleUrls: ['player-profile.component.less']
})
export class PlayerProfileComponent extends BaseComponent {

    @Input() player: Player;
    @Input() games: Game[] = [];
    @Input() leagues: League[] = [];
    @Input() teams: Team[] = [];

    constructor(route: ActivatedRoute, private graphQLService: GraphQLService) {
        super(route);
    }

    ngOnInit(): void {
        let id = this.route.snapshot.params['id'];

        //TODO Player name defined as player id. Fix
        this.graphQLService.post(PlayerProfileComponent.getPlayerQuery, {name: id}).then(
            data => this.handleResponse(data));
    }

    private handleResponse(data) {
        if (data.errors) {
            console.error(data);
            return;
        }
        this.player = Player.fromJson(data.player);
        this.games = data.player.gamePlayers.map((gm) => Game.fromJson(gm.game));
        if (data.player.leaguePlayers) {
            this.leagues = data.player.leaguePlayers.map((lp) => League.fromJson(lp.league));
        }
        if (data.player.teams) {
            this.teams = data.player.teams.map((t) => Team.fromJson(t));
        }
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

    //TODO search by id is more efficient
    private static readonly getPlayerQuery = `query($name: String){
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
}
