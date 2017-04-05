import {Component, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {Player} from '../../../graphql/schemas/Player';
import {BaseComponent} from '../base.component';
import {GraphQLService} from '../../services/graphql.service';
import {ActivatedRoute, Router} from '@angular/router';
import {RankingHelper} from '../../../graphql/schemas/RankingHelper';

@Component({
    selector: 'player-summary',
    templateUrl: 'player-summary.component.html',
    styleUrls: ['player-summary.component.less']
})
export class PlayerSummaryComponent
    extends BaseComponent {

    @Input() player: Player;
    @Input() playerId: string;
    @Input() rating: number = 0;
    @Input() ranking: number = 0;

    constructor(route: ActivatedRoute, private graphQLService: GraphQLService, private router: Router) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        let id = this.playerId || this.route.snapshot.params['id'];

        if (!this.player && id) {
            // check if the team was passed from list to spare request
            this.player = this.graphQLService.player;
            if (!this.player) {
                // no team was passed because this was probably a page reload
                let query = `query{
                  player(name: "${id}") {
                    id
                    name
                    imageUrl
                    nationality
                    handedness
                    description
                    teams {
                        name
                        imageUrl
                    }
                    leaguePlayers {
                        league {
                            name
                            imageUrl
                        }
                        player {
                            name
                            imageUrl
                        }
                    }
                  }
                }`;
                this.graphQLService.post(query).then(data => this.player = Player.fromJson(data.player));
            }
        }
    }

    rankingText(): string {
        return RankingHelper.ordinal(this.ranking);
    }

    ratingPoints(): string {
        return String(this.rating);
    }
}
