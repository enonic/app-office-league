import {Component, Input, SimpleChanges, OnChanges, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {BaseComponent} from '../../common/base.component';
import {GraphQLService} from '../../services/graphql.service';
import {Game} from '../../../graphql/schemas/Game';
import {Team} from '../../../graphql/schemas/Team';
import {XPCONFIG} from '../../app.config';
import {PageTitleService} from '../../services/page-title.service';

@Component({
    selector: 'team-profile',
    templateUrl: 'team-profile.component.html',
    styleUrls: ['team-profile.component.less']
})
export class TeamProfileComponent extends BaseComponent implements OnInit, OnChanges {

    @Input() team: Team;
    games: Game[] = [];
    editable: boolean;

    constructor(route: ActivatedRoute, private router: Router, private graphQLService: GraphQLService,
                private pageTitleService: PageTitleService) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        let name = this.route.snapshot.params['name'];

        if (!this.team) {
            this.graphQLService.post(
                TeamProfileComponent.getTeamQuery,
                {name: name},
                data => this.handleTeamQueryResponse(data)
            );
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        super.ngOnChanges(changes);

        let teamChane = changes['team'];
        if (teamChane && teamChane.currentValue) {
            this.pageTitleService.setTitle((<Team>teamChane.currentValue).name);
        }
    }

    private handleTeamQueryResponse(data) {
        this.team = Team.fromJson(data.team);
        this.games = data.team.gameTeams.map((gm) => Game.fromJson(gm.game));
        let currentPlayerId = XPCONFIG.user && XPCONFIG.user.playerId;
        this.editable =
            this.team.players.length === 2 && ( this.team.players[0].id === currentPlayerId || this.team.players[1].id === currentPlayerId);

        this.pageTitleService.setTitle(this.team.name);
    }

    onEditClicked() {
        this.router.navigate(['teams', this.team.name.toLowerCase(), 'edit']);
    }

    private static readonly getTeamQuery = `query($name: String){
        team(name: $name) {
            id
            name
            imageUrl
            description

            gameTeams(first: 5) {
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
                    imageUrl
                  }
                }
                gamePlayers {
                  id
                  time
                  score
                  scoreAgainst
                  side
                  winner
                  ratingDelta
                  player {
                    id
                    name
                    imageUrl
                    description
                  }
                }
                gameTeams {
                  id
                  time
                  score
                  scoreAgainst
                  side
                  winner
                  ratingDelta
                  team {
                    id
                    name
                    imageUrl
                  }
                }
                league {
                  id
                  name
                  imageUrl
                }
              }
            }
            
            leagueTeams {
              rating
              ranking
              league {
                id
                name
                imageUrl
                sport
                description      
              }
            }
            
            players {
                id
                name
                imageUrl
                description
            }
        }
    }`;

}
