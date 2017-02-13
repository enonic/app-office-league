import {Injectable} from '@angular/core';
import {CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {AuthService} from './auth.service';
import {Observable} from 'rxjs';

@Injectable()
export class AuthRouteGuard implements CanActivate, CanActivateChild {

    constructor(private authService: AuthService) {
    }

    canActivate() {
        if (this.authService.isAuthenticated()) {
            return true;
        }
        this.authService.login();
        return false;
    }

    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean>|Promise<boolean>|boolean {
        return true;
    }

}
