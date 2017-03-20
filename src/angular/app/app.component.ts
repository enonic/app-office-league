import {Component} from '@angular/core';
import {Location} from '@angular/common';
import {AuthService} from './auth.service';
import {ImageService} from './image.service';
import {Router, NavigationStart} from '@angular/router';

@Component({
    selector: 'office-league',
    templateUrl: './app.component.html',
    styleUrls: ['app.component.less']
})
export class AppComponent {
    logoUrl: string;
    isPlayingGame: boolean;
    playerImage: string;

    constructor(private auth: AuthService, private location: Location, private router: Router) {
        this.logoUrl = ImageService.logoUrl();
        this.isPlayingGame = new RegExp('/games/.*/game-play').test(location.path());
        let user = auth.getUser();
        this.playerImage = !!user ? ImageService.forPlayer(user.playerName) : ImageService.playerDefault();

        router.events
            .filter(event => event instanceof NavigationStart)
            .subscribe((event: NavigationStart) => {
                this.isPlayingGame = new RegExp('/games/.*/game-play').test(event.url);
            });
    }
}