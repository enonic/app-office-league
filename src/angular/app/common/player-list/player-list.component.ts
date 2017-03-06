import {Component, Input, SimpleChanges} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {BaseComponent} from '../../common/base.component';
import {Player} from '../../../graphql/schemas/Player';
import {GraphQLService} from '../../graphql.service';

@Component({
    selector: 'player-list',
    templateUrl: 'player-list.component.html'
})
export class PlayerListComponent extends BaseComponent {

    private static readonly getPlayersQuery = `query {
        players(count:-1) {
            name
        }
    }`;
    
    @Input() title: string;
    @Input() players: Player[];
    @Input() detailsPath: string[];

    constructor(private router: Router, private service: GraphQLService, route: ActivatedRoute) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        console.log('this.players' + this.players);
        if (this.players === undefined) {
            this.loadPlayers();
        }
    }

    onPlayerClicked(player: Player) {
        this.router.navigate(['players', player.name.toLowerCase()]);
    }
    
    onDetailsClicked() {
        this.router.navigate(this.detailsPath);
    }

    private loadPlayers() {
        this.service.post(PlayerListComponent.getPlayersQuery).then((data: any) => {
            this.players = data.players.map(player => Player.fromJson(player));
        });
    }
}
