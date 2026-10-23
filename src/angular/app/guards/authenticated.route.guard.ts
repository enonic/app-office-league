import {inject} from '@angular/core';
import {CanActivateFn} from '@angular/router';
import {AuthService} from '../services/auth.service';

export const authenticatedRouteGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    if (navigator.onLine && !authService.isAuthenticated()) {
        authService.login();
        return false;
    }
    //TODO Redirect to leagues if offline and unauth
    return true;
};
