import {Injectable} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {XPCONFIG, ConfigUser} from './app.config';

@Injectable()
export class AuthService {

    private user: ConfigUser;

    constructor(private activatedRoute: ActivatedRoute) {
        this.user = XPCONFIG.user;
    }

    public login() {
        console.log(`Going away to login page: ${XPCONFIG.loginUrl}`);
        window.location.href = XPCONFIG.loginUrl;
    }

    public isAuthenticated() {
        return !!this.user;
    }

    public getUser(): any {
        return this.user;
    }

    public logout() {
        console.log(`Going away to logout page: ${XPCONFIG.logoutUrl}`);
        window.location.href = XPCONFIG.logoutUrl;
    }

    private getCurrentUrl(): string {
        return XPCONFIG.baseHref + '/' + this.activatedRoute.snapshot.url.join('/');
    }

}
