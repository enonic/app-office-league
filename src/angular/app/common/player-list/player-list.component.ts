import {Component, Input, SimpleChanges} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {BaseComponent} from '../../common/base.component';
import {Player} from '../../../graphql/schemas/Player';
import {GraphQLService} from '../../graphql.service';
import {MaterializeDirective} from 'angular2-materialize/dist/index';

@Component({
    selector: 'player-list',
    templateUrl: 'player-list.component.html'
})
export class PlayerListComponent extends BaseComponent {

    private static readonly paging = 10;
    private static readonly getPlayersQuery = `query($first:Int, $search:String) {
        players(first:$first, search:$search) {
            name
        }
    }`;

    @Input() title: string;
    @Input() players: Player[];
    searchValue: string
    private currentPage = 1;
    private pages = [1, 2, 3, 4, 5];

    constructor(private router: Router, private service: GraphQLService, route: ActivatedRoute) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        if (this.players === undefined) {
            this.refreshData();
        }
    }

    onPlayerClicked(player: Player) {
        this.router.navigate(['players', player.name.toLowerCase()]);
    }

    onSearchFieldModified() {
        this.refreshData();
    }

    private refreshData() {
        this.service.post(PlayerListComponent.getPlayersQuery, {first: PlayerListComponent.paging, search: this.searchValue}).then((data: any) => {
            this.players = data.players.map(player => Player.fromJson(player));
        });
    }
}
