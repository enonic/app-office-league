import {Component, Input, OnInit} from '@angular/core';
import {GraphQLService} from '../../graphql.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Player} from '../../../graphql/schemas/Player';

@Component({
    selector: 'team-players',
    templateUrl: 'team-players.component.html'
})
export class TeamPlayersComponent implements OnInit {

    @Input() players: Player[];
    @Input() responsive: boolean = true;
    private responsiveClass: string;

    constructor(protected service: GraphQLService, protected route: ActivatedRoute, protected router: Router) {
    }

    ngOnInit(): void {
        let l = this.players ? this.players.length : 0;
        if (this.responsive) {
            let colSpanSm = this.calcSpanForCols(l, 1),
                colSpanMd = this.calcSpanForCols(l, 2),
                colSpanLg = this.calcSpanForCols(l, 4);

            this.responsiveClass = `col-sm-${colSpanSm} col-md-${colSpanMd} col-lg-${colSpanLg}`;
        }
    }

    private calcSpanForCols(cols: number, max: number): number {
        return 12 / Math.min(Math.max(cols, 1), max);
    }

}
