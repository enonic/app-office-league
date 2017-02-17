import {Location} from '@angular/common';
import {Injectable} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {XPCONFIG, ConfigUser} from './app.config';

@Injectable()
export class AuthService {

    private user: ConfigUser;

    constructor(private activatedRoute: ActivatedRoute, private location: Location) {
        this.user = XPCONFIG.user;
    }

    public login() {
        this.navigateToUrl(XPCONFIG.loginUrl);
    }

    public isAuthenticated() {
        return !!this.user;
    }

    public getUser(): any {
        return this.user;
    }

    public logout() {
        this.navigateToUrl(XPCONFIG.logoutUrl);
    }

    private navigateToUrl(url: string) {
        console.log(`Going away to url: ${url}`);
        this.location.go(url, 'redirect=' + this.getCurrentUrl());
    }

    private getCurrentUrl(): string {
        return XPCONFIG.baseHref + '/' + this.activatedRoute.snapshot.url.join('/');
    }

}
