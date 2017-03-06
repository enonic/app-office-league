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
import {LeagueTeam} from '../../../graphql/schemas/LeagueTeam';

@Component({
    selector: 'team-profile',
    templateUrl: 'team-profile.component.html',
    styleUrls: ['team-profile.component.less']
})
export class TeamProfileComponent extends BaseComponent {
    private static readonly getTeamQuery = `query($name: String){
        team(name: $name) {
            id
            name
            description

            gameTeams(count: 5) {
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
            
            leagueTeams {
              rating
              ranking
              league {
                id
                name
                sport
                description      
              }
            }
            
            players {
                name
            }
        }
    }`;
    
    @Input() team: Team;
    games: Game[] = [];
    editable: boolean;

    constructor(route: ActivatedRoute, private graphQLService: GraphQLService) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();
        
        let name = this.route.snapshot.params['name'];

        if (!this.team) {
            this.graphQLService.post(TeamProfileComponent.getTeamQuery, {name: name}).then(
                data => this.handleResponse(data));
        }
    }

    private handleResponse(data) {
        this.team = Team.fromJson(data.team);
        console.log('Team:', this.team);
        this.games = data.team.gameTeams.map((gm) => Game.fromJson(gm.game));
        let currentPlayerId = XPCONFIG.user && XPCONFIG.user.playerId;
        this.editable = this.team.id === currentPlayerId; //TODO
    }

    onEditClicked() {
        console.log('TODO: Edit player');
    }    
}
