import {Component} from '@angular/core';
import {ImageService} from './services/image.service';
import {AuthService} from './services/auth.service';

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['home.component.less']
})
export class HomeComponent {
    homeLogoImage: string;

    constructor(public auth: AuthService) {
        this.homeLogoImage = ImageService.homeLogoUrl();
    }
}