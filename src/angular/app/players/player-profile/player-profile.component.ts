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

    //TODO search by id is more efficient
    private static readonly getPlayerQuery = `query($name: String){
        player(name: $name) {
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

    @Input() player: Player;

    constructor(route: ActivatedRoute, private graphQLService: GraphQLService) {
        super(route);
    }

    ngOnInit(): void {
        let id = this.route.snapshot.params['id'];

        //TODO Player name defined as player id. Fix
        this.graphQLService.post(PlayerProfileComponent.getPlayerQuery, {name: id}).
            then(data => this.player = Player.fromJson(data.player));
        

    }

}
