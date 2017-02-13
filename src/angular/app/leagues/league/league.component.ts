import {Component, OnInit, Input} from '@angular/core';
import {GraphQLService} from '../../graphql.service';
import {ActivatedRoute, Router} from '@angular/router';
import {League} from '../../../graphql/schemas/League';
import {BaseComponent} from '../../common/base.component';

@Component({
    selector: 'league',
    templateUrl: 'league.component.html'
})
export class LeagueComponent extends BaseComponent implements OnInit {

    @Input() league: League;

    constructor(protected service: GraphQLService, protected route: ActivatedRoute, protected router: Router) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        let id = this.route.snapshot.params['id'];

        if (!this.league && this.autoLoad && id) {
            this.league = this.service.league || new League(id);
        }
    }

}
