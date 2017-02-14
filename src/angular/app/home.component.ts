import {Component} from '@angular/core';
import {AuthService} from './auth.service';

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['home.component.less']
})
export class HomeComponent {

    constructor(public auth: AuthService) {

    }
}