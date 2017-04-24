import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {AuthService} from '../services/auth.service';

@Injectable()
export class AuthenticatedRouteGuard implements CanActivate {

    constructor(private authService: AuthService) {
    }

    canActivate() {
        if (navigator.onLine && !this.authService.isAuthenticated()) {
            this.authService.login();
            return false;
        }
        //TODO Redirect to leagues if offline and unauth
        return true;
    }

}
