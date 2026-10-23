import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {AuthService} from '../services/auth.service';

export const playerRouteGuard: CanActivateFn = () => {
    if (inject(AuthService).isNewUser()) {
        inject(Router).navigate(['player-create'], {replaceUrl: true});
        return false;
    }
    return true;
};
