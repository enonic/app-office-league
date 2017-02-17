import {Component, OnInit, Input, HostListener} from '@angular/core';
import {Player} from '../../../graphql/schemas/Player';
import {GraphQLService} from '../../graphql.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
    selector: 'player',
    templateUrl: 'player.component.html',
    styleUrls: ['player.component.less']
})
export class PlayerComponent implements OnInit {

    @Input() player: Player;
    @Input() index: number;
    @Input() playerId: string;

    @HostListener('click') onClick() {
        this.router.navigate(['players', this.playerId || this.player.name]);
    }

    constructor(private service: GraphQLService, private router: Router, private route: ActivatedRoute) {
    }

    ngOnInit(): void {
        let autoLoad = this.route.snapshot.data['autoLoad'],
            id = this.playerId || this.route.snapshot.params['id'];

        if (!this.player && autoLoad && id) {
            // check if the team was passed from list to spare request
            this.player = this.service.player;
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
                this.service.post(query).then(data => this.player = Player.fromJson(data.player));
            }
        }
    }

}
