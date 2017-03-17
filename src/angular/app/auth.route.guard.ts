import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {AuthService} from './auth.service';
import {Observable} from 'rxjs';

@Injectable()
export class AuthRouteGuard implements CanActivate {

    constructor(private authService: AuthService, private router: Router) {
    }

    canActivate() {
        if (this.authService.isNewUser()) {
            this.router.navigate(['player-create']);
            return false;
        }
        return true;
    }

}
