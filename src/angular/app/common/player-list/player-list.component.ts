import {Component, OnInit, Input} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Player} from '../../../graphql/schemas/Player';
import {GraphQLService} from '../../graphql.service';
import {ListComponent} from '../list.component';

@Component({
    selector: 'player-list',
    templateUrl: 'player-list.component.html'
})
export class PlayerListComponent extends ListComponent implements OnInit {

    @Input() players: Player[];
    @Input() leagueId: string;
    @Input() teamId: string;

    constructor(private router: Router, private service: GraphQLService, route: ActivatedRoute) {
        super(route, `query{
      players{
        displayName, 
        nickname, 
        rating, 
        previousRating
      }
    }`);
    }

    ngOnInit(): void {
        super.ngOnInit();

        if (this.autoLoad) {
            this.service.get(this.query).then((data: any) => {
                this.players = data.players.map(player => Player.fromJson(player)).sort(this.playerSorter.bind(this));
            });
        }
    }

    onPlayerClicked(id: string) {
        this.router.navigate(['players', id]);
    }

    private playerSorter(first: Player, second: Player): number {
        return second.rating - first.rating;
    }
}
