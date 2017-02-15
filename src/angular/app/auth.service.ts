import {Injectable} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

declare var XPCONFIG: any;

@Injectable()
export class AuthService {

    private user: any = XPCONFIG.user;

    constructor(private activatedRoute: ActivatedRoute) {
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
