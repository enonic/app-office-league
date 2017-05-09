import {Component} from '@angular/core';
import {Location} from '@angular/common';
import {AuthService} from './services/auth.service';
import {ImageService} from './services/image.service';
import {NavigationStart, Router} from '@angular/router';
import {PageTitleService} from './services/page-title.service';
import {UserProfileService} from './services/user-profile.service';
import {Player} from '../graphql/schemas/Player';

@Component({
    selector: 'office-league',
    templateUrl: './app.component.html',
    styleUrls: ['app.component.less']
})
export class AppComponent {
    logoUrl: string;
    isPlayingGame: boolean;
    playerImage: string;
    playerName: string;
    pageTitle: string;
    isNewUser: boolean;
    isAuthenticated: boolean;
    displayMenu: boolean;

    constructor(public auth: AuthService, private pageTitleService: PageTitleService, private location: Location, private router: Router,
                private userProfileService: UserProfileService) {
        this.logoUrl = ImageService.logoUrl();
        this.isPlayingGame = new RegExp('/games/.*/game-play').test(location.path());
        let user = auth.getUser();
        this.playerImage = !!user ? user.playerImageUrl : ImageService.playerDefault();
        this.playerName = !!user ? user.playerName : '';
        this.isNewUser = auth.isNewUser();
        this.isAuthenticated = auth.isAuthenticated();

        this.pageTitleService.subscribeTitle(title => this.pageTitle = title).resetTitle();
        this.userProfileService.subscribePlayer(player => this.updatePlayerProfile(player));

        this.displayMenu = !this.router.navigated || this.isTopLevelPage(this.router.url);

        router.events
            .filter(event => event instanceof NavigationStart)
            .subscribe((event: NavigationStart) => {
                this.isPlayingGame = new RegExp('/games/.*/game-play').test(event.url);
                this.displayMenu = !this.router.navigated || this.isTopLevelPage(event.url);
                this.pageTitleService.resetTitle();
            });
    }

    private isTopLevelPage(url: string): boolean {
        return url.match(/\//g).length <= 1;
    }

    private updatePlayerProfile(player: Player) {
        if (player) {
            this.playerImage = player.imageUrl;
            this.playerName = player.name;
            this.isNewUser = false;
            this.isAuthenticated = true;
            this.displayMenu = false;
            setTimeout(() => this.displayMenu = true, 100); // hack to force refresh materialize SideNav menu
        } else {
            this.playerImage = ImageService.playerDefault();
            this.playerName = '';
        }
    }
}