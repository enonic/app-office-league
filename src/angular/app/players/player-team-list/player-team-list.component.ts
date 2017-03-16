import {Component, Input, SimpleChanges} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {BaseComponent} from '../../common/base.component';
import {Player} from '../../../graphql/schemas/Player';
import {Team} from '../../../graphql/schemas/Team';
import {GraphQLService} from '../../graphql.service';
import {MaterializeDirective} from 'angular2-materialize/dist/index';

@Component({
    selector: 'player-team-list',
    templateUrl: 'player-team-list.component.html',
    styleUrls: ['player-team-list.component.less']
})
export class PlayerTeamListComponent extends BaseComponent {
    private static readonly paging = 10;
    private static readonly getPlayerQuery = `query($name: String) {
        player(name:$name) {
            name
            teams(first:-1) {
                id
                name
                description
                players {
                    id
                    name
                }
            }
        }
    }`;

    private playerName: string;
    private player: Player;
    private teams: Team[];
    private pages = [1];

    constructor(private router: Router, private service: GraphQLService, route: ActivatedRoute) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.playerName = this.route.snapshot.params['name'];
        this.refreshData();
    }

    private refreshData(currentPage: number = 1, search: string = '') {
        //let after = currentPage > 1 ? ((currentPage - 1) * PlayerListPageComponent.paging - 1) : undefined;
        this.service.post(PlayerTeamListComponent.getPlayerQuery,{name: this.playerName}).
            then((data: any) => {
                this.player = Player.fromJson(data.player);
                this.teams = data.player.teams.map((team) => Team.fromJson(team));
                //this.pages = [];
                //let pagesCount = data.playersConnection.totalCount / PlayerListPageComponent.paging + 1;
                //for (var i = 1; i <= pagesCount; i++) {
                //    this.pages.push(i);
                //}
            });
    }
}
