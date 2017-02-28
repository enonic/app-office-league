import {Component, Input} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {League} from '../../../graphql/schemas/League';
import {BaseComponent} from '../../common/base.component';

@Component({
    selector: 'league-summary',
    templateUrl: 'league-summary.component.html',
    styleUrls: ['league-summary.component.less']
})
export class LeagueSummaryComponent extends BaseComponent {

    @Input() league: League;
    @Input() rating: number = 0;
    @Input() ranking: number = 0;

    constructor(route: ActivatedRoute) {
        super(route);
    }

    rankingText(): string {
        return this.ordinal(this.ranking);
    }

    private ordinal(value: number) {
        if (!value) {
            return '';
        }
        switch (value) {
        case 1:
            return '1st';
        case 2:
            return '2nd';
        case 3:
            return '3rd';
        default:
            return value + 'th';
        }
    };
}
