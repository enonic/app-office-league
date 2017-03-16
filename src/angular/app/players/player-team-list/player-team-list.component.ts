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
    private static readonly getPlayerQuery = `query($name: String, $after:Int,$first:Int) {
        player(name:$name) {
            name
            teamsConnection(after:$after, first:$first) {
                totalCount
                edges {
                    node {
                        id
                        name
                        description
                        players {
                            id
                            name
                        }
                    }
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
        this.refresh();
    }

    private refresh(currentPage: number = 1) {
        let after = currentPage > 1 ? ((currentPage - 1) * PlayerTeamListComponent.paging - 1) : undefined;
        this.service.post(PlayerTeamListComponent.getPlayerQuery,{name: this.playerName, after: after, first:PlayerTeamListComponent.paging }).
            then((data: any) => {
                this.player = Player.fromJson(data.player);
                this.teams = data.player.teamsConnection.edges.map(edge => Team.fromJson(edge.node));
                
                this.pages = [];
                let totalCount = data.player.teamsConnection.totalCount;
                let pagesCount = (totalCount == 0 ? 0: totalCount - 1) / PlayerTeamListComponent.paging + 1;
                for (var i = 1; i <= pagesCount; i++) {
                    this.pages.push(i);
                }
            });
    }
}
