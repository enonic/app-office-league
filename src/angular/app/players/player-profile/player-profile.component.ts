import {Component, Input} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Player} from '../../../graphql/schemas/Player';
import {BaseComponent} from '../../common/base.component';
import {GraphQLService} from '../../graphql.service';

@Component({
    selector: 'player-profile',
    templateUrl: 'player-profile.component.html'
})
export class PlayerProfileComponent extends BaseComponent {

    @Input() player: Player;
    @Input() playerId: string;

    constructor(route: ActivatedRoute, private graphQLService: GraphQLService) {
        super(route);
    }

    ngOnInit(): void {
        let autoLoad = this.route.snapshot.data['autoLoad'],
            id = this.playerId || this.route.snapshot.params['id'];

        if (!this.player && autoLoad && id) {
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

}
