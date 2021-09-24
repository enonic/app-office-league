import {Injectable} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ConfigUser, Config} from '../app.config';
import {UserProfileService} from './user-profile.service';
import {Player} from '../../graphql/schemas/Player';

declare var XPCONFIG: Config;

@Injectable()
export class AuthService {

    private user: ConfigUser;

    constructor(private activatedRoute: ActivatedRoute, private userProfileService: UserProfileService) {
        this.user = XPCONFIG.user;
        this.userProfileService.subscribePlayer(player => this.updatePlayerProfile(player));
    }

    public login() {
        this.navigateToUrl(XPCONFIG.loginUrl);
        return false;
    }

    public isNewUser(): boolean {
        return this.user && !this.user.playerId;
    }

    public isAuthenticated() {
        return !!this.user;
    }

    public isSystemAdmin() {
        return this.user && this.user.isAdmin;
    }

    public getUser(): ConfigUser {
        return this.user;
    }

    public logout() {
        this.navigateToUrl(XPCONFIG.logoutUrl);
        return false;
    }

    public logoutToMarketingPage() {
        this.navigateToUrl(XPCONFIG.logoutMarketingUrl);
        return false;
    }

    private navigateToUrl(url: string) {
        window.location.href = url;
    }

    private getCurrentUrl(): string {
        return XPCONFIG.baseHref + '/' + this.activatedRoute.snapshot.url.join('/');
    }

    private updatePlayerProfile(player: Player) {
        if (!this.isAuthenticated() || !player) {
            return;
        }
        if (player) {
            this.user.playerName = player.name;
            this.user.playerImageUrl = player.imageUrl;
        }
    }
}
