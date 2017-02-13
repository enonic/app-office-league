import {Component, OnInit} from '@angular/core';
import {GraphQLService} from '../../graphql.service';
import {ActivatedRoute, Router} from '@angular/router';
import {LeagueComponent} from '../league/league.component';

@Component({
    selector: 'league-profile',
    templateUrl: 'league-profile.component.html'
})
export class LeagueProfileComponent extends LeagueComponent implements OnInit {

    constructor(service: GraphQLService, route: ActivatedRoute, router: Router) {
        super(service, route, router);
    }

}
