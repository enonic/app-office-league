import {Component, Input} from '@angular/core';
import {GraphQLService} from '../../graphql.service';
import {ActivatedRoute, Router} from '@angular/router';
import {League} from '../../../graphql/schemas/League';
import {BaseComponent} from '../../common/base.component';
import {Player} from '../../../graphql/schemas/Player';
import {Team} from '../../../graphql/schemas/Team';

@Component({
    selector: 'league-summary',
    templateUrl: 'league-summary.component.html',
    styleUrls: ['league-summary.component.less']
})
export class LeagueSummaryComponent extends BaseComponent {

    @Input() league: League;

    constructor(route: ActivatedRoute) {
        super(route);
    }
}
