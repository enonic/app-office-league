import {Component, Input, HostListener} from '@angular/core';
import {Player} from '../../../graphql/schemas/Player';
import {BaseComponent} from '../../common/base.component';
import {GraphQLService} from '../../graphql.service';
import {ActivatedRoute, Router} from '@angular/router';
import {RankingHelper} from '../../../graphql/schemas/RankingHelper';

@Component({
    selector: 'player-summary',
    templateUrl: 'player-summary.component.html',
    styleUrls: ['player-summary.component.less']
})
export class PlayerSummaryComponent extends BaseComponent {

    @Input() player: Player;
    @Input() index: number;
    @Input() playerId: string;
    @Input() rating: number = 0;
    @Input() ranking: number = 0;

    @HostListener('click') onClick() {
        this.router.navigate(['players', this.playerId || this.player.name]);
    }

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
                    nickname
                    nationality
                    handedness
                    description
                    teams {
                        name
                    }
                    leaguePlayers {
                        league {
                            name
                        }
                        player {
                            name
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

}
