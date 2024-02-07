import {Component, OnInit, ViewChild} from '@angular/core';
import {Location} from '@angular/common';
import {AuthService} from './services/auth.service';
import {GraphQLService} from './services/graphql.service';
import {ImageService} from './services/image.service';
import {NavigationStart, Router} from '@angular/router';
import {PageTitleService} from './services/page-title.service';
import {UserProfileService} from './services/user-profile.service';
import {Player} from '../graphql/schemas/Player';
import { filter } from 'rxjs';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
    selector: 'office-league',
    templateUrl: './app.component.html',
    styleUrls: ['app.component.less']
})
export class AppComponent implements OnInit {
    @ViewChild('sidenav') sidenav: MatSidenav;

    private static DEFAULT_TITLE = 'Office League';

    sidenavOpened: boolean = false;
    logoUrl: string;
    isPlayingGame: boolean;
    playerImage: string;
    playerName: string;
    pageTitle: string = "Office League";
    isNewUser: boolean;
    isAuthenticated: boolean;
    displayMenu: boolean;
    isOffline: boolean;
    infoPages: any[];

    constructor(public auth: AuthService,private graphQlService: GraphQLService, private pageTitleService: PageTitleService, private location: Location, private router: Router,
                private userProfileService: UserProfileService) {
        this.logoUrl = ImageService.logoUrl();
        this.isPlayingGame = new RegExp('/games/.*/game-play').test(location.path());
        let user = auth.getUser();
        this.playerImage = !!user ? user.playerImageUrl : ImageService.playerDefault();
        this.playerName = !!user ? user.playerName : '';
        this.isNewUser = auth.isNewUser();
        this.isAuthenticated = auth.isAuthenticated();
        this.isOffline = !navigator.onLine;
        window.addEventListener('offline', () => this.isOffline = true);
        window.addEventListener('online', () => this.isOffline = false);
        window.addEventListener('gesturestart', (e) => e.preventDefault());

        this.pageTitleService.subscribeTitle(title => this.pageTitle = title).setTitle(AppComponent.DEFAULT_TITLE);
        this.userProfileService.subscribePlayer(player => this.updatePlayerProfile(player));

        this.displayMenu = !this.router.navigated || this.isTopLevelPage(this.router.url);

        router.events.pipe(filter((event => event instanceof NavigationStart)))
            .subscribe((event: NavigationStart) => {
                this.isPlayingGame = new RegExp('/games/.*/game-play').test(event.url);
                this.displayMenu = !this.router.navigated || this.isTopLevelPage(event.url);
                this.pageTitleService.resetTitle();
            });
    }

    toggleSidenav(): void {
        this.sidenav.toggle();
        this.sidenavOpened = !this.sidenavOpened;
    }

    ngOnInit(): void {
        this.graphQlService.post(AppComponent.initQuery, {}, data => {
            this.infoPages = data.infoPages || [];
        });
    }

    back(): boolean {
        this.location.back();
        return false;
    }

    home(): boolean {
        if (this.isAuthenticated) {
            this.router.navigate(['']);
        } else {
            this.router.navigate(['leagues']); // TODO go to feed page when ready
        }
        return false;
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
            this.displayMenu = true;
        } else {
            this.playerImage = ImageService.playerDefault();
            this.playerName = '';
        }
    }

    private static readonly initQuery = `query {
      infoPages(first:-1) {
        title,
        name
      }
    }`;
}
