import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
    standalone: false,
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'loading',
    templateUrl: 'loading.component.html',
    styleUrls: ['loading.component.less']
})
export class LoadingComponent {

    constructor() {
    }
}
