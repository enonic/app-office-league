import {Component, OnInit, Input} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {League} from '../../../graphql/schemas/League';
import {ListComponent} from '../../common/list.component';

@Component({
    selector: 'league-list',
    templateUrl: 'league-list.component.html',
    styleUrls: ['league-list.component.less']
})
export class LeagueListComponent extends ListComponent implements OnInit {

    @Input() leagues: League[];

    constructor(route: ActivatedRoute, private router: Router) {
        super(route);
    }

    onLeagueClicked(league: League, event: MouseEvent) {
        event.stopPropagation();
        event.preventDefault();

        this.router.navigate(['leagues', league.name.toLowerCase()]);
    }
}
