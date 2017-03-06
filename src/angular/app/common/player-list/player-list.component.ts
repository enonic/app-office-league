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

    @Input() title: string;
    @Input() players: Player[];
    @Input() indexed: boolean = true;
    @Input() leagueId: string;
    @Input() teamId: string;
    @Input() detailsPath: string[];

    constructor(private router: Router, private service: GraphQLService, route: ActivatedRoute) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        if (this.players === undefined) {
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

    onPlayerClicked(player: Player) {
        this.router.navigate(['players', player.name.toLowerCase()]);
    }
    
    onDetailsClicked() {
        this.router.navigate(this.detailsPath);
    }

    private playerSorter(first: Player, second: Player): number {
        return second.name.localeCompare(first.name);
    }

    private loadPlayers(leagueId: string) {
        this.service.post(this.getQuery(leagueId)).then((data: any) => {
            this.players = data.members.map(player => Player.fromJson(player)).sort(this.playerSorter.bind(this));
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
