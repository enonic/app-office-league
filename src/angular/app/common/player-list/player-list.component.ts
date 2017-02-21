import {Component, OnInit, Input, SimpleChanges} from '@angular/core';
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
    @Input() indexed: boolean = true;
    @Input() leagueId: string;
    @Input() teamId: string;

    constructor(private router: Router, private service: GraphQLService, route: ActivatedRoute) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        if (this.autoLoad) {
            this.loadPlayers(this.leagueId);
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);

        let leagueIdChanges = changes['leagueId'];
        if (leagueIdChanges && leagueIdChanges.currentValue) {
            this.loadPlayers(leagueIdChanges.currentValue)
        }
    }

    onPlayerClicked(id: string) {
        this.router.navigate(['players', id]);
    }

    private playerSorter(first: Player, second: Player): number {
        return second.name.localeCompare(first.name);
    }

    private loadPlayers(leagueId: string) {
        this.service.post(this.getQuery(leagueId)).then((data: any) => {
            this.players = data.players.map(player => Player.fromJson(player)).sort(this.playerSorter.bind(this));
        });
    }

    private getQuery(leagueId: string): string {
        return `query{
                  players{
                    id,
                    name, 
                    nickname, 
                    nationality, 
                    handedness,
                    description,
                    teams {
                        name
                    },
                    leaguePlayers {
                        league {
                            name
                        },
                        player {
                            name
                        }
                    }
                  }
                }`
    }
}
