import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {XPCONFIG} from '../app.config';

@Injectable()
export class EditRouteGuard implements CanActivate {

    constructor(private router: Router) {
    }

    canActivate() {
        console.log('EditRouteGuard.canActivate:', XPCONFIG.content && XPCONFIG.content.type);
        if (XPCONFIG.content && XPCONFIG.content.type  == 'com.enonic.app.officeleague:info-page') {
            this.router.navigate([XPCONFIG.content.name], {replaceUrl: true});
            return false;
        }
        return true;
    }

}
