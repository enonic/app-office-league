import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {Config} from '../app.config';

declare var XPCONFIG: Config;

export const editRouteGuard: CanActivateFn = () => {
    console.log('EditRouteGuard.canActivate:', XPCONFIG.content && XPCONFIG.content.type);
    if (XPCONFIG.content && XPCONFIG.content.type == 'com.enonic.app.officeleague:info-page') {
        inject(Router).navigate([XPCONFIG.content.name], {replaceUrl: true});
        return false;
    }
    return true;
};
