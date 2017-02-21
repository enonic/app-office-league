import {Component, Input} from '@angular/core';
import {GraphQLService} from '../../graphql.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Player} from '../../../graphql/schemas/Player';

@Component({
    selector: 'team-players',
    templateUrl: 'team-players.component.html',
    styleUrls: ['team-players.component.less']
})
export class TeamPlayersComponent {

    @Input() players: Player[];

    constructor(protected service: GraphQLService, protected route: ActivatedRoute, protected router: Router) {
    }

}
