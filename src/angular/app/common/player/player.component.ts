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
        this.router.navigate(['players', this.playerId || this.player.displayName]);
    }

    constructor(private service: GraphQLService, private router: Router, private route: ActivatedRoute) {
    }

    ngOnInit(): void {
        let autoLoad = this.route.snapshot.data['autoLoad'],
            id = this.playerId || this.route.snapshot.params['id'];

        if (!this.player && autoLoad && id) {
            let query = `query{
          player(name: "${id}") {
            displayName, 
            nickname, 
            rating, 
            previousRating
            games{
              id,
              date,
              displayName,
              winners{
                player{displayName},
                goals  
              },
              losers{
                player{displayName},
                goals
              },
              goals{
                player{displayName},
                time
              }
            }
          }
        }`;
            this.service.get(query).then(data => this.player = Player.fromJson(data.player));
        }
    }

}
