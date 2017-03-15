import {Component} from '@angular/core';
import {Location} from '@angular/common';
import {AuthService} from './auth.service';
import {ImageService} from './image.service';

@Component({
    selector: 'office-league',
    templateUrl: './app.component.html',
    styleUrls: ['app.component.less']
})
export class AppComponent {
    private logoUrl: string;

    constructor(private auth: AuthService, private location: Location) {
        this.logoUrl = ImageService.logoUrl();
    }
}