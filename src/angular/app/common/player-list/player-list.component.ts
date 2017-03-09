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

    private static readonly getPlayersQuery = `query($search:String) {
        players(first:-1, search:$search) {
            name
        }
    }`;

    @Input() title: string;
    @Input() players: Player[];
    searchValue: string

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
        this.service.post(PlayerListComponent.getPlayersQuery, {search: this.searchValue}).then((data: any) => {
            this.players = data.players.map(player => Player.fromJson(player));
        });
    }
}
