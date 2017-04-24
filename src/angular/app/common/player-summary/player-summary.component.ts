import {Component, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {Player} from '../../../graphql/schemas/Player';
import {BaseComponent} from '../base.component';
import {GraphQLService} from '../../services/graphql.service';
import {ActivatedRoute} from '@angular/router';
import {RankingHelper} from '../../../graphql/schemas/RankingHelper';
import {AuthService} from '../../services/auth.service';

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
    @Input() allowRemove: boolean;
    @Input() pendingApproval: boolean;
    @Output() removePlayer: EventEmitter<Player> = new EventEmitter<Player>();
    @Output() approvePlayer: EventEmitter<Player> = new EventEmitter<Player>();
    isCurrentPlayer: boolean;

    constructor(route: ActivatedRoute, private graphQLService: GraphQLService, private authService: AuthService) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        let id = this.playerId || this.route.snapshot.params['id'];
        let currentPlayerId = this.authService.isAuthenticated() ? this.authService.getUser().playerId : '-1';
        this.isCurrentPlayer = currentPlayerId === (id || this.player && this.player.id);

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
                this.graphQLService.post(query).then(data => {
                    this.player = Player.fromJson(data.player);
                    this.isCurrentPlayer = currentPlayerId === this.player.id;
                });
            }
        }
    }

    rankingText(): string {
        return this.pendingApproval ? '-' : RankingHelper.ordinal(this.ranking);
    }

    ratingPoints(): string {
        return this.pendingApproval ? '-' : String(this.rating);
    }

    onRemoveClicked(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.removePlayer.emit(this.player);
    }

    onApproveClicked(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.approvePlayer.emit(this.player);
    }
}
