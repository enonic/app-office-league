import {Component, Input} from '@angular/core';
import {GraphQLService} from '../../graphql.service';
import {ActivatedRoute, Router} from '@angular/router';
import {League} from '../../../graphql/schemas/League';
import {BaseComponent} from '../../common/base.component';
import {Player} from '../../../graphql/schemas/Player';
import {Team} from '../../../graphql/schemas/Team';

@Component({
    selector: 'league',
    templateUrl: 'league.component.html',
    styleUrls: ['league.component.less']
})
export class LeagueComponent extends BaseComponent {

    @Input() league: League;

    constructor(protected service: GraphQLService, protected route: ActivatedRoute, protected router: Router) {
        super(route);
    }
}
