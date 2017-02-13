import {Component, Input} from '@angular/core';

@Component({
    selector: 'rating',
    templateUrl: 'rating.component.html',
    styleUrls: ['rating.component.less']
})
export class RatingComponent {
    @Input() rating: number = -1;
    @Input() previousRating: number = -1;
    private DRAMATIC_THRESHOLD = 5;

    isRising(): boolean {
        return this.rating > this.previousRating;
    }

    isDramatically(): boolean {
        return Math.abs(this.rating - this.previousRating) >= this.DRAMATIC_THRESHOLD;
    }
}
