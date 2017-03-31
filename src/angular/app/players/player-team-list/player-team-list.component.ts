import {Component} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {BaseComponent} from '../../common/base.component';
import {Player} from '../../../graphql/schemas/Player';
import {Team} from '../../../graphql/schemas/Team';
import {GraphQLService} from '../../services/graphql.service';

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
            imageUrl
            teamsConnection(after:$after, first:$first) {
                totalCount
                edges {
                    node {
                        id
                        name
                        imageUrl
                        description
                        players {
                            id
                            name
                            imageUrl
                        }
                    }
                }                
            }
        }
    }`;

    private playerName: string;
    public player: Player;
    private teams: Team[];
    private pageCount: number = 1;

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
        this.service.post(
            PlayerTeamListComponent.getPlayerQuery,
            {name: this.playerName, after: after, first:PlayerTeamListComponent.paging },
            data => {
                this.player = Player.fromJson(data.player);
                this.teams = data.player.teamsConnection.edges.map(edge => Team.fromJson(edge.node));
                let totalCount = data.player.teamsConnection.totalCount;
                this.pageCount = Math.floor((totalCount == 0 ? 0: totalCount - 1) / PlayerTeamListComponent.paging) + 1;
            }
        );
    }
}
