import {Component, Input} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {League} from '../../../graphql/schemas/League';
import {BaseComponent} from '../../common/base.component';
import {RankingHelper} from '../../../graphql/schemas/RankingHelper';

@Component({
    selector: 'league-summary',
    templateUrl: 'league-summary.component.html',
    styleUrls: ['league-summary.component.less']
})
export class LeagueSummaryComponent
    extends BaseComponent {

    @Input() league: League;
    @Input() rating: number = 0;
    @Input() ranking: number = 0;

    constructor(route: ActivatedRoute) {
        super(route);
    }

    rankingText(): string {
        return RankingHelper.ordinal(this.ranking);
    }

    ratingPoints(): string {
        return String(this.rating);
    }
}
