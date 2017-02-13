import {Component, OnInit} from '@angular/core';
import {GraphQLService} from '../../graphql.service';
import {ActivatedRoute, Router} from '@angular/router';
import {TeamComponent} from '../team/team.component';

@Component({
    selector: 'team-profile',
    templateUrl: 'team-profile.component.html'
})
export class TeamProfileComponent extends TeamComponent implements OnInit {

    constructor(service: GraphQLService, route: ActivatedRoute, router: Router) {
        super(service, route, router);
    }

}
