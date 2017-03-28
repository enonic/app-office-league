import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {AuthService} from '../services/auth.service';

@Injectable()
export class AuthenticatedRouteGuard implements CanActivate {

    constructor(private authService: AuthService) {
    }

    canActivate() {
        if (!this.authService.isAuthenticated()) {
            this.authService.login();
            return false;
        }
        return true;
    }

}
