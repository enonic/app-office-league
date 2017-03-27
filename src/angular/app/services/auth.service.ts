import {Injectable} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {XPCONFIG} from '../app.config';
import {SessionInfo, ConfigUser} from '../app.session';
import {SessionService} from './session.service';

@Injectable()
export class AuthService {

    constructor(private activatedRoute: ActivatedRoute, private sessionService: SessionService) {
    }

    public login() {
        let sessionInfo: SessionInfo = this.sessionService.getSessionInfo();
        if (sessionInfo) {
            this.navigateToUrl(sessionInfo.loginUrl);
        }
        return false;
    }

    public isNewUser(): boolean {
        let sessionInfo: SessionInfo = this.sessionService.getSessionInfo();
        if (sessionInfo) {
            return sessionInfo.user && !sessionInfo.user.playerId;
        }
        return false;
    }

    public isAuthenticated() {
        let sessionInfo: SessionInfo = this.sessionService.getSessionInfo();
        if (sessionInfo) {
            return !!sessionInfo.user;
        }
        return false;
    }

    public getUser(): ConfigUser {
        let sessionInfo: SessionInfo = this.sessionService.getSessionInfo();
        if (sessionInfo) {
            return sessionInfo.user;
        }
        return null;
    }

    public getPlayerId(): string {
        let user= this.getUser();
        return user && user.playerId;
    }

    public logout() {
        let sessionInfo: SessionInfo = this.sessionService.getSessionInfo();
        if (sessionInfo) {
            this.navigateToUrl(sessionInfo.logoutUrl);
        }
        return false;
    }

    private navigateToUrl(url: string) {
        window.location.href = url;
    }

    private getCurrentUrl(): string {
        return XPCONFIG.baseHref + '/' + this.activatedRoute.snapshot.url.join('/');
    }

}
