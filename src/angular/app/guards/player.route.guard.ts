import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {AuthService} from '../services/auth.service';

@Injectable()
export class PlayerRouteGuard
    implements CanActivate {

    constructor(private authService: AuthService, private router: Router) {
    }

    canActivate() {
        if (this.authService.isNewUser()) {
            this.router.navigate(['player-create'], {replaceUrl: true});
            return false;
        }
        return true;
    }

}
