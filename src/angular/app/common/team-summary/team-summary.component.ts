import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {BaseComponent} from '../../common/base.component';
import {GraphQLService} from '../../graphql.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Team} from '../../../graphql/schemas/Team';
import {RankingHelper} from '../../../graphql/schemas/RankingHelper';

@Component({
    selector: 'team-summary',
    templateUrl: 'team-summary.component.html'
})
export class TeamSummaryComponent extends BaseComponent {

    @Input() team: Team;
    @Input() index: number;
    @Input() rating: number = 0;
    @Input() ranking: number = 0;
    @Input() showPoints: boolean;
    @Output() rankingClicked: EventEmitter<void> = new EventEmitter<void>();

    constructor(route: ActivatedRoute, protected service: GraphQLService, protected router: Router) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();
        
        let name = this.route.snapshot.params['name'];

        if (!this.team && name) {
            // check if the team was passed from list to spare request
            this.team = this.service.team;
            if (!this.team) {
                // no team was passed because this was probably a page reload
                let query = `query {
                    team(name: "${name}") {
                        id,
                        name,
                        description,
                        players {
                            name
                        },
                        leagueTeams {
                            league {
                                name
                            },
                            team {
                                name
                            }
                        }
                    }
                }`;
                this.service.post(query).then(data => this.team = Team.fromJson(data.team));
            }
        }
    }

    rankingText(): string {
        return RankingHelper.ordinal(this.ranking);
    }

    ratingPoints(): string {
        return String(this.rating);
    }

    onRankingClicked(event) {
        event.stopPropagation();
        console.log('ranking click');
        this.notifyRankingClick();
    }

    private notifyRankingClick() {
        this.rankingClicked.emit();
    }
}
