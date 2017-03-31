import {Component, Input, OnInit, SimpleChanges} from '@angular/core';

@Component({
    selector: 'rating-points',
    templateUrl: 'rating-points.component.html',
    styleUrls: ['rating-points.component.less']
})
export class RatingPointsComponent
    implements OnInit {

    @Input() points: number;
    ratingText: string;
    ratingIcon: string;

    constructor() {
    }

    ngOnInit(): void {
        this.ratingText = this.points === null ? '' : Math.abs(this.points).toString();
        this.ratingIcon = this.points === 0 ? '&harr;' : this.points > 0 ? '&uarr;' : '&darr;';
    }
}