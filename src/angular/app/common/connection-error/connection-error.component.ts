import {Component} from '@angular/core';
import {Router} from '@angular/router';

@Component({
    selector: 'connection-error',
    templateUrl: 'connection-error.component.html',
    styleUrls: ['connection-error.component.less']
})
export class ConnectionErrorComponent {

    offline: boolean;

    constructor(private router: Router) {
        this.offline = !navigator.onLine;
    }

    reload(): boolean {
        this.router.navigate(['']);
        return false;
    }
}
